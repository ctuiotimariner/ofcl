


function DashboardMain({
  jobs,
  printingCount,
  lowStockCount,
  overdueCount,
  dueTodayCount,
  waitingForBlanksCount,
  nextActionText
}) {




const today = new Date()
today.setHours(0, 0, 0, 0)

const fixedDueTodayJobs = jobs.filter((job) => {
  if (!job.dueDate) return false

  const parts = job.dueDate.split("-")
  const due = new Date(parts[0], parts[1] - 1, parts[2])

  due.setHours(0, 0, 0, 0)

  return due.getTime() === today.getTime()
})




  return (
     <>
    <div className="sectionCard">
      <h3 className="sectionTitle">Dashboard</h3>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "20px"
  }}
>
  <div className="card" style={{ minHeight: "110px" }}>
    <div className="label">Active Jobs</div>
    <div className="value" style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}>
      {jobs.length}
    </div>
  </div>

  <div className="card" style={{ minHeight: "110px" }}>
    <div className="label">Printing</div>
    <div className="value" style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}>
      {printingCount}
    </div>
  </div>

  <div className="card" style={{ minHeight: "110px" }}>
    <div className="label">Low Stock</div>
    <div className="value" style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}>
      {lowStockCount}
    </div>
  </div>

  <div className="card" style={{ minHeight: "110px" }}>
    <div className="label">Overdue Jobs</div>
    <div
      className="value"
      style={{
        fontSize: "28px",
        fontWeight: "bold",
        marginTop: "8px",
        color: overdueCount > 0 ? "red" : "#ccc"
      }}
    >
      {overdueCount}
    </div>
  </div>

  <div className="card" style={{ minHeight: "110px" }}>
    <div className="label">Due Today</div>
    <div className="value" style={{ fontSize: "28px", fontWeight: "bold", marginTop: "8px" }}>
      {dueTodayCount}
    </div>
  </div>
</div>

<div className="card" style={{ marginTop: "20px" }}>
  <div className="label">
  <img src="/icons/sword.png" className="pixelIcon" />
  Next Action
</div>

  <p style={{ marginTop: "10px" }}>
  {nextActionText}
</p>
</div>

        <div
            className={`card ${overdueCount > 0 ? "alertCard" : ""}`}
            style={{ marginTop: "20px" }}
            >

        <div className="label">
          <img src="/icons/warning.png" className="pixelIcon" />
          Attention Needed
        </div>

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
            <div className="label">
              <img src="/icons/scroll.png" className="pixelIcon" />
              Message of the Day
            </div>
            <p style={{ marginTop: "10px" }}>
                Check blanks before starting jobs today.
            </p>
        </div>

            <div className="card" style={{ marginTop: "20px" }}>
        <div className="label">
          <img src="/icons/work.png" className="pixelIcon" />
          Today’s Jobs
        </div>

        {fixedDueTodayJobs.length === 0 ? (
          <p>No jobs due today</p>
        ) : (
          <div style={{ marginTop: "10px" }}>
            {fixedDueTodayJobs.map((job) => (
              <div
                key={job.id}
                className="todayJob"
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)"
                }}
              >
                {job.orderGroup} - {job.method} - {job.qty}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
)
}

export default DashboardMain