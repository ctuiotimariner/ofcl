import { useState, Fragment } from "react"
import { supabase } from "../lib/supabase"

function JobsPage({
  orders,
  setJobs,
  setOrders,
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

  async function updateOrderStatusByOrderGroup(orderGroup) {
    try {
      const { data: relatedJobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("orderGroup", orderGroup)

      if (jobsError) {
        console.error("FETCH RELATED JOBS ERROR:", jobsError)
        return
      }

      if (!relatedJobs || relatedJobs.length === 0) {
        const { error: orderError } = await supabase
          .from("orders")
          .update({ status: "Email Received" })
          .eq("orderNumber", orderGroup)

        if (orderError) {
          console.error("UPDATE ORDER STATUS ERROR:", orderError)
        }

        return
      }

      const statuses = relatedJobs.map((job) => job.status)

      let finalStatus = "Email Received"

      const allPickedUp = statuses.every((status) => status === "Picked Up")
      const allShipped = statuses.every((status) => status === "Shipped")
      const allWillCall = statuses.every((status) => status === "Will Call")
      const allReadyForShipping = statuses.every(
        (status) => status === "Ready for Shipping"
      )

      const hasWaitingForBlanks = statuses.some(
        (status) => status === "Waiting for Blanks"
      )
      const hasDTFNextUp = statuses.some((status) => status === "DTF Next Up")
      const hasDTFPrinting = statuses.some((status) => status === "DTF Printing")
      const hasDTFOnDeck = statuses.some((status) => status === "DTF On Deck")
      const hasHeatPressNextUp = statuses.some(
        (status) => status === "Heat Press Next Up"
      )
      const hasHeatPressing = statuses.some(
        (status) => status === "Heat Pressing"
      )
      const hasReadyForShipping = statuses.some(
        (status) => status === "Ready for Shipping"
      )
      const hasWillCall = statuses.some((status) => status === "Will Call")

      if (allPickedUp) {
        finalStatus = "Picked Up"
      } else if (allShipped) {
        finalStatus = "Shipped"
      } else if (allWillCall) {
        finalStatus = "Will Call"
      } else if (allReadyForShipping) {
        finalStatus = "Ready for Shipping"
      } else if (hasHeatPressing) {
        finalStatus = "Heat Pressing"
      } else if (hasHeatPressNextUp) {
        finalStatus = "Heat Press Next Up"
      } else if (hasDTFOnDeck) {
        finalStatus = "DTF On Deck"
      } else if (hasDTFPrinting) {
        finalStatus = "DTF Printing"
      } else if (hasDTFNextUp) {
        finalStatus = "DTF Next Up"
      } else if (hasWaitingForBlanks) {
        finalStatus = "Waiting for Blanks"
      } else if (hasReadyForShipping) {
        finalStatus = "Ready for Shipping"
      } else if (hasWillCall) {
        finalStatus = "Will Call"
      }

      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: finalStatus })
        .eq("orderNumber", orderGroup)

      if (orderError) {
        console.error("UPDATE ORDER STATUS ERROR:", orderError)
        return
      }

      console.log("Order status updated:", orderGroup, finalStatus)
    } catch (error) {
      console.error("updateOrderStatusByOrderGroup failed:", error)
    }
  }

  async function updateJobStage(jobId, orderGroup, nextStatus, extraFields = {}) {
    const updatePayload = {
      status: nextStatus,
      ...extraFields,
    }

    const { error } = await supabase
      .from("jobs")
      .update(updatePayload)
      .eq("id", jobId)

    if (error) {
      console.error("UPDATE JOB STAGE ERROR:", error)
      alert("Failed to update job stage")
      return
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              ...updatePayload,
            }
          : job
      )
    )

    await updateOrderStatusByOrderGroup(orderGroup)
  }

  async function handleShip(jobId, orderGroup) {
    const carrier = prompt("Enter carrier (UPS or FedEx):")
    if (!carrier) return

    const trackingNumber = prompt("Enter tracking number:")
    if (!trackingNumber) return

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "Shipped",
        carrier,
        trackingNumber,
      })
      .eq("id", jobId)

    if (error) {
      console.error("SHIP ERROR:", error)
      alert("Failed to ship job")
      return
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "Shipped",
              carrier,
              trackingNumber,
            }
          : job
      )
    )

    await updateOrderStatusByOrderGroup(orderGroup)
  }

  async function handleWillCall(jobId, orderGroup) {
    const { error } = await supabase
      .from("jobs")
      .update({
        status: "Will Call",
        carrier: null,
        trackingNumber: null,
      })
      .eq("id", jobId)

    if (error) {
      console.error("WILL CALL ERROR:", error)
      alert("Failed to mark job as Will Call")
      return
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "Will Call",
              carrier: null,
              trackingNumber: null,
            }
          : job
      )
    )

    await updateOrderStatusByOrderGroup(orderGroup)
  }

  async function handlePickedUp(jobId, orderGroup) {
    const { error } = await supabase
      .from("jobs")
      .update({
        status: "Picked Up",
        carrier: null,
        trackingNumber: null,
      })
      .eq("id", jobId)

    if (error) {
      console.error("PICKED UP ERROR:", error)
      alert("Failed to mark job as Picked Up")
      return
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "Picked Up",
              carrier: null,
              trackingNumber: null,
            }
          : job
      )
    )

    await updateOrderStatusByOrderGroup(orderGroup)
  }

  function getPaymentStatus(orderGroup) {
    const order = orders.find((o) => o.orderNumber === orderGroup)
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

  function renderJobStatusDetails(job) {
    if (job.status === "Shipped" && job.trackingNumber) {
      return (
        <div style={{ marginTop: "6px", fontSize: "12px", opacity: 0.8 }}>
          📦 {job.carrier} - {job.trackingNumber}
        </div>
      )
    }

    if (job.status === "Will Call") {
      return (
        <div style={{ marginTop: "6px", fontSize: "12px", opacity: 0.8 }}>
          📦 Customer Pickup
        </div>
      )
    }

    return null
  }

  return (
    <>
      <div className="sectionCard">
        <h3 className="sectionTitle">Jobs</h3>

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
                <th>Delivered</th>
                <th>Status</th>
                <th style={{ width: "140px" }}>Payment</th>
                <th style={{ width: "260px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(groupedJobs).map(([group, jobs]) => (
                <Fragment key={group}>
                  <tr
                    className="groupRow"
                    onClick={() => toggleGroup(group)}
                    style={{ cursor: "pointer" }}
                  >
                    <td colSpan="17">
                      <strong>
                        {collapsedGroups[group] ? "▶" : "▼"} {group}
                      </strong>{" "}
                      ({jobs.length} items)

                      {orderProgress[group] &&
                        (() => {
                          const progress = orderProgress[group]
                          const percent = Math.round(
                            (progress.completed / progress.total) * 100
                          )

                          return (
                            <span
                              style={{
                                marginLeft: "12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <div
                                style={{
                                  width: "60px",
                                  height: "6px",
                                  background: "rgba(255,255,255,0.15)",
                                  borderRadius: "4px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${percent}%`,
                                    height: "100%",
                                    background: "#4cd964",
                                  }}
                                />
                              </div>

                              <span style={{ fontSize: "12px", opacity: 0.8 }}>
                                {progress.completed}/{progress.total}
                              </span>
                            </span>
                          )
                        })()}
                    </td>
                  </tr>

                  {!collapsedGroups[group] &&
                    jobs.map((job) => {
                      const paymentStatus = getPaymentStatus(job.orderGroup)

                      return (
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
                          <td>
                            {typeof job?.sizes === "string"
                              ? job.sizes
                              : Object.entries(job?.sizes || {})
                                  .filter(([_, value]) => Number(value) > 0)
                                  .map(([size, value]) => `${size}:${value}`)
                                  .join(", ")}
                          </td>
                          <td>{job.placement}</td>
                          <td>{job.designName}</td>

                          <td style={{ textAlign: "center" }}>
                            {job.mockup && (
                              <img
                                src={job.mockup}
                                alt="mockup"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                  border: "1px solid #2eff7b",
                                }}
                              />
                            )}
                          </td>

                          <td>{job.method}</td>
                          <td>{job.vendor}</td>

                          <td>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                background: job.delivered ? "#4cd964" : "#555",
                                color: "#fff",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              {job.delivered ? "Delivered" : "Waiting"}
                            </span>
                          </td>

                          <td>
                            <span style={{ fontWeight: 600 }}>{job.status}</span>
                            {renderJobStatusDetails(job)}
                          </td>

                          <td>
                            <span
                              className={
                                paymentStatus === "Paid"
                                  ? "paymentBadge paid"
                                  : "paymentBadge unpaid"
                              }
                            >
                              {paymentStatus}
                            </span>
                          </td>

                          <td style={{ minWidth: "260px" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              {job.status === "DTF Next Up" && (
                                <button
                                  style={{
                                    background: isOrderPaid(job.orderGroup)
                                      ? "#ffcc66"
                                      : "#555",
                                    color: isOrderPaid(job.orderGroup)
                                      ? "#000"
                                      : "#bbb",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    cursor: isOrderPaid(job.orderGroup)
                                      ? "pointer"
                                      : "not-allowed",
                                  }}
                                  onClick={() => {
                                    if (!isOrderPaid(job.orderGroup)) {
                                      alert("Order must be paid before printing.")
                                      return
                                    }

                                    updateJobStage(
                                      job.id,
                                      job.orderGroup,
                                      "DTF Printing"
                                    )
                                  }}
                                >
                                  ▶ Start DTF
                                </button>
                              )}

                              {job.status === "DTF Printing" && (
                                <button
                                  style={{
                                    background: "#4cd964",
                                    color: "#000",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    updateJobStage(
                                      job.id,
                                      job.orderGroup,
                                      "DTF On Deck"
                                    )
                                  }
                                >
                                  ✔ Finish DTF
                                </button>
                              )}

                              {job.status === "DTF On Deck" && (
                                <button
                                  style={{
                                    background: "#a78bfa",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    updateJobStage(
                                      job.id,
                                      job.orderGroup,
                                      "Heat Press Next Up"
                                    )
                                  }
                                >
                                  📦 To Heat Press
                                </button>
                              )}

                              {job.status === "Heat Press Next Up" && (
                                <button
                                  style={{
                                    background: "#ffcc66",
                                    color: "#000",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    updateJobStage(
                                      job.id,
                                      job.orderGroup,
                                      "Heat Pressing"
                                    )
                                  }
                                >
                                  🔥 Start Heat Press
                                </button>
                              )}

                              {job.status === "Heat Pressing" && (
                                <button
                                  style={{
                                    background: "#4cd964",
                                    color: "#000",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    updateJobStage(
                                      job.id,
                                      job.orderGroup,
                                      "Ready for Shipping"
                                    )
                                  }
                                >
                                  ✅ Finish Heat Press
                                </button>
                              )}

                              {job.status === "Ready for Shipping" && (
                                <>
                                  <button
                                    style={{
                                      background: "#a78bfa",
                                      color: "#fff",
                                      border: "none",
                                      padding: "6px 10px",
                                      borderRadius: "6px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleShip(job.id, job.orderGroup)
                                    }
                                  >
                                    🚚 Ship
                                  </button>

                                  <button
                                    style={{
                                      background: "#5da3ff",
                                      color: "#fff",
                                      border: "none",
                                      padding: "6px 10px",
                                      borderRadius: "6px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleWillCall(job.id, job.orderGroup)
                                    }
                                  >
                                    📦 Will Call
                                  </button>
                                </>
                              )}

                              {job.status === "Will Call" && (
                                <button
                                  style={{
                                    background: "#4cd964",
                                    color: "#000",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handlePickedUp(job.id, job.orderGroup)
                                  }
                                >
                                  🙌 Picked Up
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
                      )
                    })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default JobsPage