"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useTranslations } from "next-intl"
import type { MonthBucket } from "@/lib/kpi-helpers"

interface Props {
  data: MonthBucket[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container-highest rounded-lg px-3 py-2 border border-outline-variant/20 text-xs shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <p className="text-on-surface font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 text-outline">
          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: p.fill }} />
          {p.name}: <span className="text-on-surface font-bold ml-1">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function TimelinessStackedBar({ data }: Props) {
  const t = useTranslations("kpi")
  if (!data.length) {
    return (
      <div className="h-40 flex items-center justify-center text-outline text-sm">
        {t("noData")}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={18} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="month"
          tick={{ fill: "#8e9192", fontSize: 9, fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#8e9192", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="early" name="Anticipado" stackId="a" fill="#78dc77" radius={[0, 0, 0, 0]} />
        <Bar dataKey="onTime" name="A tiempo" stackId="a" fill="#9ecaff" radius={[0, 0, 0, 0]} />
        <Bar dataKey="late" name="Con retraso" stackId="a" fill="#e46962" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
