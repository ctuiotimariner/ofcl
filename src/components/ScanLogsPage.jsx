import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"


function ScanLogsPage() {
  const [logs, setLogs] = useState([])
  const [filterResult, setFilterResult] = useState("ALL")
  const [searchText, setSearchText] = useState("")

  async function fetchLogs() {
    
    const { data, error } = await supabase
      .from("scan_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("FETCH LOGS ERROR:", error)
      return
    }

    setLogs(data || [])
  }

  useEffect(() => {
        fetchLogs()

        const interval = setInterval(fetchLogs, 3000)

        return () => clearInterval(interval)
        }, [])

  return (
    <div className="sectionCard">
      <h3 className="sectionTitle">Scan Logs</h3>

      <div style={{ marginBottom: "10px", display: "flex", gap: "8px" }}>

            <button
                className={filterResult === "ALL" ? "buttonActive" : ""}
                onClick={() => setFilterResult("ALL")}
                >
                ALL
                </button>

            <button
                className={filterResult === "SUCCESS" ? "buttonActive" : ""}
                onClick={() => setFilterResult("SUCCESS")}
                >
                SUCCESS
                </button>

            <button
                className={filterResult === "ERROR" ? "buttonActive" : ""}
                onClick={() => setFilterResult("ERROR")}
                >
                ERROR
                </button>



                <input
                    placeholder="Search order, customer, status..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                        marginTop: "10px",
                        marginBottom: "14px",
                        width: "100%",
                    }}
                    />

      </div>



      {logs.length === 0 ? (
        <p>No logs yet</p>
      ) : (
        <div className="tableCard scanLogsTable">
  <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Action</th>
              <th>Status</th>
              <th>Result</th>
              <th>Message</th>
              <th>Employee</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {logs
                .filter((log) =>
                    filterResult === "ALL" ? true : log.result === filterResult
                )
                .filter((log) => {
                    const text = searchText.toLowerCase()

                    return (
                    String(log.order_number || "").toLowerCase().includes(text) ||
                    String(log.customer_name || "").toLowerCase().includes(text) ||
                    String(log.status || "").toLowerCase().includes(text) ||
                    String(log.message || "").toLowerCase().includes(text) ||
                    String(log.role || "").toLowerCase().includes(text)
                    )
                })
                .map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>{log.order_number}</td>
                <td>{log.customer_name}</td>
                <td>{log.action}</td>
                <td>{log.status}</td>
                <td
                    style={{
                        color: log.result === "SUCCESS" ? "#00ff99" : "#ff4d4f",
                        fontWeight: "bold",
                    }}
                    >
                    {log.result}
                    </td>
                <td>{log.message}</td>
                <td>{log.employee_name}</td>
                <td>{log.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      
    </div>
  )
}

export default ScanLogsPage