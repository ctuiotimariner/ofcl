import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function StatsPage() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    totalOrders: 0,
    unpaid: 0,
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

    setStats({
      revenue: totalRevenue,
      profit: totalProfit,
      totalOrders: data.length,
      unpaid: unpaidOrders,
    })
  }

  return (
    <div>
      <h2>Admin Stats</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div>
          <h3>Total Revenue</h3>
          <p>${stats.revenue.toFixed(2)}</p>
        </div>

        <div>
          <h3>Total Profit</h3>
          <p>${stats.profit.toFixed(2)}</p>
        </div>

        <div>
          <h3>Total Orders</h3>
          <p>{stats.totalOrders}</p>
        </div>

        <div>
          <h3>Unpaid Orders</h3>
          <p>{stats.unpaid}</p>
        </div>
      </div>
    </div>
  )
}

export default StatsPage