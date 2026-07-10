package workflow

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

const previousOutputReferenceKey = "$previous"

// HasPreviousOutputReference reports whether a payload contains a value that
// should be read from the immediately preceding task's output.
func HasPreviousOutputReference(payload json.RawMessage) (bool, error) {
	if len(payload) == 0 {
		return false, nil
	}

	var value any
	if err := json.Unmarshal(payload, &value); err != nil {
		return false, fmt.Errorf("invalid task payload: %w", err)
	}

	return hasPreviousOutputReference(value)
}

// ResolveTaskPayload replaces {"$previous":"path.to.value"} markers with
// values from the immediately preceding task's output. An empty path uses the
// complete output value.
func ResolveTaskPayload(payload, previousOutput json.RawMessage) (json.RawMessage, error) {
	hasReference, err := HasPreviousOutputReference(payload)
	if err != nil {
		return nil, err
	}
	if !hasReference {
		return payload, nil
	}
	if len(previousOutput) == 0 {
		return nil, fmt.Errorf("task payload references previous output, but no previous output is available")
	}

	var payloadValue any
	if err := json.Unmarshal(payload, &payloadValue); err != nil {
		return nil, fmt.Errorf("invalid task payload: %w", err)
	}

	var previousValue any
	if err := json.Unmarshal(previousOutput, &previousValue); err != nil {
		return nil, fmt.Errorf("invalid previous task output: %w", err)
	}

	resolved, err := resolvePreviousOutputReferences(payloadValue, previousValue)
	if err != nil {
		return nil, err
	}

	result, err := json.Marshal(resolved)
	if err != nil {
		return nil, fmt.Errorf("marshal resolved task payload: %w", err)
	}

	return result, nil
}

func hasPreviousOutputReference(value any) (bool, error) {
	switch typedValue := value.(type) {
	case map[string]any:
		if path, exists := typedValue[previousOutputReferenceKey]; exists {
			if len(typedValue) != 1 {
				return false, fmt.Errorf("%s must be the only field in an output reference", previousOutputReferenceKey)
			}
			if _, ok := path.(string); !ok {
				return false, fmt.Errorf("%s must contain a string path", previousOutputReferenceKey)
			}
			return true, nil
		}

		for _, nestedValue := range typedValue {
			hasReference, err := hasPreviousOutputReference(nestedValue)
			if err != nil || hasReference {
				return hasReference, err
			}
		}
	case []any:
		for _, nestedValue := range typedValue {
			hasReference, err := hasPreviousOutputReference(nestedValue)
			if err != nil || hasReference {
				return hasReference, err
			}
		}
	}

	return false, nil
}

func resolvePreviousOutputReferences(value, previousOutput any) (any, error) {
	switch typedValue := value.(type) {
	case map[string]any:
		if pathValue, exists := typedValue[previousOutputReferenceKey]; exists {
			path, ok := pathValue.(string)
			if !ok || len(typedValue) != 1 {
				return nil, fmt.Errorf("invalid %s output reference", previousOutputReferenceKey)
			}

			return valueAtPath(previousOutput, path)
		}

		resolved := make(map[string]any, len(typedValue))
		for key, nestedValue := range typedValue {
			resolvedValue, err := resolvePreviousOutputReferences(nestedValue, previousOutput)
			if err != nil {
				return nil, err
			}
			resolved[key] = resolvedValue
		}
		return resolved, nil
	case []any:
		resolved := make([]any, len(typedValue))
		for index, nestedValue := range typedValue {
			resolvedValue, err := resolvePreviousOutputReferences(nestedValue, previousOutput)
			if err != nil {
				return nil, err
			}
			resolved[index] = resolvedValue
		}
		return resolved, nil
	default:
		return value, nil
	}
}

func valueAtPath(value any, path string) (any, error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return value, nil
	}

	current := value
	for _, part := range strings.Split(path, ".") {
		switch typedValue := current.(type) {
		case map[string]any:
			next, exists := typedValue[part]
			if !exists {
				return nil, fmt.Errorf("previous task output path %q was not found", path)
			}
			current = next
		case []any:
			index, err := strconv.Atoi(part)
			if err != nil || index < 0 || index >= len(typedValue) {
				return nil, fmt.Errorf("previous task output array path %q was not found", path)
			}
			current = typedValue[index]
		default:
			return nil, fmt.Errorf("previous task output path %q cannot continue through %T", path, current)
		}
	}

	return current, nil
}
