import { useEffect } from "react"

function ProductionBoard({ jobs }) {

useEffect(() => {
  const interval = setInterval(() => {
    window.location.reload()
  }, 15000) // refresh every 15 seconds

  return () => clearInterval(interval)
}, [])

  function getDueStatus(job) {
    if (!job.dueDate) return ''

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(job.dueDate)
    due.setHours(0, 0, 0, 0)

    const diffDays = (due - today) / (1000 * 60 * 60 * 24)

    if (diffDays < 0) return 'overdue'
    if (diffDays <= 2) return 'dueSoon'

    return ''
  }

  function sortJobsByPriority(jobList) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return [...jobList].sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate) : null
      const bDue = b.dueDate ? new Date(b.dueDate) : null

      if (aDue) aDue.setHours(0, 0, 0, 0)
      if (bDue) bDue.setHours(0, 0, 0, 0)

      const aOverdue = aDue && aDue < today
      const bOverdue = bDue && bDue < today

      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1

      const aDueSoon =
        aDue && (aDue - today) / (1000 * 60 * 60 * 24) <= 2
      const bDueSoon =
        bDue && (bDue - today) / (1000 * 60 * 60 * 24) <= 2

      if (aDueSoon && !bDueSoon) return -1
      if (!aDueSoon && bDueSoon) return 1

      return 0
    })
  }

  function getPriorityLabel(job) {
    if (!job.dueDate) return ''

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(job.dueDate)
    due.setHours(0, 0, 0, 0)

    const diffDays = (due - today) / (1000 * 60 * 60 * 24)

    if (diffDays < 0) return 'OVERDUE'
    if (diffDays <= 2) return 'DUE SOON'

    return ''
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
      (job) => job.method === 'Embroidery' && job.status === 'Printing'
    )
  )

  const heatTransferJobs = sortJobsByPriority(
    jobs.filter(
      (job) => job.method === 'Heat Transfer' && job.status === 'Printing'
    )
  )

  const waitingEmbroidery = sortJobsByPriority(
    jobs.filter(
      (job) =>
        job.method === 'Embroidery' &&
        job.status === 'Waiting for Blanks'
    )
  )

  const waitingHeatTransfer = sortJobsByPriority(
    jobs.filter(
      (job) =>
        job.method === 'Heat Transfer' &&
        job.status === 'Waiting for Blanks'
    )
  )

  return (
    <>
      <h2 className="productionTitle">PRINT FLOOR</h2>

      <div className="productionScreen">
        <div className="productionSection">
          {renderSection(
            'EMBROIDERY - PRINTING NOW',
            embroideryJobs,
            'No active embroidery jobs',
            true
          )}

          {renderSection(
            'EMBROIDERY - NEXT UP',
            waitingEmbroidery,
            'No upcoming embroidery jobs'
          )}
        </div>

        <div className="productionSection">
          {renderSection(
            'HEAT TRANSFER - PRINTING NOW',
            heatTransferJobs,
            'No active heat transfer jobs',
            true
          )}

          {renderSection(
            'HEAT TRANSFER - NEXT UP',
            waitingHeatTransfer,
            'No upcoming heat transfer jobs'
          )}
        </div>
      </div>
    </>
  )
}

export default ProductionBoard