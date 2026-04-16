import { useEffect, useMemo, useState } from "react"
import {
  getDueStatus,
  sortJobsByPriority,
  getPriorityLabel
} from "../utils/productionHelpers"

function ProductionBoard({ jobs = [] }) {
  const params = new URLSearchParams(window.location.search)
  const departmentParam = params.get("dept")

  const departments = [
    { name: "Embroidery", method: "Embroidery" },
    { name: "DTF Printing", method: "DTF Printing" }
  ]

  const [currentDeptIndex, setCurrentDeptIndex] = useState(1)
  const [fade, setFade] = useState(true)
  const [audioReady, setAudioReady] = useState(false)

  useEffect(() => {
    if (!departmentParam) return

    const foundIndex = departments.findIndex(
      (dept) =>
        dept.method.toLowerCase() === departmentParam.toLowerCase() ||
        dept.name.toLowerCase() === departmentParam.toLowerCase()
    )

    if (foundIndex !== -1) {
      setCurrentDeptIndex(foundIndex)
    }
  }, [departmentParam])

  useEffect(() => {
    const sound = new Audio("/notify.mp3")

    const unlock = () => {
      sound
        .play()
        .then(() => {
          sound.pause()
          sound.currentTime = 0
          setAudioReady(true)
          console.log("Audio ready")
        })
        .catch(() => {})

      window.removeEventListener("click", unlock)
    }

    window.addEventListener("click", unlock)

    return () => window.removeEventListener("click", unlock)
  }, [])

  function enterFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    }
  }

  const departmentData = useMemo(() => {
    return departments.map((dept) => {
      const printing = sortJobsByPriority(
        jobs.filter((job) => {
          const methodMatches =
            String(job.method || "").trim().toLowerCase() ===
            String(dept.method || "").trim().toLowerCase()

          return methodMatches && job.status === "Printing"
        })
      )

      const queue = sortJobsByPriority(
        jobs.filter((job) => {
          const methodMatches =
            String(job.method || "").trim().toLowerCase() ===
            String(dept.method || "").trim().toLowerCase()

          return methodMatches && job.status === "Waiting for Blanks"
        })
      )

      const standby = sortJobsByPriority(
        jobs.filter((job) => {
          const methodMatches =
            String(job.method || "").trim().toLowerCase() ===
            String(dept.method || "").trim().toLowerCase()

          return (
            methodMatches &&
            (job.status === "Email Received" ||
              job.status === "Waiting Approval")
          )
        })
      )

      const printingCount = printing.length
      const queueCount = queue.length

      const printingPieces = printing.reduce(
        (sum, job) => sum + Number(job.qty || 0),
        0
      )

      const totalPieces = [...printing, ...queue].reduce(
        (sum, job) => sum + Number(job.qty || 0),
        0
      )

      const overdueCount = [...printing, ...queue].filter((job) => {
        if (!job.dueDate) return false

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const due = new Date(job.dueDate)
        due.setHours(0, 0, 0, 0)

        return due < today
      }).length

      return {
        name: dept.name,
        method: dept.method,
        printing,
        queue,
        standby,
        printingCount,
        queueCount,
        totalQty: totalPieces,
        overdueCount,
        printingPieces,
        totalPieces
      }
    })
  }, [jobs])

  useEffect(() => {
    if (departmentParam) return
    if (!departmentData.length) return

    const interval = setInterval(() => {
      setFade(false)

      setTimeout(() => {
        setCurrentDeptIndex((prev) => (prev + 1) % departmentData.length)
        setFade(true)
      }, 400)
    }, 15000)

    return () => clearInterval(interval)
  }, [departmentData.length, departmentParam])

  const activeDepartment = departmentData[currentDeptIndex]

  function getCardStyle(job, isActivePrint = false) {
    const dueStatus = getDueStatus(job)

    if (dueStatus === "overdue") {
      return {
        border: "3px solid #ff0000",
        boxShadow: "0 0 25px rgba(255, 0, 0, 0.7)",
        animation: "pulse 1.5s infinite"
      }
    }

    if (dueStatus === "dueSoon") {
      return {
        border: "2px solid #ffcc66",
        boxShadow: "0 0 18px rgba(255, 204, 102, 0.35)"
      }
    }

    if (isActivePrint) {
      return {
        border: "2px solid #6ee787",
        boxShadow: "0 0 18px rgba(110, 231, 135, 0.35)"
      }
    }

    return {
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "none"
    }
  }

  function renderJobCard(job, isActivePrint = false) {
    return (
      <div
        key={job.id}
        className={`productionCard ${isActivePrint ? "activePrint" : ""}`}
        style={getCardStyle(job, isActivePrint)}
      >
        <div className="productionCardHeader">
          <h4>{job.orderGroup}</h4>

          {getPriorityLabel(job) && (
            <span
              className={`priorityBadge ${
                getPriorityLabel(job) === "OVERDUE" ? "overdue" : "dueSoon"
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
              <strong>Due:</strong> {job.dueDate || "N/A"}
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

  if (!activeDepartment) return null

  const progressPercent = activeDepartment.totalPieces
    ? Math.round(
        (activeDepartment.printingPieces / activeDepartment.totalPieces) * 100
      )
    : 0

  return (
    <>
      <div
        className="departmentHeader"
        style={{
          fontSize: "48px",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "20px",
          letterSpacing: "2px"
        }}
      >
        {activeDepartment.name.toUpperCase()}
      </div>

      <button className="fullscreenButton" onClick={enterFullscreen}>
        Full Screen Mode
      </button>

      <div className="sectionCard">
        <div className="productionScreen">
          <div className={`productionSection ${fade ? "fadeIn" : "fadeOut"}`}>
            <div
              className="departmentStats"
              style={{
                display: "flex",
                justifyContent: "space-around",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "20px"
              }}
            >
              <span>PRINTING: {activeDepartment.printingCount}</span>
              <span>QUEUE: {activeDepartment.queueCount}</span>
              <span>PIECES: {activeDepartment.totalQty}</span>
              <span className={activeDepartment.overdueCount ? "overdueStat" : ""}>
                OVERDUE: {activeDepartment.overdueCount}
              </span>
            </div>

            <div className="progressContainer">
              <div
                className={`progressBar ${progressPercent >= 90 ? "nearComplete" : ""}`}
                style={{
                  width: `${progressPercent}%`,
                  background:
                    progressPercent < 30
                      ? "linear-gradient(90deg, #ff5c5c, #ff1f1f)"
                      : progressPercent < 70
                      ? "linear-gradient(90deg, #ffcc66, #ffaa00)"
                      : "linear-gradient(90deg, #6ee787, #00ff9c)"
                }}
              />
            </div>

            <div className="progressText">
              {progressPercent}% COMPLETE
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "20px"
              }}
            >
              <div>
                <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>
                  🔥 PRINTING NOW
                </h2>

                {activeDepartment.printing.length === 0 && (
                  <p>No active jobs</p>
                )}

                {activeDepartment.printing.slice(0, 6).map((job) =>
                  renderJobCard(job, true)
                )}
              </div>

              <div>
                <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>
                  ⏭ NEXT UP
                </h2>

                {activeDepartment.queue.length === 0 && (
                  <p>No upcoming jobs</p>
                )}

                {activeDepartment.queue.slice(0, 5).map((job) =>
                  renderJobCard(job)
                )}

                <div style={{ marginTop: "30px" }}>
                  <h2 style={{ fontSize: "24px", marginBottom: "10px", opacity: 0.8 }}>
                    📦 ON DECK
                  </h2>

                  {activeDepartment.standby.length === 0 && (
                    <p style={{ opacity: 0.6 }}>No standby jobs</p>
                  )}

                  {activeDepartment.standby.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      style={{
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,255,153,0.2)",
                        background: "rgba(255,255,255,0.03)",
                        fontSize: "14px"
                      }}
                    >
                      <strong>{job.orderGroup}</strong> — {job.qty} pcs
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default ProductionBoard