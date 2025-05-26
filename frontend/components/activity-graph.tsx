"use client"

interface ActivityGraphProps {
  data: number[]
  className?: string
}

export function ActivityGraph({ data, className = "" }: ActivityGraphProps) {
  const maxValue = Math.max(...data)

  const getIntensity = (value: number) => {
    if (value === 0) return 0
    if (value <= maxValue * 0.25) return 1
    if (value <= maxValue * 0.5) return 2
    if (value <= maxValue * 0.75) return 3
    return 4
  }

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-muted"
      case 1:
        return "bg-green-200 dark:bg-green-900"
      case 2:
        return "bg-green-300 dark:bg-green-700"
      case 3:
        return "bg-green-400 dark:bg-green-600"
      case 4:
        return "bg-green-500 dark:bg-green-500"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className={`flex items-end gap-1 ${className}`}>
      {data.map((value, index) => (
        <div
          key={index}
          className={`w-3 h-12 rounded-sm ${getColor(getIntensity(value))} transition-colors hover:opacity-80`}
          title={`Week ${index + 1}: ${value} accesses`}
          style={{
            height: `${Math.max(8, (value / maxValue) * 48)}px`,
          }}
        />
      ))}
    </div>
  )
}
