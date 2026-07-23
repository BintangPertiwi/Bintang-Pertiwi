"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JurnalChartProps {
  data: {
    pieData: { name: string; value: number }[];
    lineData: { name: string; value: number }[];
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']

export function JurnalChart({ data }: JurnalChartProps) {
  const [activeTab, setActiveTab] = useState<"pie" | "line">("pie")
  
  if (!data || (data.pieData.length === 0 && data.lineData.length === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Belum ada data untuk ditampilkan
      </div>
    )
  }

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format date for timeline
  const formatDate = (dateVal: unknown) => {
    if (typeof dateVal !== "string") return String(dateVal || "")
    const parts = dateVal.split("-")
    if (parts.length === 3) {
      return `${parts[2]} ${new Date(dateVal).toLocaleString('id-ID', { month: 'short' })}`
    }
    if (parts.length === 2) {
      return new Date(`${dateVal}-01`).toLocaleString('id-ID', { month: 'short', year: 'numeric' })
    }
    return dateVal
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-end">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "pie" | "line")} className="w-fit">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="pie">Komposisi</TabsTrigger>
            <TabsTrigger value="line">Tren Waktu</TabsTrigger>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: unknown) => [formatCurrency(Number(value)), "Pendapatan"]}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
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
            <LineChart data={data.lineData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={(value) => `Rp${value / 1000}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <RechartsTooltip 
                formatter={(value: unknown) => [formatCurrency(Number(value)), "Pendapatan"]}
                labelFormatter={formatDate}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
