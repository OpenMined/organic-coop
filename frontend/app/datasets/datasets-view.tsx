"use client"

import { useState } from "react"
import { ActivityGraph } from "@/components/activity-graph"
import { CreateDatasetModal } from "@/app/datasets/components/create-dataset-modal"
import { DatasetActionsSheet } from "@/components/dataset-actions-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Cable,
  Calendar,
  ChartColumn,
  Database,
  HardDrive,
  Plus,
  Users,
} from "lucide-react"
import { apiService, type Dataset } from "@/lib/api/api"
import { timeAgo } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { AddShopifyDatasetModal } from "./components/add-shopify-dataset-modal"

export function DatasetsView() {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [isActionsSheetOpen, setIsActionsSheetOpen] = useState(false)

  const loadDatasetsQuery = useQuery({
    queryKey: ["datasets"],
    queryFn: () => apiService.getDatasets(),
  })

  const { isLoading, data } = loadDatasetsQuery

  // const handleDatasetCreated = () => {
  //   setIsModalOpen(false);
  //   loadDatasets();
  // };

  const handleDatasetClick = (dataset: Dataset) => {
    setSelectedDataset(dataset)
    setIsActionsSheetOpen(true)
  }

  const handleActionsSheetClose = () => {
    setIsActionsSheetOpen(false)
    setSelectedDataset(null)
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
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
            <Card
              key={dataset.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  {/* Left side content */}
                  <div className="flex-1 space-y-3">
                    {/* Title and badge */}
                    <div className="flex items-center space-x-3">
                      <h3
                        className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                        onClick={() => handleDatasetClick(dataset)}
                      >
                        {dataset.name}
                      </h3>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900"
                            >
                              ● {dataset.type.toUpperCase()}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Dataset format: {dataset.type.toUpperCase()}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm">
                      {dataset.description}
                    </p>

                    {/* Metadata row */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
                      <TooltipProvider delayDuration={0}>
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
                            {dataset.usersCount === 1
                              ? "user has"
                              : "users have"}{" "}
                            requested access to this dataset
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider delayDuration={0}>
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
                            {dataset.requestsCount === 1
                              ? " request"
                              : " requests"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 shrink-0" />
                              <span className="whitespace-nowrap">
                                Updated{" "}
                                {timeAgo(dataset.lastUpdated.toISOString())}
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
                      </TooltipProvider>

                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-1">
                              <HardDrive className="h-4 w-4 shrink-0" />
                              <span className="whitespace-nowrap">
                                {dataset.size}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            The dataset is {dataset.size} in size
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* User permissions pills */}
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
                  </div>

                  {/* Right side - Activity graph */}
                  <div className="ml-8">
                    <ActivityGraph data={dataset.activityData} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* <DatasetActionsSheet
        dataset={selectedDataset}
        open={isActionsSheetOpen}
        onOpenChange={handleActionsSheetClose}
        onSuccess={handleDatasetCreated}
      /> */}
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
    <Button onClick={() => setIsModalOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Upload Dataset
      <CreateDatasetModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => setIsModalOpen(false)}
      />
    </Button>
  )
}
