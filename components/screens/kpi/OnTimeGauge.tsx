"use client"

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts"

interface Props {
  onTimePct: number
  earlyPct: number
  latePct: number
}

export default function OnTimeGauge({ onTimePct, earlyPct, latePct }: Props) {
  const combinedOnTime = earlyPct + onTimePct

  const data = [
    { name: "bg", value: 100, fill: "#0e0e0e" },
    { name: "rate", value: combinedOnTime, fill: combinedOnTime >= 75 ? "#78dc77" : combinedOnTime >= 50 ? "#9ecaff" : "#e46962" },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="90%"
            startAngle={225}
            endAngle={-45}
            data={data}
            barSize={14}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={false}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline text-3xl font-bold text-on-surface">{combinedOnTime}%</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-outline mt-0.5">a tiempo</span>
        </div>
      </div>

      {/* Stat chips */}
      <div className="flex gap-3 flex-wrap justify-center">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary/10">
          <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{earlyPct}% Anticipado</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-tertiary/10">
          <div className="w-2 h-2 rounded-full bg-tertiary flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">{onTimePct}% A tiempo</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-error/10">
          <div className="w-2 h-2 rounded-full bg-error flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-error">{latePct}% Retraso</span>
        </div>
      </div>
    </div>
  )
}
