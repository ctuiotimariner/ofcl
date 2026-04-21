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

  function enterFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    }
  }

  const departmentData = useMemo(() => {
    return departments.map((dept) => {
      const methodMatches = (job) =>
        String(job.method || "").trim().toLowerCase() ===
        String(dept.method || "").trim().toLowerCase()

      let nextUp = []
      let printing = []
      let onDeck = []
      let finishing = []
      let ready = []

      if (dept.method === "DTF Printing") {
        nextUp = sortJobsByPriority(
          jobs.filter(
            (job) => methodMatches(job) && job.status === "DTF Next Up"
          )
        )

        printing = sortJobsByPriority(
          jobs.filter(
            (job) => methodMatches(job) && job.status === "DTF Printing"
          )
        )

        onDeck = sortJobsByPriority(
          jobs.filter(
            (job) => methodMatches(job) && job.status === "DTF On Deck"
          )
        )

        finishing = sortJobsByPriority(
          jobs.filter(
            (job) =>
              methodMatches(job) &&
              (job.status === "Heat Press Next Up" ||
                job.status === "Heat Pressing")
          )
        )

        ready = sortJobsByPriority(
          jobs.filter(
            (job) => methodMatches(job) && job.status === "Ready for Shipping"
          )
        )
      }

      if (dept.method === "Embroidery") {
        nextUp = sortJobsByPriority(
          jobs.filter(
            (job) =>
              methodMatches(job) &&
              (job.status === "Embroidery Next Up" ||
                job.status === "Ready for Embroidery")
          )
        )

        printing = sortJobsByPriority(
          jobs.filter(
            (job) =>
              methodMatches(job) &&
              (job.status === "Embroidery Printing" ||
                job.status === "Embroidery")
          )
        )

        onDeck = sortJobsByPriority(
          jobs.filter(
            (job) => methodMatches(job) && job.status === "Embroidery On Deck"
          )
        )

        finishing = sortJobsByPriority(
          jobs.filter(
            (job) =>
              methodMatches(job) &&
              (job.status === "Embroidery Finish" ||
                job.status === "Trimming" ||
                job.status === "Embroidery QC")
          )
        )

        ready = sortJobsByPriority(
          jobs.filter(
            (job) => methodMatches(job) && job.status === "Ready for Shipping"
          )
        )
      }

      const nextUpCount = nextUp.length
      const printingCount = printing.length
      const onDeckCount = onDeck.length
      const finishingCount = finishing.length
      const readyCount = ready.length

      const activePieces = [...nextUp, ...printing, ...onDeck, ...finishing].reduce(
        (sum, job) => sum + Number(job.qty || 0),
        0
      )

      const totalPieces = [...nextUp, ...printing, ...onDeck, ...finishing, ...ready].reduce(
        (sum, job) => sum + Number(job.qty || 0),
        0
      )

      const overdueCount = [...nextUp, ...printing, ...onDeck, ...finishing].filter(
        (job) => {
          if (!job.dueDate) return false

          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const due = new Date(job.dueDate)
          due.setHours(0, 0, 0, 0)

          return due < today
        }
      ).length

      return {
        name: dept.name,
        method: dept.method,
        nextUp,
        printing,
        onDeck,
        finishing,
        ready,
        nextUpCount,
        printingCount,
        onDeckCount,
        finishingCount,
        readyCount,
        activePieces,
        totalPieces,
        overdueCount
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

  function getFinishTitle() {
    if (activeDepartment.method === "DTF Printing") return "🟣 HEAT PRESS"
    if (activeDepartment.method === "Embroidery") return "🧵 FINISH"
    return "✅ FINISH"
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
            <p><strong>Status:</strong> {job.status}</p>
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
        (activeDepartment.activePieces / activeDepartment.totalPieces) * 100
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
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <span>NEXT UP: {activeDepartment.nextUpCount}</span>
              <span>PRINTING: {activeDepartment.printingCount}</span>
              <span>ON DECK: {activeDepartment.onDeckCount}</span>
              <span>FINISH: {activeDepartment.finishingCount}</span>
              <span>READY: {activeDepartment.readyCount}</span>
              <span>PIECES: {activeDepartment.totalPieces}</span>
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
              {progressPercent}% ACTIVE FLOW
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "20px",
                marginTop: "20px"
              }}
            >
              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
                  ⏭ NEXT UP
                </h2>

                {activeDepartment.nextUp.length === 0 && <p>No upcoming jobs</p>}

                {activeDepartment.nextUp.slice(0, 5).map((job) =>
                  renderJobCard(job)
                )}
              </div>

              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
                  🔥 PRINTING NOW
                </h2>

                {activeDepartment.printing.length === 0 && <p>No active jobs</p>}

                {activeDepartment.printing.slice(0, 6).map((job) =>
                  renderJobCard(job, true)
                )}
              </div>

              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
                  📦 ON DECK
                </h2>

                {activeDepartment.onDeck.length === 0 && (
                  <p style={{ opacity: 0.6 }}>No on deck jobs</p>
                )}

                {activeDepartment.onDeck.slice(0, 5).map((job) =>
                  renderJobCard(job)
                )}
              </div>

              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
                  {getFinishTitle()}
                </h2>

                {activeDepartment.finishing.length === 0 && (
                  <p style={{ opacity: 0.6 }}>No finish jobs</p>
                )}

                {activeDepartment.finishing.slice(0, 5).map((job) =>
                  renderJobCard(job)
                )}
              </div>

              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
                  ✅ READY TO SHIP
                </h2>

                {activeDepartment.ready.length === 0 && (
                  <p style={{ opacity: 0.6 }}>No ready jobs</p>
                )}

                {activeDepartment.ready.slice(0, 5).map((job) =>
                  renderJobCard(job)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductionBoard