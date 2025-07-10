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

function DatasetCard({
  dataset,
  onSelect,
}: {
  dataset: Dataset
  onSelect: () => void
}) {
  return (
    <Card>
      <CardContent className="flex justify-between p-6">
        {/* Left side content */}
        <div className="flex flex-1 flex-col justify-between gap-3">
          {/* Title and badges */}
          <div>
            <div className="flex items-center gap-3">
              <h3
                className="cursor-pointer text-lg font-semibold text-blue-600 hover:underline"
                onClick={onSelect}
              >
                {dataset.name}
              </h3>
              {/* Dataset Badges */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-default gap-2 bg-green-100 text-green-800 transition-colors hover:bg-green-200 hover:text-green-900 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 dark:hover:text-green-100"
                    >
                      <TableIcon size={12} /> {dataset.type.toUpperCase()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Dataset format: {dataset.type.toUpperCase()}
                  </TooltipContent>
                </Tooltip>
                {dataset.source?.type === "shopify" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="cursor-default gap-2 transition-colors hover:bg-muted dark:hover:bg-muted"
                      >
                        <FaShopify size={14} /> Shopify
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Dataset linked from Shopify</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              {dataset.description}
            </CardDescription>
          </div>

          {/* Metadata row */}
          <div className="-ml-2 flex flex-wrap gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <DatasetMetaBadge>
                  <Users className="h-4 w-4 shrink-0" />
                  {`${dataset.usersCount} ${
                    dataset.usersCount === 1 ? "user" : "users"
                  }`}
                </DatasetMetaBadge>
              </TooltipTrigger>
              <TooltipContent collisionPadding={8}>
                {dataset.usersCount}{" "}
                {dataset.usersCount === 1 ? "user has" : "users have"} requested
                access to this dataset
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <DatasetMetaBadge>
                  <ChartColumn className="h-4 w-4 shrink-0" />
                  {dataset.requestsCount} requests
                </DatasetMetaBadge>
              </TooltipTrigger>
              <TooltipContent>
                {dataset.requestsCount} total access
                {dataset.requestsCount === 1 ? " request" : " requests"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <DatasetMetaBadge>
                  <Calendar className="h-4 w-4 shrink-0" />
                  Updated {timeAgo(dataset.lastUpdated.toISOString())}
                </DatasetMetaBadge>
              </TooltipTrigger>
              <TooltipContent>
                Last updated on{" "}
                {dataset.lastUpdated.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <DatasetMetaBadge>
                  <HardDrive className="h-4 w-4 shrink-0" />
                  {dataset.size}
                </DatasetMetaBadge>
              </TooltipTrigger>
              <TooltipContent>
                The dataset is {dataset.size} in size
              </TooltipContent>
            </Tooltip>
          </div>

          {/* User permissions pills */}
          {dataset.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dataset.permissions.map((email, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-muted text-xs"
                >
                  {email}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        {/* Right side - Activity graph */}
        <ActivityGraph data={dataset.activityData} />
      </CardContent>
    </Card>
  )
}

function DatasetLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="flex justify-between p-6">
            <div className="flex w-2/3 flex-col justify-between gap-1">
              <div className="space-y-1.5">
                <div className="h-6 w-1/3 rounded bg-muted"></div>
                <div className="h-4 w-2/3 rounded bg-muted"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-24 rounded bg-muted"></div>
                <div className="h-6 w-32 rounded bg-muted"></div>
                <div className="h-6 w-48 rounded bg-muted"></div>
              </div>
            </div>
            <div className="h-24 w-[188px] rounded bg-muted" />
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
