"use client";

import { FormEvent, useState } from "react";

import { createWorkflow } from "@/lib/api";

type CreateWorkflowFormProps = {
  onCreated: () => Promise<void>;
};

export function CreateWorkflowForm({ onCreated }: CreateWorkflowFormProps) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [workflowID, setWorkflowID] = useState("");
  const [workflowName, setWorkflowName] = useState("");

  async function handleCreateWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");

    if (!workflowID.trim() || !workflowName.trim()) {
      setCreateError("Workflow id and name are required.");
      return;
    }

    try {
      setCreating(true);
      await createWorkflow({
        id: workflowID.trim(),
        name: workflowName.trim(),
      });
      setWorkflowID("");
      setWorkflowName("");
      await onCreated();
    } catch {
      setCreateError("Could not create workflow.");
    } finally {
      setCreating(false);
    }
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

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-700">
            Workflow id
          </span>
          <input
            value={workflowID}
            onChange={(event) => setWorkflowID(event.target.value)}
            placeholder="test-workflow"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950"
          />
        </label>

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
}
