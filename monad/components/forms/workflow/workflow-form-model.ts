import type { TaskType } from "@/constants/tasks";

export type InputSource = "fixed" | "previous";

export type SourcedValue<T> = {
  source: InputSource;
  value: T;
  path: string;
};

export type FieldValueType = "text" | "number" | "boolean";

export type TypedFieldDraft = {
  name: string;
  valueType: FieldValueType;
  value: string | number | boolean;
};

export type HeaderDraft = {
  name: string;
  value: string;
};

export type TransformMappingDraft = {
  outputName: string;
  inputPath: string;
};

export type PrintMessageStepDraft = {
  taskType: "print-message";
  message: SourcedValue<string>;
};

export type WaitStepDraft = {
  taskType: "wait";
  seconds: SourcedValue<number>;
};

export type HttpRequestStepDraft = {
  taskType: "http-request";
  method: string;
  url: SourcedValue<string>;
  headers: HeaderDraft[];
  bodySource: "none" | InputSource;
  bodyFields: TypedFieldDraft[];
  bodyPath: string;
};

export type JsonTransformStepDraft = {
  taskType: "json-transform";
  input: SourcedValue<TypedFieldDraft[]>;
  mappings: TransformMappingDraft[];
};

export type WorkflowStepDraft =
  | PrintMessageStepDraft
  | WaitStepDraft
  | HttpRequestStepDraft
  | JsonTransformStepDraft;

export type OutputPathSuggestion = {
  path: string;
  label: string;
};

export const taskTypeLabels: Record<TaskType, string> = {
  "print-message": "Print message",
  wait: "Wait",
  "http-request": "HTTP request",
  "json-transform": "JSON transform",
};

function fixedValue<T>(value: T): SourcedValue<T> {
  return {
    source: "fixed",
    value,
    path: "",
  };
}

export function createTypedField(
  name = "",
  valueType: FieldValueType = "text",
  value: string | number | boolean = "",
): TypedFieldDraft {
  return { name, valueType, value };
}

export function createWorkflowStepDraft(
  taskType: TaskType = "print-message",
  hasPreviousStep = false,
): WorkflowStepDraft {
  switch (taskType) {
    case "wait":
      return {
        taskType,
        seconds: fixedValue(3),
      };
    case "http-request":
      return {
        taskType,
        method: "GET",
        url: fixedValue("https://jsonplaceholder.typicode.com/todos/1"),
        headers: [{ name: "Accept", value: "application/json" }],
        bodySource: "none",
        bodyFields: [],
        bodyPath: "",
      };
    case "json-transform":
      return {
        taskType,
        input: {
          source: hasPreviousStep ? "previous" : "fixed",
          value: [createTypedField("name", "text", "Ada Lovelace")],
          path: "",
        },
        mappings: [{ outputName: "result", inputPath: "" }],
      };
    default:
      return {
        taskType: "print-message",
        message: fixedValue("hello from Monad"),
      };
  }
}

function previousOutput(path: string) {
  return {
    $previous: path.trim(),
  };
}

function sourcedPayloadValue<T>(input: SourcedValue<T>): T | { $previous: string } {
  if (input.source === "previous") {
    return previousOutput(input.path);
  }

  return input.value;
}

function typedFieldsToObject(fields: TypedFieldDraft[]) {
  const result: Record<string, string | number | boolean> = {};

  for (const field of fields) {
    const name = field.name.trim();
    if (name) {
      result[name] = field.value;
    }
  }

  return result;
}

export function workflowStepPayload(
  step: WorkflowStepDraft,
): Record<string, unknown> {
  switch (step.taskType) {
    case "print-message":
      return {
        message: sourcedPayloadValue(step.message),
      };
    case "wait":
      return {
        seconds: sourcedPayloadValue(step.seconds),
      };
    case "http-request": {
      const headers: Record<string, string> = {};
      for (const header of step.headers) {
        const name = header.name.trim();
        if (name) {
          headers[name] = header.value;
        }
      }

      let body: Record<string, string | number | boolean> | { $previous: string } | null = null;
      if (step.bodySource === "fixed") {
        body = typedFieldsToObject(step.bodyFields);
      } else if (step.bodySource === "previous") {
        body = previousOutput(step.bodyPath);
      }

      return {
        method: step.method,
        url: sourcedPayloadValue(step.url),
        headers,
        body,
      };
    }
    case "json-transform": {
      const fields: Record<string, string> = {};
      for (const mapping of step.mappings) {
        const outputName = mapping.outputName.trim();
        if (outputName) {
          fields[outputName] = mapping.inputPath.trim();
        }
      }

      return {
        input:
          step.input.source === "previous"
            ? previousOutput(step.input.path)
            : typedFieldsToObject(step.input.value),
        fields,
      };
    }
  }
}

function validateUniqueNames(names: string[], label: string) {
  const normalized = names.map((name) => name.trim()).filter(Boolean);
  if (normalized.length !== names.length) {
    return `${label} cannot be empty.`;
  }
  if (new Set(normalized).size !== normalized.length) {
    return `${label} values must be unique.`;
  }

  return "";
}

export function validateWorkflowStep(step: WorkflowStepDraft, index: number) {
  const stepLabel = `Step ${index + 1}`;

  switch (step.taskType) {
    case "print-message":
      if (step.message.source === "fixed" && !step.message.value.trim()) {
        return `${stepLabel} message is required.`;
      }
      if (step.message.source === "previous" && !step.message.path.trim()) {
        return `${stepLabel} message needs a previous output path.`;
      }
      return "";
    case "wait":
      if (
        step.seconds.source === "fixed" &&
        (!Number.isFinite(step.seconds.value) || step.seconds.value < 0)
      ) {
        return `${stepLabel} seconds must be zero or greater.`;
      }
      if (step.seconds.source === "previous" && !step.seconds.path.trim()) {
        return `${stepLabel} seconds needs a previous output path.`;
      }
      return "";
    case "http-request": {
      if (step.url.source === "fixed" && !step.url.value.trim()) {
        return `${stepLabel} URL is required.`;
      }
      if (step.url.source === "previous" && !step.url.path.trim()) {
        return `${stepLabel} URL needs a previous output path.`;
      }

      const headerError = validateUniqueNames(
        step.headers.map((header) => header.name),
        `${stepLabel} header names`,
      );
      if (headerError) {
        return headerError;
      }

      if (step.bodySource === "fixed") {
        return validateUniqueNames(
          step.bodyFields.map((field) => field.name),
          `${stepLabel} body field names`,
        );
      }
      return "";
    }
    case "json-transform": {
      if (step.input.source === "fixed") {
        const inputError = validateUniqueNames(
          step.input.value.map((field) => field.name),
          `${stepLabel} input field names`,
        );
        if (inputError) {
          return inputError;
        }
      }

      if (step.mappings.length === 0) {
        return `${stepLabel} needs at least one output mapping.`;
      }

      return validateUniqueNames(
        step.mappings.map((mapping) => mapping.outputName),
        `${stepLabel} output names`,
      );
    }
  }
}

export function outputPathSuggestions(
  step: WorkflowStepDraft | undefined,
): OutputPathSuggestion[] {
  if (!step) {
    return [];
  }

  switch (step.taskType) {
    case "print-message":
      return [{ path: "message", label: "Printed message" }];
    case "wait":
      return [{ path: "waited_seconds", label: "Waited seconds" }];
    case "http-request":
      return [
        { path: "body", label: "Response body" },
        { path: "status_code", label: "Status code" },
        { path: "headers", label: "Response headers" },
      ];
    case "json-transform":
      return step.mappings
        .map((mapping) => mapping.outputName.trim())
        .filter(Boolean)
        .map((path) => ({ path, label: `Transformed ${path}` }));
  }
}

export function removePreviousOutputSources(
  step: WorkflowStepDraft,
): WorkflowStepDraft {
  switch (step.taskType) {
    case "print-message":
      return {
        ...step,
        message: { ...step.message, source: "fixed" },
      };
    case "wait":
      return {
        ...step,
        seconds: { ...step.seconds, source: "fixed" },
      };
    case "http-request":
      return {
        ...step,
        url: { ...step.url, source: "fixed" },
        bodySource: step.bodySource === "previous" ? "none" : step.bodySource,
      };
    case "json-transform":
      return {
        ...step,
        input: { ...step.input, source: "fixed" },
      };
  }
}
