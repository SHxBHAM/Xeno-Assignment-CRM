"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Define colors for different campaign statuses
const STATUS_COLORS = {
  DRAFT: "#a3a3a3",      // Gray
  SENDING: "#22c55e",    // Green
  COMPLETED: "#3b82f6",  // Blue
  FAILED: "#ef4444",     // Red
  PROCESSING: "#f59e0b"  // Amber
}

type CampaignStatusData = {
  name: string
  value: number
  color: string
}

export function CampaignStatusChart({ data }: { data: CampaignStatusData[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name} (${value})`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} campaigns`, name]}
            contentStyle={{ background: "#27272a", border: "none", borderRadius: "6px" }}
          />
          <Legend 
            formatter={(value) => value.charAt(0) + value.slice(1).toLowerCase()}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
