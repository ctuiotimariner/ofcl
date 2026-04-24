function Sidebar({ currentPage, setCurrentPage, setRole, allowedPages }) {
  return (
    <aside className="sidebar">
      <h2>OFCL</h2>

      {allowedPages.includes("dashboard") && (
        <button
          className={currentPage === "dashboard" ? "activeTab" : ""}
          onClick={() => setCurrentPage("dashboard")}
        >
          Dashboard
        </button>
      )}

      {allowedPages.includes("orders") && (
        <button
          className={currentPage === "orders" ? "activeTab" : ""}
          onClick={() => setCurrentPage("orders")}
        >
          Orders
        </button>
      )}

      <button
        className={currentPage === "purchaseOrders" ? "activeTab" : ""}
        onClick={() => setCurrentPage("purchaseOrders")}
      >
        Purchase Orders
      </button>

      {allowedPages.includes("jobs") && (
        <button
          className={currentPage === "jobs" ? "activeTab" : ""}
          onClick={() => setCurrentPage("jobs")}
        >
          Jobs
        </button>
      )}

      {allowedPages.includes("tickets") && (
        <button
          className={currentPage === "tickets" ? "activeTab" : ""}
          onClick={() => setCurrentPage("tickets")}
        >
          Tickets
        </button>
      )}

      {allowedPages.includes("receiving") && (
        <button
          className={currentPage === "receiving" ? "activeTab" : ""}
          onClick={() => setCurrentPage("receiving")}
        >
          Receiving
        </button>
      )}

      {allowedPages.includes("production") && (
        <button
          className={currentPage === "production" ? "activeTab" : ""}
          onClick={() => setCurrentPage("production")}
        >
          Production
        </button>
      )}

      {allowedPages.includes("scan") && (
          <button
            className={currentPage === "scan" ? "activeTab" : ""}
            onClick={() => setCurrentPage("scan")}
          >
            Scan Station
          </button>
        )}

        {allowedPages.includes("scan-logs") && (
          <button
            className={currentPage === "scan-logs" ? "activeTab" : ""}
            onClick={() => setCurrentPage("scan-logs")}
          >
            Scan Logs
          </button>
        )}

        {allowedPages.includes("inventory") && (
        <button
          className={currentPage === "inventory" ? "activeTab" : ""}
          onClick={() => setCurrentPage("inventory")}
        >
          Inventory
        </button>
      )}

      {allowedPages.includes("settings") && (
        <button
          className={currentPage === "settings" ? "activeTab" : ""}
          onClick={() => setCurrentPage("settings")}
        >
          Settings
        </button>
      )}

      {allowedPages.includes("stats") && (
        <button
          className={currentPage === "stats" ? "activeTab" : ""}
          onClick={() => setCurrentPage("stats")}
        >
          Stats
        </button>
      )}

      <button
        onClick={() => {
          localStorage.removeItem("role")
          localStorage.removeItem("currentPage")
          setRole("")
        }}
      >
        Logout
      </button>
    </aside>
  )
}

export default Sidebar