package tasks

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"monad/models"
)

const maxHTTPResponseBytes = 1 << 20

type httpRequestPayload struct {
	Method  string            `json:"method"`
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers"`
	Body    json.RawMessage   `json:"body"`
}

func ExecuteHTTPRequest(ctx context.Context, msg models.TaskMessage) ([]byte, error) {
	var payload httpRequestPayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return nil, err
	}

	payload.Method = strings.ToUpper(strings.TrimSpace(payload.Method))
	if payload.Method == "" {
		payload.Method = http.MethodGet
	}
	if payload.URL == "" {
		return nil, fmt.Errorf("http-request url is required")
	}

	parsedURL, err := url.Parse(payload.URL)
	if err != nil {
		return nil, err
	}
	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return nil, fmt.Errorf("http-request only supports http and https URLs")
	}

	var body io.Reader
	if len(bytes.TrimSpace(payload.Body)) > 0 && !bytes.Equal(bytes.TrimSpace(payload.Body), []byte("null")) {
		body = bytes.NewReader(payload.Body)
	}

	requestCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	request, err := http.NewRequestWithContext(
		requestCtx,
		payload.Method,
		parsedURL.String(),
		body,
	)
	if err != nil {
		return nil, err
	}

	for key, value := range payload.Headers {
		request.Header.Set(key, value)
	}
	if body != nil && request.Header.Get("Content-Type") == "" {
		request.Header.Set("Content-Type", "application/json")
	}

	client := http.Client{
		Timeout: 15 * time.Second,
	}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	responseBody, err := io.ReadAll(io.LimitReader(response.Body, maxHTTPResponseBytes))
	if err != nil {
		return nil, err
	}

	var parsedBody any
	if err := json.Unmarshal(responseBody, &parsedBody); err != nil {
		parsedBody = string(responseBody)
	}

	return json.Marshal(map[string]any{
		"status_code": response.StatusCode,
		"headers":     response.Header,
		"body":        parsedBody,
	})
}
