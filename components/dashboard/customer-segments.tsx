"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Define colors for different campaign statuses
const STATUS_COLORS = {
  PROCESSING: "#f59e0b", // Amber
  COMPLETED: "#3b82f6", // Blue
};

type CampaignStatusData = {
  name: string;
  value: number;
  color: string;
};

export function CampaignStatusChart({ data }: { data: CampaignStatusData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    );
  }

  // Only show statuses with value > 0
  const filteredData = data.filter(
    (d) => d.value > 0 && (d.name === "PROCESSING" || d.name === "COMPLETED")
  );

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            label={({ name, value }) =>
              value > 0
                ? `${name.charAt(0) + name.slice(1).toLowerCase()} (${value})`
                : ""
            }
            labelLine={false}
            isAnimationActive={true}
            stroke="#18181b"
            strokeWidth={2}
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] ||
                  "#a3a3a3"
                }
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [
              `${value} campaign${value === 1 ? "" : "s"}`,
              name.charAt(0) + name.slice(1).toLowerCase(),
            ]}
            contentStyle={{
              background: "#27272a",
              border: "none",
              borderRadius: "6px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-6 justify-center mt-4 text-sm">
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ background: STATUS_COLORS.COMPLETED }}
          />
          <span className="text-blue-400 font-medium">Completed</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ background: STATUS_COLORS.PROCESSING }}
          />
          <span className="text-amber-400 font-medium">Processing</span>
        </span>
      </div>
      {filteredData.length === 1 && (
        <div className="text-center text-muted-foreground text-xs mt-2">
          Only one campaign status present. Add or run campaigns to see more
          distribution.
        </div>
      )}
    </div>
  );
}
