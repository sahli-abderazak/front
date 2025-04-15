"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement)

export function DashboardCharts() {
  const pieData = {
    labels: ["Full-time", "Part-time", "Contract", "Remote"],
    datasets: [
      {
        data: [300, 150, 100, 150],
        backgroundColor: ["#2563eb", "#7c3aed", "#db2777", "#059669"],
      },
    ],
  }

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Salary Distribution",
        data: [1000000, 1200000, 1100000, 1300000, 1500000, 1580000],
        borderColor: "#2563eb",
        tension: 0.4,
      },
    ],
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Pie data={pieData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Salary By Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={lineData} />
        </CardContent>
      </Card>
    </div>
  )
}

