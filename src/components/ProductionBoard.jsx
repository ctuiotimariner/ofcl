import { useEffect } from "react"

function ProductionBoard({ jobs }) {
    useEffect(() => {
        const interval = setInterval(() => {
        window.location.reload()
        }, 30000)

        return () => clearInterval(interval)
        }, [])

 function sortByUrgency(a, b) {
  const today = new Date()
  today.setHours(0,0,0,0)

  const aDue = a.dueDate ? new Date(a.dueDate) : null
  const bDue = b.dueDate ? new Date(b.dueDate) : null

  if (aDue) aDue.setHours(0,0,0,0)
  if (bDue) bDue.setHours(0,0,0,0)

  const aOverdue = aDue && aDue < today
  const bOverdue = bDue && bDue < today

  if (aOverdue && !bOverdue) return -1
  if (!aOverdue && bOverdue) return 1

  const aDiff = aDue ? aDue - today : Infinity
  const bDiff = bDue ? bDue - today : Infinity

  return aDiff - bDiff
}

const printingJobs = jobs
  .filter(job => job.status === "Printing")
  .sort(sortByUrgency)

const nextJobs = jobs
  .filter(job => job.status === "Waiting for Blanks")
  .sort(sortByUrgency)


  return (
    <>
      <h2 className="productionTitle">PRINT FLOOR</h2>

      <div className="productionScreen">

        <div className="productionSection">
          <h3>PRINTING NOW</h3>

          {printingJobs.length === 0 && <p>No active jobs</p>}

          {printingJobs.map(job => (
            <div key={job.id} className="productionCard activePrint">
              <h4>{job.orderGroup}</h4>
              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
            </div>
          ))}
        </div>


        <div className="productionSection">
          <h3>NEXT UP</h3>

          {nextJobs.length === 0 && <p>No upcoming jobs</p>}

          {nextJobs.map(job => (
            <div key={job.id} className="productionCard">
              <h4>{job.orderGroup}</h4>
              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}

export default ProductionBoard