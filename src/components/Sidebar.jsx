function Sidebar({ currentPage, setCurrentPage, setRole, allowedPages }) {
  const pages = [
    { key: "dashboard", label: "Dashboard" },
    { key: "orders", label: "Orders" },
    { key: "import", label: "Import Excel" },
    { key: "purchaseOrders", label: "Purchase Orders" },
    { key: "jobs", label: "Jobs" },
    { key: "tickets", label: "Tickets" },
    { key: "receiving", label: "Receiving" },
    { key: "production", label: "Production" },
    { key: "scan", label: "Scan Station" },
    { key: "scan-logs", label: "Scan Logs" },
    { key: "inventory", label: "Inventory" },
    { key: "stats", label: "Stats" },
    { key: "settings", label: "Settings" },
  ]

  return (
    <aside className="sidebar">
      <h2>OFCL</h2>

      {pages
        .filter((page) => allowedPages.includes(page.key))
        .map((page) => (
          <button
            key={page.key}
            className={currentPage === page.key ? "activeTab" : ""}
            onClick={() => setCurrentPage(page.key)}
          >
            {page.label}
          </button>
        ))}

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