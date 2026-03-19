import { useEffect, useMemo, useState } from "react"
import {
  getDueStatus,
  sortJobsByPriority,
  getPriorityLabel
} from "../utils/productionHelpers"
import { supabase } from "../lib/supabase"

function ProductionBoard() {


  const params = new URLSearchParams(window.location.search)
  const departmentParam = params.get("dept")

const departments = [
  { name: "Embroidery", method: "Embroidery" },
  { name: "DTF Printing", method: "DTF Printing" }
]

  const [currentDeptIndex, setCurrentDeptIndex] = useState(1)
  const [fade, setFade] = useState(true)
  const [jobs, setJobs] = useState([])

  const [audioReady, setAudioReady] = useState(false)
  const sound = new Audio("/notify.mp3")

async function fetchJobs() {
  const { data, error } = await supabase.from("jobs").select("*")

  if (error) {
    console.error("Supabase error:", error)
  } else {
    console.log("ALL JOBS:", data)

    data?.forEach((job, index) => {
      console.log(`JOB ${index + 1}`, {
        orderGroup: job.orderGroup,
        method: job.method,
        status: job.status,
        qty: job.qty
      })
    })

    setJobs(data || [])
  }
}

useEffect(() => {
  fetchJobs()

  const channel = supabase
    .channel("production-jobs-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "jobs"
      },
      (payload) => {
        console.log("🔥 Realtime change:", payload)

        if (payload.eventType === "INSERT") {
          console.log("🆕 NEW JOB RECEIVED")

          const audio = new Audio("/notify.mp3")
            audio.play().catch(() => {})
        }

        fetchJobs()
      }
    )
    .subscribe((status) => {
  console.log("📡 Realtime status:", status)
})

  return () => {
    supabase.removeChannel(channel)
  }
}, [])



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

  function renderSection(title, jobList, emptyMessage, isActivePrint = false) {
    return (
      <>
        <h3>{title}</h3>
        {jobList.length === 0 && <p>{emptyMessage}</p>}
        {jobList.map((job) => renderJobCard(job, isActivePrint))}
      </>
    )
  }

  if (!activeDepartment) return null

  const progressPercent = activeDepartment.totalPieces
    ? Math.round(
        (activeDepartment.printingPieces / activeDepartment.totalPieces) * 100
      )
    : 0

useEffect(() => {
  const unlock = () => {
    sound.play().then(() => {
      sound.pause()
      sound.currentTime = 0
      setAudioReady(true)
      console.log("Audio ready")
    }).catch(() => {})

    window.removeEventListener("click", unlock)
  }

  window.addEventListener("click", unlock)

  return () => window.removeEventListener("click", unlock)
}, [])

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

          <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginTop: "20px"
            }}>

              {/* LEFT - PRINTING */}
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

              {/* RIGHT - QUEUE */}
              <div>
                <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>
                  ⏭ NEXT UP
                </h2>

                {activeDepartment.queue.length === 0 && (
                  <p>No upcoming jobs</p>
                )}

                {activeDepartment.queue.slice(0, 6).map((job) =>
                  renderJobCard(job)
                )}
              </div>

            </div>

        </div>
      </div>
    </>
  )
}



export default ProductionBoard