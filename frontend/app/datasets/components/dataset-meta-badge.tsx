import { cn } from "@/lib/utils"

export function DatasetMetaBadge({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "px-2 py-1 flex items-center space-x-1 rounded-sm cursor-default bg-transparent hover:bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors whitespace-nowrap gap-2",
        className
      )}
    >
      {children}
    </div>
  )
}
