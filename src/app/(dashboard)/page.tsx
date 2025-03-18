"use client"

import type React from "react"

import { ArrowUpRight, Users, DollarSign, Activity, Package, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Dashboard data with proper typing
type StatCardProps = {
  title: string
  value: string
  icon: React.ElementType
  trend: string
  trendUp: boolean
}

type ChartDataPoint = {
  name: string
  total: number
}

const chartData: ChartDataPoint[] = [
  { name: "Jan", total: 2453 },
  { name: "Feb", total: 4567 },
  { name: "Mar", total: 3839 },
  { name: "Apr", total: 5343 },
  { name: "May", total: 6384 },
  { name: "Jun", total: 4564 },
]

const statCards: StatCardProps[] = [
  { title: "Total Users", value: "12,345", icon: Users, trend: "+12%", trendUp: true },
  { title: "Revenue", value: "$45,678", icon: DollarSign, trend: "+8%", trendUp: true },
  { title: "Active Sessions", value: "1,234", icon: Activity, trend: "+23%", trendUp: true },
  { title: "Total Products", value: "892", icon: Package, trend: "+4%", trendUp: true },
]

const recentActivities = [
  "New user registration: John Doe",
  "Product update: Version 2.0 released",
  "New order #1234 received",
  "System maintenance completed",
]

const quickActions = ["Add New User", "Create Product", "View Reports", "System Settings"]

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 >Welcome back, Admin</h2>
          <p className="text-semibold">Here&apos;s what&apos;s happening today.</p>
        </div>
        <Button className="gap-2 group">
          View Analytics
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="space-y-1">
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index} text={activity} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <ActionButton key={index} text={action} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Component for stat cards
function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
        </div>
        <div className={`text-xs sm:text-sm mt-2 flex items-center ${trendUp ? "text-green-600" : "text-red-600"}`}>
          {trend}
          <ArrowUpRight className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 ${!trendUp && "rotate-90"}`} />
        </div>
      </CardContent>
    </Card>
  )
}

// Component for revenue chart
function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
      <ChartContainer
        config={{
          total: {
            label: "Revenue",
            color: "var(--primary)",
          },
        }}
        className="h-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            className="text-xs text-muted-foreground"
            tick={{ fontSize: 12 }}
            width={60}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} className="hover:fill-primary/80" />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

// Component for activity items
function ActivityItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
      <p className="text-xs sm:text-sm">{text}</p>
    </div>
  )
}

// Component for action buttons
function ActionButton({ text }: { text: string }) {
  return (
    <Button
      variant="outline"
      className="justify-start h-auto py-2 sm:py-3 px-3 sm:px-4 hover:bg-muted transition-colors text-left text-xs sm:text-sm"
    >
      {text}
    </Button>
  )
}

