import z from "zod"
import { apiClient } from "./api-client"
import type { Dataset, DatasetResponse } from "./types"
import { formatBytes } from "../utils"
import { apiService, type Job } from "./api"

export const AddShopifyDatasetFormSchema = z.object({
  name: z.string().min(1, { message: "Dataset name is required" }),
  url: z
    .string()
    .min(1, { message: "Store URL is required" })
    .url({ message: "Not a valid URL" })
    .refine(
      (url) => {
        try {
          const urlObj = new URL(url)
          return urlObj.protocol === "https:" || urlObj.protocol === "http:"
        } catch {
          return false
        }
      },
      { message: "URL must start with http:// or https://" }
    ),
  pat: z.string().min(1, { message: "Access Token is required" }),
  description: z.string().optional(),
})

export const datasetsApi = {
  addShopifyDataset: (data: z.infer<typeof AddShopifyDatasetFormSchema>) => {
    return apiClient.post<{}>("/api/v1/datasets/add-from-shopify", data)
  },
  async getDatasets(): Promise<{ datasets: Dataset[] }> {
    const data = (await apiClient.get(`/api/v1/datasets`)) as {
      datasets: DatasetResponse[]
    }
    const jobs = await apiService.getJobs()

    const jobMap = jobs.jobs.reduce((map, job) => {
      const jobs = map.get(job.datasetName) || []
      map.set(job.datasetName, [...jobs, job])
      return map
    }, new Map<string, Job[]>())

    // Get the unique users count for each dataset
    const uniqueUsersMap = jobs.jobs.reduce((map, job) => {
      const uniqueEmails = map.get(job.datasetName) || new Set<string>()
      uniqueEmails.add(job.requesterEmail)
      map.set(job.datasetName, uniqueEmails)
      return map
    }, new Map<string, Set<string>>())

    // Get activity data for the past 12 weeks
    const getWeekNumber = (date: Date): number => {
      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
      return diffWeeks
    }

    const activityDataMap = jobs.jobs.reduce((map, job) => {
      const weekNumber = getWeekNumber(job.requestedTime)
      // Only consider jobs from the past 12 weeks
      if (weekNumber >= 0 && weekNumber < 12) {
        const currentActivity = map.get(job.datasetName) || Array(12).fill(0)
        // weekNumber 0 is current week, so we need to reverse the index
        currentActivity[11 - weekNumber]++
        map.set(job.datasetName, currentActivity)
      }
      return map
    }, new Map<string, number[]>())

    return {
      datasets: data.datasets.map((dataset) => ({
        uid: dataset.uid,
        name: dataset.name,
        description: dataset.summary,
        size: formatBytes(dataset.privateSize),
        type: dataset.private.split(".").pop() || "unknown",
        createdAt: new Date(dataset.createdAt),
        lastUpdated: new Date(dataset.updatedAt),
        accessRequests: 0,
        permissions: [],
        usersCount: uniqueUsersMap.get(dataset.name)?.size || 0,
        requestsCount: jobMap.get(dataset.name)?.length || 0,
        activityData: activityDataMap.get(dataset.name) || Array(12).fill(0),
        source: dataset.source,
      })),
    }
  },
}
