import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "~/i18n";
import { get } from "../utils/apiClient";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";
import { Card } from "./Card";
import { generateDeploymentUrl } from "../utils/deploymentUrl";

type WorkflowRun = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
};

type WorkflowStatusResponse = {
  totalCount: number;
  workflowRuns: WorkflowRun[];
};

type WorkflowRunDetailsResponse = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  jobs: Array<{
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    startedAt: string | null;
    completedAt: string | null;
    steps: Array<{
      name: string;
      status: string;
      conclusion: string | null;
      number: number;
    }>;
  }>;
};

interface WorkflowStatusProps {
  dexId: string;
  workflowName?: string;
  className?: string;
  autoRefresh?: boolean;
  onSuccessfulDeployment?: (
    deploymentUrl: string,
    isNewDeployment: boolean
  ) => void;
}

export default function WorkflowStatus({
  dexId,
  workflowName,
  className = "",
  autoRefresh = true,
  onSuccessfulDeployment,
}: WorkflowStatusProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [workflowStatus, setWorkflowStatus] =
    useState<WorkflowStatusResponse | null>(null);
  const [selectedRun, setSelectedRun] =
    useState<WorkflowRunDetailsResponse | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deploymentChecked, setDeploymentChecked] = useState(false);

  const fetchRunDetails = useCallback(
    async (runId: number, showLoading = true) => {
      if (!token || !dexId) return;

      if (showLoading) {
        setIsLoadingDetails(true);
      }
      setSelectedRunId(runId);

      try {
        const data = await get<WorkflowRunDetailsResponse>(
          `api/dex/${dexId}/workflow-runs/${runId}`,
          token
        );
        setSelectedRun(data);

        setWorkflowStatus(prevStatus => {
          if (!prevStatus) return prevStatus;

          return {
            ...prevStatus,
            workflowRuns: prevStatus.workflowRuns.map(run =>
              run.id === runId
                ? {
                    ...run,
                    status: data.status,
                    conclusion: data.conclusion,
                    updatedAt: data.updatedAt,
                  }
                : run
            ),
          };
        });
      } catch (error) {
        console.error("Error fetching run details:", error);
        toast.error(t("workflowStatus.couldNotFetchDetails"));
        setSelectedRunId(null);
      } finally {
        if (showLoading) {
          setIsLoadingDetails(false);
        }
      }
    },
    [token, dexId]
  );

  const fetchWorkflowStatus = useCallback(async () => {
    if (!token || !dexId) return;

    setIsLoading(true);
    setError(null);

    try {
      let url = `api/dex/${dexId}/workflow-status`;
      if (workflowName) {
        url += `?workflow=${encodeURIComponent(workflowName)}`;
      }

      const data = await get<WorkflowStatusResponse>(url, token);
      setWorkflowStatus(data);

      setDeploymentChecked(false);

      if (
        selectedRunId &&
        data.workflowRuns.some(run => run.id === selectedRunId)
      ) {
        const selectedWorkflow = data.workflowRuns.find(
          run => run.id === selectedRunId
        );
        if (
          selectedWorkflow &&
          (selectedWorkflow.status === "in_progress" ||
            selectedWorkflow.status === "queued")
        ) {
          fetchRunDetails(selectedRunId, false);
        }
      }
    } catch (error) {
      console.error("Error fetching workflow status:", error);
      const message =
        error instanceof Error
          ? error.message
          : t("workflowStatus.unknownError");
      setError(t("workflowStatus.fetchError", { message }));
    } finally {
      setIsLoading(false);
    }
  }, [token, dexId, workflowName, selectedRunId, fetchRunDetails, t]);

  useEffect(() => {
    fetchWorkflowStatus();
  }, [token, dexId, workflowName]);

  useEffect(() => {
    if (!autoRefresh) return;

    const refreshInterval =
      !workflowStatus || workflowStatus.totalCount === 0 ? 5_000 : 20_000;

    const interval = setInterval(fetchWorkflowStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, workflowStatus, fetchWorkflowStatus]);

  const checkForSuccessfulDeployment = useCallback(() => {
    if (
      !workflowStatus ||
      !workflowStatus.workflowRuns.length ||
      !onSuccessfulDeployment
    ) {
      return;
    }

    const storageKey = `notified-deployments-${dexId}`;
    let notifiedDeployments: number[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        notifiedDeployments = JSON.parse(stored);
      }
    } catch (err) {
      console.error("Error reading from localStorage:", err);
    }

    const deployWorkflows = workflowStatus.workflowRuns.filter(
      run => run.name === "Deploy to GitHub Pages"
    );

    if (deployWorkflows.length > 0) {
      const successfulDeployment = deployWorkflows.find(
        run => run.status === "completed" && run.conclusion === "success"
      );

      if (successfulDeployment) {
        if (successfulDeployment.htmlUrl) {
          const repoUrl =
            successfulDeployment.htmlUrl.split("/actions/runs/")[0];
          const deploymentUrl = generateDeploymentUrl(repoUrl);
          if (deploymentUrl) {
            const isNewDeployment = !notifiedDeployments.includes(
              successfulDeployment.id
            );

            onSuccessfulDeployment(deploymentUrl, isNewDeployment);

            if (isNewDeployment) {
              notifiedDeployments.push(successfulDeployment.id);
              try {
                localStorage.setItem(
                  storageKey,
                  JSON.stringify(notifiedDeployments)
                );
              } catch (err) {
                console.error("Error writing to localStorage:", err);
              }
            }

            setDeploymentChecked(true);
            return;
          }
        }
      }

      if (!selectedRun && deployWorkflows.length > 0) {
        fetchRunDetails(deployWorkflows[0].id);
      }
    }
  }, [
    workflowStatus,
    onSuccessfulDeployment,
    selectedRun,
    fetchRunDetails,
    dexId,
  ]);

  useEffect(() => {
    if (!deploymentChecked && workflowStatus) {
      checkForSuccessfulDeployment();
    }
  }, [workflowStatus, checkForSuccessfulDeployment, deploymentChecked]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string, conclusion: string | null) => {
    if (status === "completed") {
      switch (conclusion) {
        case "success":
          return "bg-success";
        case "failure":
          return "bg-error";
        case "cancelled":
          return "bg-gray-500";
        default:
          return "bg-yellow-500";
      }
    } else if (status === "in_progress") {
      return "bg-blue-500 animate-pulse";
    } else if (status === "queued") {
      return "bg-blue-300";
    }
    return "bg-gray-400";
  };

  const getStatusText = (status: string, conclusion: string | null) => {
    if (status === "completed") {
      switch (conclusion) {
        case "success":
          return t("workflowStatus.success");
        case "failure":
          return t("workflowStatus.failed");
        case "cancelled":
          return t("workflowStatus.cancelled");
        default:
          return conclusion || t("workflowStatus.completed");
      }
    }
    return status.replace("_", " ");
  };

  if (isLoading && !workflowStatus) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="i-svg-spinners:pulse-rings-multiple h-6 w-6 mx-auto text-primary-light"></div>
        <p className="text-center text-sm mt-2">
          {t("workflowStatus.loading")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="error" className={className}>
        <h3 className="text-md font-medium mb-2">
          {t("workflowStatus.errorTitle")}
        </h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchWorkflowStatus}
          className="mt-3 px-3 py-1 text-xs bg-dark/50 hover:bg-dark/70 rounded-md"
        >
          {t("workflowStatus.retry")}
        </button>
      </Card>
    );
  }

  if (!workflowStatus || workflowStatus.totalCount === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="i-svg-spinners:pulse-rings-multiple h-6 w-6 mx-auto text-primary-light"></div>
        <p className="text-center text-sm mt-2">
          {t("workflowStatus.waitingForWorkflows")}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="slide-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium">
            {workflowName
              ? t("workflowStatus.workflowStatusNamed", { workflowName })
              : t("workflowStatus.workflowStatus")}
          </h3>
          <button
            onClick={fetchWorkflowStatus}
            disabled={isLoading}
            className="p-1 rounded hover:bg-dark/50"
            title={t("common.refresh")}
          >
            <div
              className={`i-mdi:refresh h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
            ></div>
          </button>
        </div>

        {workflowStatus.workflowRuns.length === 0 ? (
          <p className="text-sm text-gray-400">
            {t("workflowStatus.noRecentRuns")}
          </p>
        ) : (
          <div className="space-y-4">
            {/* List of workflow runs - limit to 5 most recent */}
            <div className="overflow-auto max-h-80">
              {workflowStatus.workflowRuns.slice(0, 5).map(run => (
                <div
                  key={run.id}
                  className={`p-3 mb-2 bg-dark/30 rounded-lg hover:bg-dark/50 cursor-pointer staggered-item ${
                    selectedRunId === run.id
                      ? "border border-primary-light/30"
                      : ""
                  }`}
                  onClick={() => {
                    // If this run is already selected, refresh it without showing the loading state
                    if (selectedRun && selectedRun.id === run.id) {
                      fetchRunDetails(run.id, false);
                    } else {
                      fetchRunDetails(run.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div
                        className={`h-3 w-3 rounded-full mr-2 ${
                          isLoadingDetails && selectedRunId === run.id
                            ? "bg-blue-500 animate-pulse"
                            : getStatusBadgeClass(run.status, run.conclusion)
                        }`}
                      ></div>
                      <span className="font-medium">{run.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {isLoadingDetails && selectedRunId === run.id
                        ? t("workflowStatus.loadingDetails")
                        : getStatusText(run.status, run.conclusion)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400 flex justify-between">
                    <span>{t("workflowStatus.runId", { runId: run.id })}</span>
                    <span>{formatDate(run.updatedAt)}</span>
                  </div>
                </div>
              ))}
              {workflowStatus.workflowRuns.length > 5 && (
                <div className="text-xs text-gray-400 text-center mt-2 slide-fade-in-delayed">
                  {t("workflowStatus.showingRecent", {
                    total: workflowStatus.workflowRuns.length,
                  })}
                </div>
              )}
            </div>

            {/* Selected run details */}
            {selectedRunId && (
              <div className="bg-dark/20 p-3 rounded-lg mt-4 border border-light/10 slide-fade-in">
                {isLoadingDetails ? (
                  <div className="py-4">
                    <div className="i-svg-spinners:pulse-rings-multiple h-6 w-6 mx-auto text-primary-light mb-2"></div>
                    <p className="text-center text-sm text-gray-400">
                      {t("workflowStatus.loadingWorkflowDetails")}
                    </p>
                  </div>
                ) : selectedRun ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        {t("workflowStatus.runDetails")}: {selectedRun.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <a
                          href={selectedRun.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-light hover:underline flex items-center"
                        >
                          <span>{t("workflowStatus.viewOnGitHub")}</span>
                          <div className="i-mdi:open-in-new h-3 w-3 ml-1"></div>
                        </a>
                        <button
                          onClick={() => {
                            setSelectedRun(null);
                            setSelectedRunId(null);
                          }}
                          className="p-1 rounded hover:bg-dark/50 ml-2"
                          title={t("workflowStatus.closeDetails")}
                        >
                          <div className="i-mdi:close h-4 w-4"></div>
                        </button>
                      </div>
                    </div>
                    <div className="my-2 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">
                          {t("common.status")}
                        </span>
                        <span className="font-medium">
                          {getStatusText(
                            selectedRun.status,
                            selectedRun.conclusion
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">
                          {t("workflowStatus.started")}
                        </span>
                        <span>{formatDate(selectedRun.createdAt)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">
                          {t("workflowStatus.lastUpdated")}
                        </span>
                        <span>{formatDate(selectedRun.updatedAt)}</span>
                      </div>
                    </div>

                    {selectedRun.jobs.length > 0 && (
                      <div className="mt-3 slide-fade-in-delayed">
                        <h5 className="text-sm font-bold mb-2">
                          {t("workflowStatus.jobs")}
                        </h5>
                        <div className="space-y-2">
                          {selectedRun.jobs.map((job, index) => (
                            <div
                              key={job.id}
                              className="bg-dark/30 p-2 rounded text-xs"
                              style={{
                                animation: `slideFadeIn 0.25s ease ${0.1 + index * 0.05}s forwards`,
                                opacity: 0,
                                transform: "translateY(-10px)",
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{job.name}</span>
                                <div
                                  className={`${
                                    job.conclusion === "success"
                                      ? "bg-success/30 text-success"
                                      : job.conclusion === "failure"
                                        ? "bg-error/30 text-error"
                                        : "bg-yellow-500/30 text-yellow-300"
                                  } px-2 py-0.5 rounded text-xs font-medium flex items-center`}
                                >
                                  <span
                                    className={`${
                                      job.conclusion === "success"
                                        ? "text-success"
                                        : job.conclusion === "failure"
                                          ? "text-error"
                                          : "text-yellow-400"
                                    } mr-1`}
                                  >
                                    {/* Icons remain the same */}
                                  </span>
                                  {job.conclusion === "success"
                                    ? t("workflowStatus.success")
                                    : job.conclusion === "failure"
                                      ? t("workflowStatus.failed")
                                      : t("workflowStatus.inProgress")}
                                </div>
                              </div>

                              {job.steps && job.steps.length > 0 && (
                                <div className="mt-2 pl-2 border-l border-light/10">
                                  {job.steps.map(step => (
                                    <div
                                      key={step.number}
                                      className="flex justify-between py-1"
                                    >
                                      <span className="text-gray-400">
                                        {step.name}
                                      </span>
                                      <span
                                        className={
                                          step.conclusion === "success"
                                            ? "text-success"
                                            : step.conclusion === "failure"
                                              ? "text-error"
                                              : "text-yellow-400"
                                        }
                                      >
                                        {getStatusText(
                                          step.status,
                                          step.conclusion
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    {t("workflowStatus.failedToLoadDetails")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
