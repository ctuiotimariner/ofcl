import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

function StatsPage() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    totalOrders: 0,
    unpaid: 0,
    paidRevenue: 0,
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const { data, error } = await supabase.from("orders").select("*")

    if (error) {
      console.error("Error fetching orders:", error)
      return
    }

    setOrders(data)
    calculateStats(data)
  }

  function calculateStats(data) {
    const totalRevenue = data.reduce(
      (sum, order) => sum + Number(order.totalRevenue || 0),
      0
    )

    const totalProfit = data.reduce(
      (sum, order) => sum + Number(order.totalProfit || 0),
      0
    )

    const unpaidOrders = data.filter(
      (order) => order.paymentStatus !== "Paid"
    ).length

    const paidRevenue = data
      .filter((order) => order.paymentStatus === "Paid")
      .reduce((sum, order) => sum + Number(order.totalRevenue || 0), 0)

    setStats({
      revenue: totalRevenue,
      profit: totalProfit,
      totalOrders: data.length,
      unpaid: unpaidOrders,
      paidRevenue: paidRevenue,
    })
  }

  function buildChartData(data) {
    const grouped = {}

    data.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString()

      if (!grouped[date]) {
        grouped[date] = 0
      }

      grouped[date] += Number(order.totalRevenue || 0)
    })

    return Object.keys(grouped).map((date) => ({
      date,
      revenue: grouped[date],
    }))
  }

  const chartData = buildChartData(orders)

 return (
  <>
    <div className="sectionCard">
      <h3 className="sectionTitle">Admin Stats</h3>

      <h3 style={{ marginTop: "10px", color: "#00ff9f", opacity: 0.8 }}>
        Financial Overview
      </h3>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>${stats.revenue.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Paid Revenue</h3>
          <p>${stats.paidRevenue.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Total Profit</h3>
          <p>${stats.profit.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>

        <div className="stat-card">
          <h3>Unpaid Orders</h3>
          <p>{stats.unpaid}</p>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#00ff9f", marginBottom: "20px" }}>
          Revenue Trend
        </h3>

        <div
          style={{
            border: "1px solid #00ff99",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "20px",
            overflowX: "auto",
          }}
        >
          <LineChart width={800} height={300} data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,255,153,0.25)"
            />
            <XAxis
              dataKey="date"
              stroke="#00ff99"
              tick={{ fill: "#b6ffdf", fontSize: 12 }}
            />
            <YAxis
              stroke="#00ff99"
              tick={{ fill: "#b6ffdf", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b0f0f",
                border: "1px solid #00ff99",
                borderRadius: "8px",
                boxShadow: "0 0 10px #00ff99",
              }}
              labelStyle={{ color: "#00ff99" }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#00ff99"
              strokeWidth={3}
              dot={{
                r: 6,
                stroke: "#00ff99",
                strokeWidth: 2,
                fill: "#0b0f0f",
              }}
              activeDot={{ r: 8 }}
              style={{ filter: "drop-shadow(0 0 6px #00ff99)" }}
            />
          </LineChart>
        </div>
      </div>
    </div>
  </>
)
}

export default StatsPage