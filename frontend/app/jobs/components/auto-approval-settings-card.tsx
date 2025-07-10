import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiService } from "@/lib/api/api"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, Settings, X } from "lucide-react"
import { useForm } from "react-hook-form"
import z from "zod"

export function AutoApprovalSettingsCard() {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof EmailFormSchema>>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: {
      email: "",
    },
  })

  const loadDataQuery = useQuery({
    queryKey: ["autoApproved"],
    queryFn: async () => apiService.getAutoApprovedDatasites(),
  })
  const { isPending, isFetching, data } = loadDataQuery

  const addEmailMutation = useMutation({
    mutationFn: async ({
      autoApprovedEmails,
      email,
    }: {
      autoApprovedEmails: string[]
      email: string
    }) => {
      if (!email) return
      if (autoApprovedEmails.includes(email)) return
      const updatedList = [...autoApprovedEmails, email]
      return apiService.setAutoApprovedDatasites(updatedList)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["autoApproved"] })
      form.reset()
    },
  })

  const removeEmailMutation = useMutation({
    mutationFn: async ({
      autoApprovedEmails,
      email,
    }: {
      autoApprovedEmails: string[]
      email: string
    }) => {
      if (!email) return

      const updatedList = autoApprovedEmails.filter((e) => e !== email)
      return apiService.setAutoApprovedDatasites(updatedList)
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["autoApproved"] }),
  })

  function onSubmit(values: z.infer<typeof EmailFormSchema>) {
    addEmailMutation.mutate({
      autoApprovedEmails: data?.datasites ?? [],
      email: values.email,
    })
  }

  const isMutationPending =
    addEmailMutation.isPending || removeEmailMutation.isPending

  return (
    <Card
      className={cn(
        isMutationPending ? "opacity-50 pointer-events-none" : "opacity-100",
        "transition-opacity duration-100"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Auto-approval Settings
        </CardTitle>
        <CardDescription>
          Automatically approve requests from trusted datasites
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex space-x-2 items-end"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Add a trusted datasite email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="trusted@email.com"
                      type="email"
                      autoComplete="off"
                      disabled={isPending}
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button size="icon" disabled={isPending}>
              {addEmailMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus />
              )}
            </Button>
          </form>
        </Form>
        <div className="flex flex-wrap gap-2">
          {data?.datasites.map((datasiteEmail) => (
            <Badge
              key={datasiteEmail}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {datasiteEmail}
              <button
                onClick={() =>
                  removeEmailMutation.mutate({
                    email: datasiteEmail,
                    autoApprovedEmails: data.datasites,
                  })
                }
                className="ml-1 hover:text-destructive"
                disabled={isPending}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const EmailFormSchema = z.object({
  email: z.string().email("Not a valid email address"),
})
