"use client"

import { FaShopify } from "react-icons/fa6"
import { useState } from "react"
import { ActivityGraph } from "@/app/datasets/components/activity-graph"
import { CreateDatasetModal } from "@/app/datasets/components/create-dataset-modal"
import { DatasetActionsSheet } from "@/app/datasets/components/dataset-actions-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export function DatasetsView() {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false)

  const loadDatasetsQuery = useQuery({
    queryKey: ["datasets"],
    queryFn: () => datasetsApi.getDatasets(),
  })

  const { isLoading, data } = loadDatasetsQuery

  const handleActionsSheetClose = () => {
    setActionsSheetOpen(false)
    setSelectedDataset(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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

      {isLoading || !data ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 flex justify-between items-end">
                <div className="space-y-3 w-2/3">
                  <div className="h-7 bg-muted rounded w-1/3"></div>
                  <div className="h-5 bg-muted rounded w-2/3"></div>
                  <div className="flex gap-4">
                    <div className="h-5 bg-muted rounded w-24"></div>
                    <div className="h-5 bg-muted rounded w-32"></div>
                    <div className="h-5 bg-muted rounded w-48"></div>
                  </div>
                </div>
                <div className="h-16 bg-muted rounded w-[188px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data.datasets.length === 0 ? (
            <div className="mx-auto max-w-md h-96 flex flex-col items-center justify-center">
              <Database
                className="size-16 text-muted-foreground mb-6"
                strokeWidth={1.5}
              />
              <h3 className="text-lg font-medium text-foreground">
                No datasets found
              </h3>
              <p className="text-muted-foreground mb-6">
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
    <Card key={dataset.uid} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between">
          {/* Left side content */}
          <div className="flex-1 flex flex-col justify-between gap-3">
            {/* Title and badge */}
            <div className="flex items-center space-x-3">
              <h3
                className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                onClick={onSelect}
              >
                {dataset.name}
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="gap-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900"
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
                    <Badge variant="outline" className="gap-2">
                      <FaShopify size={14} /> Shopify
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Dataset linked from Shopify</TooltipContent>
                </Tooltip>
              ) : null}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm">
              {dataset.description}
            </p>

            {/* Metadata row */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">
                      {dataset.usersCount}{" "}
                      {dataset.usersCount === 1 ? "user" : "users"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {dataset.usersCount}{" "}
                  {dataset.usersCount === 1 ? "user has" : "users have"}{" "}
                  requested access to this dataset
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1">
                    <ChartColumn className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">
                      {dataset.requestsCount} requests
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {dataset.requestsCount} total access
                  {dataset.requestsCount === 1 ? " request" : " requests"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">
                      Updated {timeAgo(dataset.lastUpdated.toISOString())}
                    </span>
                  </div>
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
                  <div className="flex items-center space-x-1">
                    <HardDrive className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{dataset.size}</span>
                  </div>
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
                    className="text-xs bg-muted"
                  >
                    {email}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right side - Activity graph */}
          <div className="ml-8 flex items-end">
            <ActivityGraph data={dataset.activityData} />
          </div>
        </div>
      </CardContent>
    </Card>
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
