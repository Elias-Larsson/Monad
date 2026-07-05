package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"monad/models"
)

type jsonTransformPayload struct {
	Input  json.RawMessage   `json:"input"`
	Pick   string            `json:"pick"`
	As     string            `json:"as"`
	Fields map[string]string `json:"fields"`
}

func ExecuteJSONTransform(ctx context.Context, msg models.TaskMessage) ([]byte, error) {
	_ = ctx

	var payload jsonTransformPayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return nil, err
	}
	if len(payload.Input) == 0 {
		return nil, fmt.Errorf("json-transform input is required")
	}

	var input any
	if err := json.Unmarshal(payload.Input, &input); err != nil {
		return nil, err
	}

	if len(payload.Fields) > 0 {
		output := map[string]any{}
		for outputKey, path := range payload.Fields {
			value, err := valueAtPath(input, path)
			if err != nil {
				return nil, err
			}
			output[outputKey] = value
		}

		return json.Marshal(output)
	}

	if payload.Pick != "" {
		value, err := valueAtPath(input, payload.Pick)
		if err != nil {
			return nil, err
		}

		outputKey := payload.As
		if outputKey == "" {
			outputKey = "value"
		}

		return json.Marshal(map[string]any{
			outputKey: value,
		})
	}

	return json.Marshal(input)
}

func valueAtPath(input any, path string) (any, error) {
	if strings.TrimSpace(path) == "" {
		return input, nil
	}

	current := input
	for _, part := range strings.Split(path, ".") {
		switch value := current.(type) {
		case map[string]any:
			next, ok := value[part]
			if !ok {
				return nil, fmt.Errorf("json-transform path %q was not found", path)
			}
			current = next
		case []any:
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(value) {
				return nil, fmt.Errorf("json-transform array path %q was not found", path)
			}
			current = value[index]
		default:
			return nil, fmt.Errorf("json-transform path %q cannot continue through %T", path, current)
		}
	}

	return current, nil
}
