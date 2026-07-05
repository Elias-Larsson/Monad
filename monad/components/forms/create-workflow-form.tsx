"use client";

import { type SyntheticEvent, useState } from "react";

import { createWorkflow } from "@/lib/api";
import { CreateWorkflowRequest } from "@/types/workflow";

type CreateWorkflowFormProps = {
  onCreated: () => Promise<void>;
};

type StepForm = {
  taskType: string;
  payload: string;
};

const taskTypes = ["print-message", "wait", "http-request", "json-transform"];

const defaultStepPayload = JSON.stringify(
  {
    message: "hello from Monad",
  },
  null,
  2,
);

function createEmptyStep(): StepForm {
  return {
    taskType: "print-message",
    payload: defaultStepPayload,
  };
}

export const CreateWorkflowForm = ({ onCreated }: CreateWorkflowFormProps) => {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<StepForm[]>([createEmptyStep()]);

  async function handleCreateWorkflow(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");

    if (!workflowName.trim()) {
      setCreateError("Workflow name is required.");
      return;
    }
    if (steps.length === 0) {
      setCreateError("At least one workflow step is required.");
      return;
    }

    const parsedSteps: CreateWorkflowRequest["steps"] = [];
    for (const [index, step] of steps.entries()) {
      if (!step.taskType.trim()) {
        setCreateError("Each step needs a task type.");
        return;
      }

      try {
        parsedSteps.push({
          step_order: index + 1,
          task_type: step.taskType.trim(),
          payload: JSON.parse(step.payload),
        });
      } catch {
        setCreateError(`Step ${index + 1} payload must be valid JSON.`);
        return;
      }
    }

    try {
      setCreating(true);
      await createWorkflow({
        name: workflowName.trim(),
        steps: parsedSteps,
      });
      setWorkflowName("");
      setSteps([createEmptyStep()]);
      await onCreated();
    } catch {
      setCreateError("Could not create workflow.");
    } finally {
      setCreating(false);
    }
  }

  function updateStep(index: number, nextStep: StepForm) {
    setSteps((current) =>
      current.map((step, stepIndex) => (stepIndex === index ? nextStep : step)),
    );
  }

  function removeStep(index: number) {
    setSteps((current) => current.filter((_, stepIndex) => stepIndex !== index));
  }

  return (
    <form
      onSubmit={handleCreateWorkflow}
      className="rounded-md border border-neutral-200 bg-neutral-50 p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Create workflow</h2>
        <p className="text-sm text-neutral-500">
          Add a workflow blueprint that workflow runs can execute.
        </p>
      </div>

      <div className="mt-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-700">Name</span>
          <input
            value={workflowName}
            onChange={(event) => setWorkflowName(event.target.value)}
            placeholder="Test Workflow"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
          />
        </label>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-neutral-800">Steps</h3>
          <button
            type="button"
            onClick={() =>
              setSteps((current) => [...current, createEmptyStep()])
            }
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-white"
          >
            Add step
          </button>
        </div>

        {steps.map((step, index) => (
          <div
            key={index}
            className="rounded-md border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-neutral-800">
                Step {index + 1}
              </p>
              {steps.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <label className="mt-3 flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-700">
                Task type
              </span>
              <select
                value={step.taskType}
                onChange={(event) =>
                  updateStep(index, {
                    ...step,
                    taskType: event.target.value,
                  })
                }
                className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
              >
                {taskTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-700">
                Payload JSON
              </span>
              <textarea
                value={step.payload}
                onChange={(event) =>
                  updateStep(index, {
                    ...step,
                    payload: event.target.value,
                  })
                }
                rows={5}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-neutral-950"
              />
            </label>
          </div>
        ))}
      </div>

      {createError ? (
        <p className="mt-3 text-sm text-red-600">{createError}</p>
      ) : null}

      <button
        type="submit"
        disabled={creating}
        className="mt-4 rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creating ? "Creating..." : "Create workflow"}
      </button>
    </form>
  );
};
