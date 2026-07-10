package workflow

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestResolveTaskPayload(t *testing.T) {
	template := json.RawMessage(`{
		"message": {"$previous": "body.title"},
		"metadata": {
			"status": {"$previous": "status_code"},
			"tags": [{"$previous": "body.tags.1"}]
		}
	}`)
	previous := json.RawMessage(`{
		"status_code": 200,
		"body": {"title": "Monad", "tags": ["go", "rabbitmq"]}
	}`)

	resolved, err := ResolveTaskPayload(template, previous)
	if err != nil {
		t.Fatalf("ResolveTaskPayload() error = %v", err)
	}

	var got any
	if err := json.Unmarshal(resolved, &got); err != nil {
		t.Fatalf("unmarshal resolved payload: %v", err)
	}

	want := map[string]any{
		"message": "Monad",
		"metadata": map[string]any{
			"status": float64(200),
			"tags":   []any{"rabbitmq"},
		},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ResolveTaskPayload() = %#v, want %#v", got, want)
	}
}

func TestResolveTaskPayloadUsesCompletePreviousOutput(t *testing.T) {
	template := json.RawMessage(`{"input":{"$previous":""}}`)
	previous := json.RawMessage(`{"name":"Ada","active":true}`)

	resolved, err := ResolveTaskPayload(template, previous)
	if err != nil {
		t.Fatalf("ResolveTaskPayload() error = %v", err)
	}

	var got map[string]any
	if err := json.Unmarshal(resolved, &got); err != nil {
		t.Fatalf("unmarshal resolved payload: %v", err)
	}

	want := map[string]any{
		"input": map[string]any{
			"name":   "Ada",
			"active": true,
		},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("ResolveTaskPayload() = %#v, want %#v", got, want)
	}
}

func TestResolveTaskPayloadReturnsMissingPathError(t *testing.T) {
	template := json.RawMessage(`{"message":{"$previous":"body.missing"}}`)
	previous := json.RawMessage(`{"body":{"title":"Monad"}}`)

	if _, err := ResolveTaskPayload(template, previous); err == nil {
		t.Fatal("ResolveTaskPayload() error = nil, want missing path error")
	}
}

func TestHasPreviousOutputReferenceRejectsMalformedMarker(t *testing.T) {
	payload := json.RawMessage(`{"message":{"$previous":4}}`)

	if _, err := HasPreviousOutputReference(payload); err == nil {
		t.Fatal("HasPreviousOutputReference() error = nil, want malformed marker error")
	}
}
