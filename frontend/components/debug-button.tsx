import { BugIcon } from "lucide-react"
import { Button } from "./ui/button"

export function DebugButton({
  setDebug,
}: {
  setDebug: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <Button
      className="fixed top-4 right-4 size-16 opacity-50"
      onClick={() => setDebug((prev) => !prev)}
    >
      <BugIcon size={20} />
    </Button>
  )
}
