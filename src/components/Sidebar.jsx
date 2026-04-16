function Sidebar({ currentPage, setCurrentPage, setRole, allowedPages }) {
  return (
    <aside className="sidebar">

      <h2>OFCL</h2>

      {allowedPages.includes("dashboard") && (
        <button
        onClick={() => setCurrentPage("dashboard")}
        style={{
          background: currentPage === "dashboard" ? "#333" : "transparent"
        }}
      >
        Dashboard
      </button>
      )}

      {allowedPages.includes("orders") && (
        <button
        onClick={() => setCurrentPage("orders")}
        style={{
          background: currentPage === "orders" ? "#333" : "transparent"
        }}
      >
        Orders
      </button>
      )}

      <button onClick={() => setCurrentPage("purchaseOrders")}>
        PURCHASE ORDERS
      </button>

      {allowedPages.includes("jobs") && (
        <button 
          onClick={() => setCurrentPage("jobs")}
          style={{
          background: currentPage === "jobs" ? "#333" : "transparent"
        }}
        >
          Jobs
        </button>
      )}

      {allowedPages.includes("tickets") && (
        <button
          onClick={() => setCurrentPage("tickets")}
          style={{
            background: currentPage === "tickets" ? "#333" : "transparent"
          }}
        >
          Tickets
        </button>
      )}

      {allowedPages.includes("receiving") && (
        <button
          onClick={() => setCurrentPage("receiving")}
          style={{
            background: currentPage === "receiving" ? "#333" : "transparent"
          }}
        >
          Receiving
        </button>
      )}

         {allowedPages.includes("production") && (
          <button
            onClick={() => setCurrentPage("production")}
            style={{
              background: currentPage === "production" ? "#333" : "transparent"
            }}
          >
            Production
          </button>
        )}  

        {allowedPages.includes("scan") && (
          <button
            onClick={() => setCurrentPage("scan")}
            style={{
              background: currentPage === "scan" ? "#333" : "transparent"
            }}
          >
            Scan Station
          </button>
        )}

      {allowedPages.includes("inventory") && (
        <button
          onClick={() => setCurrentPage("inventory")}
          style={{
            background: currentPage === "inventory" ? "#333" : "transparent"
          }}
        >
          Inventory
        </button>
      )}

          

          {allowedPages.includes("settings") && (
      <button
        onClick={() => setCurrentPage("settings")}
        style={{
          background: currentPage === "settings" ? "#333" : "transparent"
        }}
      >
        Settings
      </button>
    )}

            {allowedPages.includes("stats") && (
      <button
        onClick={() => setCurrentPage("stats")}
        style={{
          background: currentPage === "stats" ? "#333" : "transparent"
        }}
      >
        Stats
      </button>
    )}

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