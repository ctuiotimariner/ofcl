function Sidebar({ currentPage, setCurrentPage, setRole }) {
  return (
    <aside className="sidebar">

      <h2>OFCL</h2>

      <button
        className={currentPage === "dashboard" ? "activeTab" : ""}
        onClick={() => setCurrentPage("dashboard")}
      >
        Dashboard
      </button>

      <button
        className={currentPage === "orders" ? "activeTab" : ""}
        onClick={() => setCurrentPage("orders")}
      >
        Orders
      </button>

      <button
        className={currentPage === "jobs" ? "activeTab" : ""}
        onClick={() => setCurrentPage("jobs")}
      >
        Jobs
      </button>

      <button
        className={currentPage === "tickets" ? "activeTab" : ""}
        onClick={() => setCurrentPage("tickets")}
      >
        Tickets
      </button>

      <button
        className={currentPage === "receiving" ? "activeTab" : ""}
        onClick={() => setCurrentPage("receiving")}
      >
        Receiving
      </button>

      <button
        className={currentPage === "production" ? "activeTab" : ""}
        onClick={() => setCurrentPage("production")}
      >
        Production
      </button>

      <button
        className={currentPage === "scan" ? "activeTab" : ""}
        onClick={() => setCurrentPage("scan")}
      >
        Scan Station
      </button>

      <button
        className={currentPage === "inventory" ? "activeTab" : ""}
        onClick={() => setCurrentPage("inventory")}
      >
        Inventory
      </button>

      <button
        className={currentPage === "vendors" ? "activeTab" : ""}
        onClick={() => setCurrentPage("vendors")}
      >
        Vendors
      </button>

      <button
        className={currentPage === "settings" ? "activeTab" : ""}
        onClick={() => setCurrentPage("settings")}
      >
        Settings
      </button>

      <button
        onClick={() => {
          localStorage.removeItem('role')
          localStorage.removeItem('currentPage')
          setRole('')
        }}
      >
        Logout
      </button>

    </aside>
  )
}

export default Sidebar