import z from "zod"
import { apiClient } from "./api-client"

export const datasetsApi = {
  addShopifyDataset: (data: z.infer<typeof AddShopifyDatasetFormSchema>) =>
    apiClient.post<{}>("/api/v1/datasets/add-from-shopify", data),
}

export const AddShopifyDatasetFormSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  pat: z.string(),
  description: z.string().optional(),
})
