"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function CustomerSegments() {
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch with charts
  useEffect(() => {
    setMounted(true)
  }, [])

  const data = [
    { name: "High Value", value: 35, color: "#a3a3a3" },
    { name: "Regular", value: 45, color: "#737373" },
    { name: "Inactive", value: 15, color: "#404040" },
    { name: "New", value: 5, color: "#262626" },
  ]

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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, "Percentage"]}
            contentStyle={{ background: "#27272a", border: "none", borderRadius: "6px" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
