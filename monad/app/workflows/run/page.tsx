"use client";

import { useCallback, useEffect, useState } from "react";

import { CreateWorkflowRunForm } from "@/components/forms/create-workflow-run-form";
import { NavBar } from "@/components/navigation/navbar";
import { WorkflowNav } from "@/components/navigation/workflownav";
import { WorkflowRunDetailsModal } from "@/components/workflow-runs/workflow-run-details-modal";
import { WorkflowRunsList } from "@/components/workflow-runs/workflow-runs-list";
import { getTasks, getWorkflowRuns, getWorkflows } from "@/lib/api";
import { workflowRunWebSocketURL } from "@/lib/realtime";
import { Task } from "@/types/task";
import { WorkflowRun, WorkflowRunLiveUpdate } from "@/types/workflow-run";
import { Workflow } from "@/types/workflow";

function sortTasksByStepOrder(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.step_order - b.step_order);
}

export default function WorkflowRunPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedRunID, setSelectedRunID] = useState("");
  const [selectedRunTasks, setSelectedRunTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsFailed, setDetailsFailed] = useState(false);
  const selectedRun = runs.find((run) => run.id === selectedRunID);

  const loadRuns = useCallback(async () => {
    const runData = await getWorkflowRuns();
    setRuns(runData);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [workflowData, runData] = await Promise.all([
        getWorkflows(),
        getWorkflowRuns(),
      ]);

      setLoadFailed(false);
      setWorkflows(workflowData);
      setRuns(runData);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutID = window.setTimeout(() => {
      void loadData();
    }, 0);

    const intervalID = window.setInterval(async () => {
      try {
        await loadRuns();
      } catch {
        setLoadFailed(true);
      }
    }, 2000);

    return () => {
      window.clearTimeout(timeoutID);
      window.clearInterval(intervalID);
    };
  }, [loadData, loadRuns]);

  useEffect(() => {
    if (!selectedRunID) {
      return;
    }

    const socket = new WebSocket(workflowRunWebSocketURL(selectedRunID));

    socket.onmessage = (event) => {
      let update: WorkflowRunLiveUpdate;
      try {
        update = JSON.parse(event.data) as WorkflowRunLiveUpdate;
      } catch {
        return;
      }

      if (update.workflow_run_id !== selectedRunID) {
        return;
      }

      setRuns((currentRuns) =>
        currentRuns.map((run) =>
          run.id === update.run.id ? update.run : run,
        ),
      );
      setSelectedRunTasks(sortTasksByStepOrder(update.tasks));
      setDetailsLoading(false);
      setDetailsFailed(false);
    };

    socket.onerror = () => {
      setDetailsFailed(true);
    };

    return () => {
      socket.close();
    };
  }, [selectedRunID]);

  async function openRunDetails(runID: string) {
    setSelectedRunID(runID);
    setSelectedRunTasks([]);
    setDetailsLoading(true);
    setDetailsFailed(false);

    try {
      const tasks = await getTasks();
      setSelectedRunTasks(
        sortTasksByStepOrder(
          tasks.filter((task) => task.workflow_run_id === runID),
        ),
      );
    } catch {
      setDetailsFailed(true);
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeRunDetails() {
    setSelectedRunID("");
    setSelectedRunTasks([]);
    setDetailsFailed(false);
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <NavBar />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <WorkflowNav />

        <section className="min-h-[520px] rounded-lg border border-neutral-200 bg-white p-6">
          <div className="flex flex-col gap-2 border-b border-neutral-200 pb-5">
            <p className="text-sm font-medium text-neutral-500">Workspace</p>
            <h1 className="text-2xl font-semibold tracking-normal">
              Run workflow
            </h1>
          </div>

          <div className="grid gap-6 py-6 lg:grid-cols-[360px_1fr]">
            <CreateWorkflowRunForm
              workflows={workflows}
              loading={loading}
              onCreated={loadRuns}
            />

            <div>
              <WorkflowRunsList
                runs={runs}
                loading={loading}
                loadFailed={loadFailed}
                onSelectRun={openRunDetails}
              />
            </div>
          </div>
        </section>
      </div>

      <WorkflowRunDetailsModal
        run={selectedRun}
        tasks={selectedRunTasks}
        loading={detailsLoading}
        failed={detailsFailed}
        onClose={closeRunDetails}
      />
    </main>
  );
}
