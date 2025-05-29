export interface Dataset {
  id: number;
  name: string;
  description: string;
  size: string;
  type: string;
  lastUpdated: Date;
  accessRequests: number;
  permissions: string[];
  activityData: number[];
}

export interface Job {
  id: number;
  projectName: string;
  description: string;
  requestedTime: Date;
  requesterEmail: string;
  status: "pending" | "approved" | "denied";
}

interface DatasetResponse {
  uid: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  name: string;
  private: string;
  mock: string;
  summary: string;
  readme: string;
  tags: string[];
  runtime: {
    cmd: string[];
    imageName: string | null;
    mountDir: string | null;
  };
  autoApproval: string[];
}

interface DatasetListResponse {
  datasets: DatasetResponse[];
}

interface JobStatus {
  pending_code_review: "pending_code_review";
  job_run_failed: "job_run_failed";
  job_run_finished: "job_run_finished";
  rejected: "rejected";
  shared: "shared";
  approved: "approved";
}

const pendingStatuses = ["pending_code_review", "job_run_failed"] as const;
const approvedStatuses = ["shared", "approved", "job_run_finished"] as const;
const deniedStatuses = ["rejected"] as const;

interface JobResponse {
  uid: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  name: string;
  description: string;
  userCodeId: string;
  tags: string[];
  userMetadata: Record<string, string>;
  status: JobStatus;
  error: string;
  errorMessage: string | null;
  outputUrl: string;
  datasetName: string;
  enclave: string;
}

interface JobListResponse {
  jobs: JobResponse[];
}

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "";
};

export const apiService = {
  async getDatasets(): Promise<{ datasets: Dataset[] }> {
    const response = await fetch(`${getBaseUrl()}/api/v1/datasets`);
    const data: DatasetListResponse = await response.json();
    return {
      datasets: data.datasets.map((dataset) => ({
        id: dataset.uid,
        name: dataset.name,
        description: dataset.summary,
        size: "1.8 MB", // TODO
        type: dataset.name.split(".")[1] || "unknown",
        lastUpdated: new Date(dataset.updatedAt),
        accessRequests: 0,
        permissions: [],
        activityData: [1, 2, 3, 5, 8, 13, 21, 18, 14, 19, 16],
      })),
    };
  },

  async createDataset(
    formData: FormData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/dataset`, {
        method: "POST",
        body: formData,
        // Important: Don't set Content-Type header - browser will set it automatically with boundary for FormData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create dataset");
      }

      const data: DatasetResponse = await response.json();
      return {
        success: true,
        message: `Dataset "${formData.get("name")}" created successfully`,
      };
    } catch (error) {
      console.error("Error creating dataset:", error);
      throw error;
    }
  },

  async getJobs(): Promise<{ jobs: Job[] }> {
    const response = await fetch(`${getBaseUrl()}/api/v1/jobs`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch jobs");
    }
    const data: JobListResponse = await response.json();
    return {
      jobs: data.jobs.map((job) => ({
        id: job.uid,
        projectName: job.name,
        description: job.description,
        requestedTime: new Date(job.createdAt),
        requesterEmail: job.createdBy,
        status: pendingStatuses.includes(job.status)
          ? "pending"
          : approvedStatuses.includes(job.status)
          ? "approved"
          : "denied",
      })),
    };
  },
};
