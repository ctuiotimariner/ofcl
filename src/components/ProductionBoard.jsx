
function ProductionBoard({ jobs }) {


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
      (job) => job.method === 'Embroidery' && job.status === 'Waiting for Blanks'
    )
  )

  const waitingHeatTransfer = sortJobsByPriority(
    jobs.filter(
      (job) => job.method === 'Heat Transfer' && job.status === 'Waiting for Blanks'
    )
  )

function getDueStatus(job) {
  if (!job.dueDate) return ""

  const today = new Date()
  today.setHours(0,0,0,0)

  const due = new Date(job.dueDate)
  due.setHours(0,0,0,0)

  const diffDays = (due - today) / (1000 * 60 * 60 * 24)

  if (diffDays < 0) return "overdue"
  if (diffDays <= 2) return "dueSoon"

  return ""
}

function sortJobsByPriority(jobs) {
  const today = new Date()
  today.setHours(0,0,0,0)

  return [...jobs].sort((a,b) => {

    const aDue = a.dueDate ? new Date(a.dueDate) : null
    const bDue = b.dueDate ? new Date(b.dueDate) : null

    if (aDue) aDue.setHours(0,0,0,0)
    if (bDue) bDue.setHours(0,0,0,0)

    const aOverdue = aDue && aDue < today
    const bOverdue = bDue && bDue < today

    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1

    const aDueSoon =
      aDue &&
      (aDue - today) / (1000 * 60 * 60 * 24) <= 2

    const bDueSoon =
      bDue &&
      (bDue - today) / (1000 * 60 * 60 * 24) <= 2

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




  return (
    <>
      <h2 className="productionTitle">PRINT FLOOR</h2>

      <div className="productionScreen">
        <div className="productionSection">
          <h3>EMBROIDERY - PRINTING NOW</h3>

          {embroideryJobs.length === 0 && <p>No active embroidery jobs</p>}

          {embroideryJobs.map((job) => (
            <div
              key={job.id}
              className="productionCard activePrint"
              style={getCardStyle(job, true)}
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
              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
              <p className={`dueDate ${getDueStatus(job)}`}>
                <strong>Due:</strong> {job.dueDate || "N/A"}
              </p>
            </div>
          ))}

          <h3 style={{ marginTop: '24px' }}>EMBROIDERY - NEXT UP</h3>

          {waitingEmbroidery.length === 0 && <p>No upcoming embroidery jobs</p>}

          {waitingEmbroidery.map((job) => (
           <div
            key={job.id}
            className="productionCard"
            style={getCardStyle(job)}
          >
              <h4>{job.orderGroup}</h4>
              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
              <p className={`dueDate ${getDueStatus(job)}`}>
                <strong>Due:</strong> {job.dueDate || "N/A"}
              </p>
            </div>
          ))}
        </div>

        <div className="productionSection">
          <h3>HEAT TRANSFER - PRINTING NOW</h3>

          {heatTransferJobs.length === 0 && <p>No active heat transfer jobs</p>}

          {heatTransferJobs.map((job) => (
            <div
              key={job.id}
              className="productionCard activePrint"
              style={getCardStyle(job, true)}
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

              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
              <p className={`dueDate ${getDueStatus(job)}`}>
                <strong>Due:</strong> {job.dueDate || 'N/A'}
              </p>
            </div>
          ))}

          <h3 style={{ marginTop: '24px' }}>HEAT TRANSFER - NEXT UP</h3>

          {waitingHeatTransfer.length === 0 && <p>No upcoming heat transfer jobs</p>}

          {waitingHeatTransfer.map((job) => (
            <div
              key={job.id}
              className="productionCard"
              style={getCardStyle(job)}
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

              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
              <p className={`dueDate ${getDueStatus(job)}`}>
                <strong>Due:</strong> {job.dueDate || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ProductionBoard