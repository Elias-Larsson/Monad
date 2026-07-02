"use client";

import { FormEvent, useEffect, useState } from "react";

import { createWorkflowRun } from "@/lib/api";
import { Workflow } from "@/types/workflow";

const taskTypes = ["print-message", "wait", "http-request", "json-transform"];

const defaultPayload = JSON.stringify(
  {
    message: "hello from Monad",
  },
  null,
  2,
);

type CreateWorkflowRunFormProps = {
  workflows: Workflow[];
  loading: boolean;
  onCreated: () => Promise<void>;
};

export function CreateWorkflowRunForm({
  workflows,
  loading,
  onCreated,
}: CreateWorkflowRunFormProps) {
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [workflowID, setWorkflowID] = useState("");
  const [taskType, setTaskType] = useState("print-message");
  const [payload, setPayload] = useState(defaultPayload);

  useEffect(() => {
    setWorkflowID((current) => current || workflows[0]?.id || "");
  }, [workflows]);

  async function handleCreateRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!workflowID) {
      setFormError("Choose a workflow first.");
      return;
    }

    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setFormError("Payload must be valid JSON.");
      return;
    }

    try {
      setCreating(true);
      const run = await createWorkflowRun({
        workflow_id: workflowID,
        task_type: taskType,
        payload: parsedPayload,
      });
      setSuccessMessage(`Started run ${run.workflow_run_id}`);
      await onCreated();
    } catch {
      setFormError("Could not start workflow run.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <form
      onSubmit={handleCreateRun}
      className="rounded-md border border-neutral-200 bg-neutral-50 p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Start execution</h2>
        <p className="text-sm text-neutral-500">
          Create a workflow run and queue its first task.
        </p>
      </div>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">Workflow</span>
        <select
          value={workflowID}
          onChange={(event) => setWorkflowID(event.target.value)}
          disabled={loading || workflows.length === 0}
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950 disabled:bg-neutral-100"
        >
          {workflows.length === 0 ? (
            <option value="">No workflows available</option>
          ) : (
            workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))
          )}
        </select>
      </label>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">Task type</span>
        <select
          value={taskType}
          onChange={(event) => setTaskType(event.target.value)}
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
        >
          {taskTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">
          Payload JSON
        </span>
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          rows={8}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-neutral-950"
        />
      </label>

      {formError ? (
        <p className="mt-3 text-sm text-red-600">{formError}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-3 text-sm text-emerald-700">{successMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={creating || loading || workflows.length === 0}
        className="mt-4 rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {creating ? "Starting..." : "Start workflow run"}
      </button>
    </form>
  );
}
