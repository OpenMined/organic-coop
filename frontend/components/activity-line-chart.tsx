"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ActivityGraph } from "./activity-graph";

interface ActivityLineChartProps {
  data: number[];
  className?: string;
}

export function ActivityLineChart({
  data,
  className = "",
}: ActivityLineChartProps) {
  const getWeekDateRange = (weekIndex: number) => {
    const now = new Date();
    const weeksAgo = 11 - weekIndex;
    const endDate = new Date(now);
    endDate.setDate(now.getDate() - weeksAgo * 7);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    return {
      start: startDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      end: endDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  };

  const chartData = data.map((value, index) => {
    const { start, end } = getWeekDateRange(index);
    return {
      week: `${start} - ${end}`,
      requests: value,
    };
  });

  const maxValue = Math.max(...data);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Activity Overview
          </CardTitle>
          <div className="text-xs text-muted-foreground">Last 12 weeks</div>
        </div>
      </CardHeader>
      <CardContent>
        <ActivityGraph data={data} fullWidth />
        {/* Activity Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
          <div>Total Requests: 1</div>
          <div>Avg: 0/week</div>
        </div>
      </CardContent>
    </Card>
  );
}
