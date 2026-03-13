import { useEffect } from "react"
import {
  getDueStatus,
  sortJobsByPriority,
  getPriorityLabel
} from "../utils/productionHelpers"




function ProductionBoard({ jobs }) {

  const params = new URLSearchParams(window.location.search)
  const department = params.get("dept")
  const departments = [
  {
    name: "Embroidery",
    method: "Embroidery"
  },
  {
    name: "Heat Transfer",
    method: "Heat Transfer"
  }
]

function enterFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    }
  }


function getCardStyle(job, isActivePrint = false) {
    
    const dueStatus = getDueStatus(job)

    if (dueStatus === 'overdue') {
      return {
        border: '2px solid #ff5c5c',
        boxShadow: '0 0 18px rgba(255, 92, 92, 0.35)',
      }
    }

    if (dueStatus === 'dueSoon') {
      return {
        border: '2px solid #ffcc66',
        boxShadow: '0 0 18px rgba(255, 204, 102, 0.35)',
      }
    }

    if (isActivePrint) {
      return {
        border: '2px solid #6ee787',
        boxShadow: '0 0 18px rgba(110, 231, 135, 0.35)',
      }
    }

    return {
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: 'none',
    }
  }

  function renderJobCard(job, isActivePrint = false) {
    return (
      <div
        key={job.id}
        className={`productionCard ${isActivePrint ? 'activePrint' : ''}`}
        style={getCardStyle(job, isActivePrint)}
      >
        <div className="productionCardHeader">
          <h4>{job.orderGroup}</h4>

          {getPriorityLabel(job) && (
            <span
              className={`priorityBadge ${
                getPriorityLabel(job) === 'OVERDUE' ? 'overdue' : 'dueSoon'
              }`}
            >
              {getPriorityLabel(job)}
            </span>
          )}
        </div>

        <div className="productionCardBody">
          <div className="productionDetails">
            <p><strong>Garment:</strong> {job.garment}</p>
            <p><strong>Placement:</strong> {job.placement}</p>
            <p><strong>Qty:</strong> {job.qty}</p>
            <p><strong>Design:</strong> {job.designName}</p>
            <p className={`dueDate ${getDueStatus(job)}`}>
              <strong>Due:</strong> {job.dueDate || 'N/A'}
            </p>
          </div>

          {job.mockup && (
            <img
              src={job.mockup}
              alt="artwork preview"
              className="productionArtwork"
            />
          )}
        </div>
      </div>
    )
  }

  function renderSection(title, jobList, emptyMessage, isActivePrint = false) {
    return (
      <>
        <h3 style={{ marginTop: title.includes('NEXT UP') ? '24px' : '0' }}>
          {title}
        </h3>

        {jobList.length === 0 && <p>{emptyMessage}</p>}

        {jobList.map((job) => renderJobCard(job, isActivePrint))}
      </>
    )
  }

  const embroideryJobs = sortJobsByPriority(
  jobs.filter(
    (job) =>
      job.method === 'Embroidery' &&
      job.status === 'Printing' &&
      (!department || department === 'embroidery')
  )
)

const heatTransferJobs = sortJobsByPriority(
  jobs.filter(
    (job) =>
      job.method === 'Heat Transfer' &&
      job.status === 'Printing' &&
      (!department || department === 'heat')
  )
)

const waitingEmbroidery = sortJobsByPriority(
  jobs.filter(
    (job) =>
      job.method === 'Embroidery' &&
      job.status === 'Waiting for Blanks' &&
      (!department || department === 'embroidery')
  )
)

const waitingHeatTransfer = sortJobsByPriority(
  jobs.filter(
    (job) =>
      job.method === 'Heat Transfer' &&
      job.status === 'Waiting for Blanks' &&
      (!department || department === 'heat')
  )
)

const embroideryPrintingCount = embroideryJobs.length
const embroideryQueueCount = waitingEmbroidery.length

const heatPrintingCount = heatTransferJobs.length
const heatQueueCount = waitingHeatTransfer.length

const embroideryQtyTotal = embroideryJobs.reduce(
  (sum, job) => sum + (job.qty || 0),
  0
)

const heatQtyTotal = heatTransferJobs.reduce(
  (sum, job) => sum + (job.qty || 0),
  0
)

const departmentData = departments.map((dept) => {

  const printing = sortJobsByPriority(
    jobs.filter(
      (job) =>
        job.method === dept.method &&
        job.status === "Printing"
    )
  )

  const queue = sortJobsByPriority(
    jobs.filter(
      (job) =>
        job.method === dept.method &&
        job.status === "Waiting for Blanks"
    )
  )

  const printingCount = printing.length 
  const queueCount = queue.length
 const totalQty = [...printing, ...queue].reduce(
  (sum, job) => sum + Number(job.qty || 0),
  0
)

const overdueCount = [...printing, ...queue].filter((job) => {
  if (!job.dueDate) return false

  const today = new Date()
  today.setHours(0,0,0,0)

  const due = new Date(job.dueDate)
  due.setHours(0,0,0,0)

  return due < today
}).length
  

  return {
    name: dept.name,
    method: dept.method,
    printing,
    queue,
    printingCount,
    queueCount,
    totalQty,
    overdueCount
  }

})






  return (
    <>
      <h2 className="productionTitle">PRINT FLOOR</h2>

      <button className="fullscreenButton" onClick={enterFullscreen}>
        Full Screen Mode
      </button>

      <div className="productionScreen">
        {departmentData
          .filter((dept) => {
            if (!department) return true
            return dept.method.toLowerCase().includes(department)
          })
          .map((dept) => (
            <div key={dept.name} className="productionSection">


            <div className="departmentStats">
              <span>PRINTING: {dept.printingCount}</span>
              <span>QUEUE: {dept.queueCount}</span>
              <span>PIECES: {dept.totalQty}</span>
              <span className={dept.overdueCount ? "overdueStat" : ""}>
                OVERDUE: {dept.overdueCount}
              </span>
            </div>

            {renderSection(
              `${dept.name} - PRINTING NOW`,
              dept.printing,
              `No active ${dept.name.toLowerCase()} jobs`,
              true
            )}

            {renderSection(
              `${dept.name} - NEXT UP`,
              dept.queue,
              `No upcoming ${dept.name.toLowerCase()} jobs`
            )}

          </div>
        ))}

    </div>
    </>
  )
}

export default ProductionBoard