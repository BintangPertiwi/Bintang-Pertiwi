"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JurnalChartProps {
  data: {
    pieData: { name: string; value: number }[];
    lineData: { name: string; value: number }[];
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']

export function JurnalChart({ data }: JurnalChartProps) {
  const [activeTab, setActiveTab] = useState<"pie" | "line">("line")
  
  if (!data || (data.pieData.length === 0 && data.lineData.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Belum ada data untuk ditampilkan
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateVal: unknown) => {
    if (typeof dateVal !== "string") return String(dateVal || "")
    const parts = dateVal.split("-")
    if (parts.length === 3) {
      const d = new Date(dateVal)
      return `${parts[2]} ${d.toLocaleString('id-ID', { month: 'short' })}`
    }
    if (parts.length === 2) {
      const d = new Date(`${dateVal}-01`)
      return d.toLocaleString('id-ID', { month: 'short', year: 'numeric' })
    }
    return dateVal
  }

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`
    if (Math.abs(value) >= 1_000) return `Rp${(value / 1_000).toFixed(0)}k`
    return `Rp${value}`
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-end">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pie" | "line")} className="w-fit">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="pie" className="cursor-pointer">Komposisi</TabsTrigger>
            <TabsTrigger value="line" className="cursor-pointer">Tren Waktu</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[300px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "pie" ? (
            <PieChart>
              <Pie
                data={data.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                innerRadius={70}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer" />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: unknown) => [formatCurrency(Number(value)), "Pendapatan"]}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                formatter={(value) => (
                  <span className="text-foreground text-sm font-medium ml-1">{value}</span>
                )}
              />
            </PieChart>
          ) : (
            <AreaChart data={data.lineData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                tickFormatter={formatDate}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <RechartsTooltip 
                formatter={(value: unknown) => [formatCurrency(Number(value)), "Pendapatan"]}
                labelFormatter={formatDate}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--primary)" 
                strokeWidth={3}
                fill="url(#colorValue)"
                connectNulls={true}
                dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--background)" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
