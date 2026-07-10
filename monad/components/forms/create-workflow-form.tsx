"use client";

import { type SyntheticEvent, useState } from "react";

import { WorkflowStepEditor } from "@/components/forms/workflow/workflow-step-editor";
import {
  createWorkflowStepDraft,
  removePreviousOutputSources,
  validateWorkflowStep,
  workflowStepPayload,
  type WorkflowStepDraft,
} from "@/components/forms/workflow/workflow-form-model";
import { createWorkflow } from "@/lib/api";
import type { CreateWorkflowRequest } from "@/types/workflow";

type CreateWorkflowFormProps = {
  onCreated: () => Promise<void>;
};

export const CreateWorkflowForm = ({ onCreated }: CreateWorkflowFormProps) => {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<WorkflowStepDraft[]>([
    createWorkflowStepDraft(),
  ]);

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
      const validationError = validateWorkflowStep(step, index);
      if (validationError) {
        setCreateError(validationError);
        return;
      }

      parsedSteps.push({
        step_order: index + 1,
        task_type: step.taskType,
        payload: workflowStepPayload(step),
      });
    }

    try {
      setCreating(true);
      await createWorkflow({
        name: workflowName.trim(),
        steps: parsedSteps,
      });
      setWorkflowName("");
      setSteps([createWorkflowStepDraft()]);
      await onCreated();
    } catch {
      setCreateError("Could not create workflow.");
    } finally {
      setCreating(false);
    }
  }

  function updateStep(index: number, nextStep: WorkflowStepDraft) {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? nextStep : step,
      ),
    );
  }

  function removeStep(index: number) {
    setSteps((current) => {
      const nextSteps = current.filter((_, stepIndex) => stepIndex !== index);
      if (nextSteps[0]) {
        nextSteps[0] = removePreviousOutputSources(nextSteps[0]);
      }
      return nextSteps;
    });
  }

  function addStep() {
    setCreateError("");
    setSteps((current) => [
      ...current,
      createWorkflowStepDraft("print-message", current.length > 0),
    ]);
  }

  return (
    <form
      onSubmit={handleCreateWorkflow}
      className="rounded-md border border-neutral-200 bg-white p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Create workflow</h2>
        <p className="text-sm text-neutral-500">
          Build a reusable sequence by configuring each task below.
        </p>
      </div>

      <label className="mt-5 flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">
          Workflow name
        </span>
        <input
          value={workflowName}
          onChange={(event) => setWorkflowName(event.target.value)}
          disabled={creating}
          placeholder="Daily API check"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950 disabled:bg-neutral-100"
        />
      </label>

      <div className="mt-6">
        <div className="border-b border-neutral-200 pb-3">
          <h3 className="text-sm font-semibold text-neutral-950">Tasks</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Tasks run from top to bottom. Later tasks can use output from the
            task immediately before them.
          </p>
        </div>

        <div className="divide-y divide-neutral-200">
          {steps.map((step, index) => (
            <WorkflowStepEditor
              key={index}
              step={step}
              index={index}
              previousStep={steps[index - 1]}
              canRemove={steps.length > 1}
              disabled={creating}
              onChange={(nextStep) => updateStep(index, nextStep)}
              onRemove={() => removeStep(index)}
            />
          ))}
        </div>
      </div>

      {createError ? (
        <p
          className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {createError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-2 pt-5 sm:flex sm:flex-row">
        <button
          type="submit"
          disabled={creating}
          className="h-10 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
        >
          {creating ? "Creating..." : "Create workflow"}
        </button>
        <button
          type="button"
          onClick={addStep}
          disabled={creating}
          className="h-10 rounded-md border border-neutral-300 px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
        >
          Add task
        </button>
      </div>
    </form>
  );
};
