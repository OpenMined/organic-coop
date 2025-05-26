// Mock data for demonstration
const mockJobs = [
  {
    id: 1,
    projectName: "Crop Rotation Analysis",
    description: "Analyzing optimal crop rotation patterns for increased yield",
    requestedTime: "2 hours ago",
    requesterEmail: "researcher@university.edu",
    status: "pending",
  },
  {
    id: 2,
    projectName: "Pest Management Study",
    description: "Research on organic pest control methods effectiveness",
    requestedTime: "1 day ago",
    requesterEmail: "entomologist@research.org",
    status: "approved",
  },
  {
    id: 3,
    projectName: "Water Usage Optimization",
    description: "Study on irrigation efficiency in organic farming",
    requestedTime: "3 days ago",
    requesterEmail: "waterexpert@consulting.com",
    status: "denied",
  },
];

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
  requestedTime: string;
  requesterEmail: string;
  status: "pending" | "approved" | "denied";
}

interface DatasetResponse {
  uid: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
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
        lastUpdated: dataset.updatedAt,
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
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { jobs: mockJobs };
  },
};
