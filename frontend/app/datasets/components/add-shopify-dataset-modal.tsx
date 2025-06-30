"use client"

import type React from "react"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Loader2, CableIcon } from "lucide-react"
import { apiService } from "@/lib/api/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { AddShopifyDatasetFormSchema, datasetsApi } from "@/lib/api/datasets"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface AddShopifyDatasetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddShopifyDatasetModal({
  open,
  onOpenChange,
  onSuccess,
}: AddShopifyDatasetModalProps) {
  const { toast } = useToast()
  const [apiKey, setApiKey] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const queryClient = useQueryClient()

  const addShopifyDatasetMutation = useMutation({
    mutationFn: datasetsApi.addShopifyDataset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] })
      toast({
        title: "Success",
        description: "Added a new dataset from Shopify",
      })
      onSuccess?.()
    },
  })

  const { isPending } = addShopifyDatasetMutation

  const form = useForm<z.infer<typeof AddShopifyDatasetFormSchema>>({
    resolver: zodResolver(AddShopifyDatasetFormSchema),
    defaultValues: {
      name: "",
      url: "",
      pat: "",
      description: "",
    },
  })

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
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shopify Store URL *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-store.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="apiKey">Admin access token *</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="shpat_123..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dataset containing..."
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="break-all">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <CableIcon className="mr-2 h-4 w-4" />
                    Link
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
