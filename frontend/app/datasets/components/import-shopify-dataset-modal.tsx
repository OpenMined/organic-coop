"use client"

import type React from "react"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CableIcon, FileDownIcon } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { AddShopifyDatasetFormSchema, datasetsApi } from "@/lib/api/datasets"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface ImportShopifyDatasetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ImportShopifyDatasetModal({
  open,
  onOpenChange,
}: ImportShopifyDatasetModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof AddShopifyDatasetFormSchema>>({
    resolver: zodResolver(AddShopifyDatasetFormSchema),
    defaultValues: {
      name: "",
      url: "",
      pat: "",
      description: "",
    },
  })

  const addShopifyDatasetMutation = useMutation({
    mutationFn: datasetsApi.addShopifyDataset,
    onError: (error) => {
      console.error(error)
    },
    onSuccess: () => {
      onOpenChange(false)
      form.reset()
      toast({
        title: "Success",
        description: "Added a new dataset from Shopify",
      })
      return queryClient.invalidateQueries({ queryKey: ["datasets"] })
    },
  })

  const { isPending } = addShopifyDatasetMutation

  function onSubmit(values: z.infer<typeof AddShopifyDatasetFormSchema>) {
    addShopifyDatasetMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link data from your Shopify store</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="shopify_data" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Data from ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shopify Store URL *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-store.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token</FormLabel>
                  <FormControl>
                    <Input placeholder="shpat_123..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  form.reset()
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileDownIcon className="h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
