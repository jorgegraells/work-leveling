"use client"

import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Member {
  id: string
  name: string
  avatarUrl: string | null
  level: number
  xp: number
  role: string
  departmentId: string | null
  departmentName: string | null
  activeMissions: number
  completedMissions: number
  archivedMissions: number
  avgProgress: number
}

interface MissionStats {
  byStatus: { status: string; count: number }[]
  byModule: { module: string; count: number }[]
  total: number
  active: number
  completed: number
  archived: number
}

interface Props {
  org: { id: string; name: string }
  departments: { id: string; name: string }[]
  members: Member[]
  missionStats: MissionStats
}

const MODULE_LABEL: Record<string, string> = {
  VENTAS_LEADS: "Ventas",
  PROYECTOS_CRONOGRAMA: "Proyectos",
  ALIANZAS_CONTRATOS: "Alianzas",
  INFORMES_CUMPLIMIENTO: "Informes",
  ESTRATEGIA_EXPANSION: "Estrategia",
}

const MODULE_COLOR: Record<string, string> = {
  VENTAS_LEADS: "#78dc77",
  PROYECTOS_CRONOGRAMA: "#9ecaff",
  ALIANZAS_CONTRATOS: "#e9c400",
  INFORMES_CUMPLIMIENTO: "#34a0fe",
  ESTRATEGIA_EXPANSION: "#8e9192",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completada",
  ARCHIVED: "Archivada",
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#8e9192",
  IN_PROGRESS: "#9ecaff",
  COMPLETED: "#78dc77",
  ARCHIVED: "#353535",
}

const ROLE_LABEL: Record<string, string> = {
  ORG_ADMIN: "Admin",
  MANAGER: "Manager",
  MEMBER: "Miembro",
  SUPER_ADMIN: "Super Admin",
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container-highest rounded-lg px-3 py-2 border border-outline-variant/20 text-xs">
      <p className="text-on-surface font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-outline">{p.name}: <span className="text-on-surface">{p.value}</span></p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container-highest rounded-lg px-3 py-2 border border-outline-variant/20 text-xs">
      <p className="text-on-surface font-bold">{payload[0].name}</p>
      <p className="text-outline">{payload[0].value} misiones</p>
    </div>
  )
}

export default function EmpresaDashboard({ org, departments, members, missionStats }: Props) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null)

  const filteredMembers = useMemo(
    () =>
      selectedDept
        ? members.filter((m) => m.departmentId === selectedDept)
        : members,
    [members, selectedDept]
  )

  const filteredStats = useMemo(() => {
    if (!selectedDept) return missionStats
    const deptMembers = members.filter((m) => m.departmentId === selectedDept)
    const total = deptMembers.reduce((s, m) => s + m.activeMissions + m.completedMissions + m.archivedMissions, 0)
    const active = deptMembers.reduce((s, m) => s + m.activeMissions, 0)
    const completed = deptMembers.reduce((s, m) => s + m.completedMissions, 0)
    const archived = deptMembers.reduce((s, m) => s + m.archivedMissions, 0)
    return { ...missionStats, total, active, completed, archived }
  }, [missionStats, members, selectedDept])

  const moduleData = missionStats.byModule.map((d) => ({
    name: MODULE_LABEL[d.module] ?? d.module,
    count: d.count,
    fill: MODULE_COLOR[d.module] ?? "#8e9192",
  }))

  const statusData = missionStats.byStatus
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: STATUS_LABEL[d.status] ?? d.status,
      value: d.count,
      fill: STATUS_COLOR[d.status] ?? "#8e9192",
    }))

  const completionRate =
    missionStats.total > 0
      ? Math.round(((missionStats.completed + missionStats.archived) / missionStats.total) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Dashboard</p>
          <h1 className="font-headline text-2xl font-bold text-on-surface mt-0.5">{org.name}</h1>
        </div>
        {/* Department filter */}
        {departments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDept(null)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                !selectedDept
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-highest text-outline hover:text-on-surface"
              }`}
            >
              Todos
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(selectedDept === d.id ? null : d.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                  selectedDept === d.id
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-highest text-outline hover:text-on-surface"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Empleados",
            value: filteredMembers.length,
            icon: "group",
            color: "text-tertiary",
          },
          {
            label: "Activas",
            value: filteredStats.active,
            icon: "military_tech",
            color: "text-primary",
          },
          {
            label: "Completadas",
            value: filteredStats.completed,
            icon: "check_circle",
            color: "text-secondary",
          },
          {
            label: "Tasa Completado",
            value: `${completionRate}%`,
            icon: "bar_chart",
            color: "text-on-tertiary-container",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="rounded-lg bg-surface-bright p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center flex-shrink-0">
                <span className={`material-symbols-outlined text-xl ${kpi.color}`}>
                  {kpi.icon}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-outline">
                  {kpi.label}
                </p>
                <p className={`font-headline text-2xl font-bold ${kpi.color} mt-0.5`}>
                  {kpi.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mission status donut */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
              Estado de Misiones
            </p>
            {statusData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-outline text-sm">
                Sin datos
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={160}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: d.fill }}
                      />
                      <span className="text-[10px] text-outline flex-1">{d.name}</span>
                      <span className="text-[10px] font-bold text-on-surface">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Missions by module bar chart */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
              Misiones por Módulo
            </p>
            {moduleData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-outline text-sm">
                Sin datos
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={moduleData} barSize={20}>
                  <XAxis
                    dataKey="name"
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
                  <Bar dataKey="count" name="Misiones" radius={[4, 4, 0, 0]}>
                    {moduleData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Employee table */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="rounded-lg bg-surface-bright p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Empleados
            </p>
            <span className="text-[10px] text-outline">
              {filteredMembers.length} trabajador{filteredMembers.length !== 1 ? "es" : ""}
            </span>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <span className="material-symbols-outlined text-4xl text-outline opacity-40 block">
                group
              </span>
              <p className="text-outline text-sm">Sin empleados en este departamento</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-3 pb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline">
                  Empleado
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-20 text-center">
                  Activas
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-20 text-center">
                  Completadas
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-16 text-center hidden sm:block">
                  XP
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-24 text-center hidden md:block">
                  Progreso
                </span>
              </div>

              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-3 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high transition-colors"
                >
                  {/* Name + avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover border border-outline-variant/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-outline text-base">
                          person
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-on-surface truncate">
                        {member.name}
                      </p>
                      <p className="text-[9px] text-outline">
                        Nv.{member.level}{" "}
                        {member.departmentName && (
                          <span className="text-on-surface-variant">· {member.departmentName}</span>
                        )}
                        {" "}
                        <span className="text-outline/60">
                          {ROLE_LABEL[member.role] ?? member.role}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Active missions */}
                  <div className="w-20 text-center">
                    <span
                      className={`text-sm font-bold ${
                        member.activeMissions > 0 ? "text-tertiary" : "text-outline/40"
                      }`}
                    >
                      {member.activeMissions}
                    </span>
                  </div>

                  {/* Completed */}
                  <div className="w-20 text-center">
                    <span
                      className={`text-sm font-bold ${
                        member.completedMissions > 0 ? "text-secondary" : "text-outline/40"
                      }`}
                    >
                      {member.completedMissions}
                    </span>
                  </div>

                  {/* XP */}
                  <div className="w-16 text-center hidden sm:block">
                    <span className="text-[11px] font-bold text-primary">
                      {member.xp >= 1000
                        ? `${(member.xp / 1000).toFixed(1).replace(/\.0$/, "")}k`
                        : member.xp}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-24 hidden md:block">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className="h-full rounded-full bg-secondary transition-all"
                          style={{ width: `${member.avgProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-outline w-8 text-right">
                        {member.avgProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
