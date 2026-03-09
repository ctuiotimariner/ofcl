function Sidebar({ currentPage, setCurrentPage, setRole }) {
  return (
    <aside className="sidebar">
      <h2>OFCL</h2>
        
         <button
        className={currentPage === 'dashboard' ? 'activeTab' : ''}
        onClick={() => setCurrentPage('dashboard')}
        >
        Dashboard
        </button>

      <button
        className={currentPage === "inventory" ? "activeTab" : ""}
        onClick={() => setCurrentPage("inventory")}
      >
        Inventory
      </button>

      <button
        className={currentPage === "jobs" ? "activeTab" : ""}
        onClick={() => setCurrentPage("jobs")}
      >
        Jobs
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

      <button onClick={() => setRole("")}>
        Logout
      </button>
    </aside>
  )
}

export default Sidebar