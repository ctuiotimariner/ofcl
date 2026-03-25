import { useState, Fragment } from 'react'

function JobsPage({
  orders,
  emailCount,
  blanksCount,
  printingCount,
  completedCount,
  shippedCount,
  jobSearch,
  setJobSearch,
  groupedJobs,
  handleStatusChange,
  handleDeleteJob,
  getJobStatusClass,
  getDueDateClass,
  orderProgress,
}) {
  const [collapsedGroups, setCollapsedGroups] = useState({})


function getPaymentStatus(orderGroup) {
  const order = orders.find(
    (o) => o.orderNumber === orderGroup
  )

  return order?.paymentStatus || "Unpaid"
}





  function toggleGroup(group) {
        setCollapsedGroups((prev) => ({
          ...prev,
          [group]: !prev[group],
        }))
      } 



  function isOrderPaid(orderGroup) {
      const matchingOrder = orders.find(
        (order) => order.orderNumber === orderGroup
      )

      return matchingOrder?.paymentStatus === "Paid"
    }




  return (
    <>
      <h2>Jobs</h2>

      <div className="productionBoard">
        
        <div className="stageCard blanks">
          <div className="stageTitle">Waiting for Blanks</div>
          <div className="stageCount">{blanksCount}</div>
        </div>

        <div className="stageCard printing">
          <div className="stageTitle">Printing</div>
          <div className="stageCount">{printingCount}</div>
        </div>

        <div className="stageCard completed">
          <div className="stageTitle">Completed</div>
          <div className="stageCount">{completedCount}</div>
        </div>

        <div className="stageCard shipped">
          <div className="stageTitle">Shipped</div>
          <div className="stageCount">{shippedCount}</div>
        </div>
      </div>

      <input
        placeholder="Search jobs..."
        value={jobSearch}
        onChange={(e) => setJobSearch(e.target.value)}
      />

      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order Group</th>
              <th>Order Progress</th>
              <th>Client</th>
              <th>Garment</th>
              <th>Qty</th>
              <th>Due</th>
              <th>Sizes</th>
              <th>Placement</th>
              <th>Design</th>
              <th>Artwork</th>
              <th>Method</th>
              <th>Vendor</th>
              <th>PO</th>
              <th>Delivered</th>
              <th>Status</th>
              <th style={{ width: "140px" }}>Payment</th>
              <th style={{ width: "160px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedJobs).map(([group, jobs]) => (
              <Fragment key={group}>
                <tr
                  className="groupRow"
                  onClick={() => toggleGroup(group)}
                  style={{ cursor: 'pointer' }}
                >
                  <td colSpan="18">
                    <strong>
                      {collapsedGroups[group] ? '▶' : '▼'} {group}
                    </strong>{' '}
                    ({jobs.length} items)

                    {orderProgress[group] && (() => {
                      const progress = orderProgress[group]
                      const percent = Math.round(
                        (progress.completed / progress.total) * 100
                      )

                      return (
                        <span
                          style={{
                            marginLeft: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <div
                            style={{
                              width: '60px',
                              height: '6px',
                              background: 'rgba(255,255,255,0.15)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${percent}%`,
                                height: '100%',
                                background: '#4cd964',
                              }}
                            />
                          </div>

                          <span style={{ fontSize: '12px', opacity: 0.8 }}>
                            {progress.completed}/{progress.total}
                          </span>
                        </span>
                      )
                    })()}
                  </td>
                </tr>

                {!collapsedGroups[group] &&
                  jobs.map((job) => (

                    <tr
                        key={job.id}
                        className={`${getJobStatusClass(job.status)} ${getDueDateClass(job)}`}
                      >


                      <td>#{String(job.id).slice(-4)}</td>
                      <td>{job.orderGroup}</td>

                      <td>
                        {job.orderGroup &&
                          orderProgress[job.orderGroup] &&
                          (() => {
                            const progress = orderProgress[job.orderGroup]
                            const percent = Math.round(
                              (progress.completed / progress.total) * 100
                            )

                            return (
                              <div className="progressWrapper">
                                <div className="progressBar">
                                  <div
                                    className="progressFill"
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>

                                <div className="progressText">
                                  {progress.completed} / {progress.total}
                                </div>
                              </div>
                            )
                          })()}
                      </td>

                      <td>{job.client}</td>
                      <td>{job.garment}</td>
                      <td>{job.qty}</td>
                      <td>{job.dueDate}</td>
                      <td>{job.sizes}</td>
                      <td>{job.placement}</td>
                      <td>{job.designName}</td>

                      <td>
                        {job.mockup && (
                          <img
                            src={job.mockup}
                            alt="mockup"
                            style={{ width: '40px', borderRadius: '4px' }}
                          />
                        )}
                      </td>

                      <td>{job.method}</td>
                      <td>{job.vendor}</td>
                      <td>{job.poNumber}</td>
                      <td>{job.delivered ? '✔' : '—'}</td>

                      <td>
                        <span style={{ fontWeight: 600 }}>{job.status}</span>
                      </td>

                      <td>
                        <span
                          className={
                            getPaymentStatus(job.orderGroup) === "Paid"
                              ? "paymentBadge paid"
                              : "paymentBadge unpaid"
                          }
                        >
                          {getPaymentStatus(job.orderGroup)}
                        </span>
                      </td>

                      <td style={{ minWidth: "220px" }}>
  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
    {job.status === "Waiting for Blanks" && (
      <button
        style={{
          background: isOrderPaid(job.orderGroup) ? "#ffcc66" : "#555",
          color: isOrderPaid(job.orderGroup) ? "#000" : "#bbb",
          border: "none",
          padding: "6px 10px",
          borderRadius: "6px",
          fontWeight: 600,
          cursor: isOrderPaid(job.orderGroup) ? "pointer" : "not-allowed"
        }}
        onClick={() => {
          if (!isOrderPaid(job.orderGroup)) {
            alert("Order must be paid before printing.")
            return
          }

          handleStatusChange(job.id, "Printing")
        }}
      >
        ▶ Start Printing
      </button>
    )}

    {job.status === "Printing" && (
      <button
        style={{
          background: "#4cd964",
          color: "#000",
          border: "none",
          padding: "6px 10px",
          borderRadius: "6px",
          fontWeight: 600,
          cursor: "pointer"
        }}
        onClick={() => handleStatusChange(job.id, "Completed")}
      >
        ✔ Complete
      </button>
    )}

    {job.status === "Completed" && (
      <button
        style={{
          background: "#a78bfa",
          color: "#fff",
          border: "none",
          padding: "6px 10px",
          borderRadius: "6px",
          fontWeight: 600,
          cursor: "pointer"
        }}
        onClick={() => handleStatusChange(job.id, "Shipped")}
      >
        🚚 Ship
      </button>
    )}

    <button
      type="button"
      onClick={() => handleDeleteJob(job.id)}
    >
      Delete
    </button>
  </div>
</td>


                    </tr>
                  ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default JobsPage