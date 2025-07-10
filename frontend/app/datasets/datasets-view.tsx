"use client"

import { FaShopify } from "react-icons/fa6"
import { useState, type ReactNode } from "react"
import { ActivityGraph } from "@/app/datasets/components/activity-graph"
import { CreateDatasetModal } from "@/app/datasets/components/create-dataset-modal"
import { DatasetActionsSheet } from "@/app/datasets/components/dataset-actions-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Cable,
  Calendar,
  ChartColumn,
  Database,
  HardDrive,
  Plus,
  TableIcon,
  Users,
} from "lucide-react"
import { timeAgo } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { AddShopifyDatasetModal } from "./components/add-shopify-dataset-modal"
import type { Dataset } from "@/lib/api/types"
import { datasetsApi } from "@/lib/api/datasets"
import { DatasetMetaBadge } from "./components/dataset-meta-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DatasetCard } from "./components/dataset-card"

export function DatasetsView() {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false)

  const loadDatasetsQuery = useQuery({
    queryKey: ["datasets"],
    queryFn: () => datasetsApi.getDatasets(),
  })

  const { isPending, data } = loadDatasetsQuery

  const handleActionsSheetClose = () => {
    setActionsSheetOpen(false)
    setSelectedDataset(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Datasets</h1>
          <p className="text-muted-foreground">
            Manage your cooperative's data assets
          </p>
        </div>
        <div className="flex gap-2">
          <AddShopifyDatasetAction />
          <UploadDatasetAction />
        </div>
      </div>

      {isPending || !data ? (
        <DatasetLoadingSkeleton />
      ) : (
        <div className="space-y-4">
          {data.datasets.length === 0 ? (
            <div className="mx-auto flex h-96 max-w-md flex-col items-center justify-center">
              <Database
                className="mb-6 size-16 text-muted-foreground"
                strokeWidth={1.5}
              />
              <h3 className="text-lg font-medium text-foreground">
                No datasets found
              </h3>
              <p className="mb-6 text-muted-foreground">
                Create a new dataset to get started
              </p>
            </div>
          ) : (
            data.datasets.map((dataset) => (
              <DatasetCard
                key={dataset.uid}
                dataset={dataset}
                onSelect={() => {
                  setSelectedDataset(dataset)
                  setActionsSheetOpen(true)
                }}
              />
            ))
          )}
        </div>
      )}

      <DatasetActionsSheet
        dataset={selectedDataset}
        open={actionsSheetOpen}
        onOpenChange={handleActionsSheetClose}
      />
    </div>
  )
}

function DatasetLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="flex justify-between p-6">
            <div className="flex w-2/3 flex-col justify-between gap-1">
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/3 rounded bg-muted"></Skeleton>
                <Skeleton className="h-4 w-2/3 rounded bg-muted"></Skeleton>
              </div>
              <div className="flex h-5 gap-2">
                <Skeleton className="h-full w-20"></Skeleton>
                <Skeleton className="h-full w-28"></Skeleton>
                <Skeleton className="h-full w-48"></Skeleton>
                <Skeleton className="h-full w-20"></Skeleton>
              </div>
            </div>
            <Skeleton className="h-24 w-64 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AddShopifyDatasetAction() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Cable />
        Link Shopify Dataset
      </Button>
      <AddShopifyDatasetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}

function UploadDatasetAction() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Upload Dataset
      </Button>
      <CreateDatasetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => setIsModalOpen(false)}
      />
    </>
  )
}
