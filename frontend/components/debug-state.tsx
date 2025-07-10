import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface DebugState {
  debugPending: boolean
  debugError: boolean
  debugState: boolean
}

interface DebugStateContextValue extends DebugState {
  setDebugPending: (value: boolean) => void
  setDebugError: (value: boolean) => void
  setDebugState: (value: boolean) => void
  toggleDebugPending: () => void
  toggleDebugError: () => void
  toggleDebugState: () => void
  resetAll: () => void
}

const DebugStateContext = createContext<DebugStateContextValue | undefined>(
  undefined,
)

interface StateDebuggerProviderProps {
  children: ReactNode
  show?: boolean
  initialState?: Partial<DebugState>
}

export function StateDebuggerProvider({
  children,
  show = false,
  initialState = {},
}: StateDebuggerProviderProps) {
  const [debugPending, setDebugPending] = useState(
    initialState.debugPending ?? false,
  )
  const [debugError, setDebugError] = useState(initialState.debugError ?? false)
  const [debugState, setDebugState] = useState(initialState.debugState ?? false)

  const toggleDebugPending = useCallback(
    () => setDebugPending((prev) => !prev),
    [],
  )
  const toggleDebugError = useCallback(() => setDebugError((prev) => !prev), [])
  const toggleDebugState = useCallback(() => setDebugState((prev) => !prev), [])

  const resetAll = useCallback(() => {
    setDebugPending(false)
    setDebugError(false)
    setDebugState(false)
  }, [])

  const value: DebugStateContextValue = {
    debugPending,
    debugError,
    debugState,
    setDebugPending,
    setDebugError,
    setDebugState,
    toggleDebugPending,
    toggleDebugError,
    toggleDebugState,
    resetAll,
  }

  return (
    <DebugStateContext.Provider value={value}>
      {show ? <DebugPanel /> : null}
      {children}
    </DebugStateContext.Provider>
  )
}

export function useDebugState() {
  const context = useContext(DebugStateContext)
  if (!context) {
    throw new Error("useDebugState must be used within a StateDebuggerProvider")
  }
  return context
}

export function DebugPanel() {
  const {
    debugPending,
    debugError,
    debugState,
    setDebugPending,
    setDebugError,
    setDebugState,
    resetAll,
  } = useDebugState()

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <Card className="fixed right-4 top-4 z-50 flex items-center gap-8 rounded-full p-4 px-6 opacity-60 shadow-lg">
      <div className="flex items-center gap-2">
        <Switch checked={debugPending} onCheckedChange={setDebugPending} />
        <Label className="whitespace-nowrap">Pending</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={debugError} onCheckedChange={setDebugError} />
        <Label className="whitespace-nowrap">Error</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={debugState} onCheckedChange={setDebugState} />
        <Label className="whitespace-nowrap">State</Label>
      </div>

      <Button
        onClick={resetAll}
        variant="outline"
        size="sm"
        className="w-full rounded-full px-6"
      >
        Reset All
      </Button>
    </Card>
  )
}
