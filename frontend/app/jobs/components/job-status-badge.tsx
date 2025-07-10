import { Badge } from "@/components/ui/badge"
import type { Job } from "@/lib/api/api"
import { cn } from "@/lib/utils"

export function JobStatusBadge({ jobStatus }: { jobStatus: Job["status"] }) {
  const statusClassName = {
    pending:
      "border-yellow-200 bg-yellow-50 text-yellow-600 dark:border-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30",
    approved:
      "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
    denied:
      "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30",
  }

  return (
    <Badge className={cn(statusClassName[jobStatus], "pointer-events-none")}>
      {jobStatus}
    </Badge>
  )
}
