function DashboardMain({
  jobs,
  printingCount,
  lowStockCount,
  overdueCount,
  dueTodayCount,
  dueTodayJobs,
  waitingForBlanksCount
}) {
  return (
    <div>
      <h2>Dashboard</h2>

      <div className="stats">
        <div className="card">
          <div className="label">Active Jobs</div>
          <div className="value">{jobs.length}</div>
        </div>

        <div className="card">
          <div className="label">Printing</div>
          <div className="value">{printingCount}</div>
        </div>

        <div className="card">
          <div className="label">Low Stock</div>
          <div className="value">{lowStockCount}</div>
        </div>

        <div className="card">
          <div className="label">Overdue Jobs</div>
          <div
            className="value"
            style={{ color: overdueCount > 0 ? "red" : "white" }}
          >
            {overdueCount}
          </div>
        </div>

        <div className="card">
          <div className="label">Due Today</div>
          <div className="value">{dueTodayCount}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <div className="label">⚠️ Attention Needed</div>

        {overdueCount === 0 &&
        dueTodayCount === 0 &&
        waitingForBlanksCount === 0 ? (
            <p>Nothing urgent right now.</p>
        ) : (
            <div style={{ marginTop: "10px" }}>
            {overdueCount > 0 && <div>🚨 {overdueCount} overdue job(s)</div>}
            {dueTodayCount > 0 && <div>⏰ {dueTodayCount} due today</div>}
            {waitingForBlanksCount > 0 && <div>📦 {waitingForBlanksCount} waiting for blanks</div>}
            </div>
        )}
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
            <div className="label">📣 Message of the Day</div>
            <p style={{ marginTop: "10px" }}>
                Check blanks before starting jobs today.
            </p>
        </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <div className="label">Today’s Jobs</div>

        {dueTodayJobs.length === 0 ? (
          <p>No jobs due today</p>
        ) : (
          dueTodayJobs.map((job) => (
            <div key={job.id}>
              {job.orderGroup} - {job.method} - {job.qty}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DashboardMain