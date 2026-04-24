import { useState, useRef, useEffect } from "react"
import { supabase } from "../lib/supabase"

const sounds = {
  scan: new Audio("/scan.mp3"),
  alert: new Audio("/alert.mp3"),
  success: new Audio("/success.mp3"),
}

function playSound(name, volume = 0.3) {
  const audio = sounds[name]
  if (!audio) return

  audio.volume = volume
  audio.currentTime = 0
  audio.play().catch(() => {})
}

const PROCESS_STEPS = [
  "Waiting for Blanks",
  "DTF Next Up",
  "DTF Printing",
  "DTF On Deck",
  "Heat Press Next Up",
  "Heat Pressing",
  "Ready for Shipping",
  "Shipped",
]

function getStepLabel(step) {
  switch (step) {
    case "Waiting for Blanks":
      return "BLANKS"
    case "DTF Next Up":
      return "DTF NEXT"
    case "DTF Printing":
      return "DTF PRINT"
    case "DTF On Deck":
      return "DTF DECK"
    case "Heat Press Next Up":
      return "PRESS NEXT"
    case "Heat Pressing":
      return "PRESSING"
    case "Ready for Shipping":
      return "READY"
    case "Shipped":
      return "SHIPPED"
    default:
      return step
  }
}

function getNextStatus(status) {
  if (status === "Waiting for Blanks") return "DTF Next Up"
  if (status === "DTF Next Up") return "DTF Printing"
  if (status === "DTF Printing") return "DTF On Deck"
  if (status === "DTF On Deck") return "Heat Press Next Up"
  if (status === "Heat Press Next Up") return "Heat Pressing"
  if (status === "Heat Pressing") return "Ready for Shipping"
  if (status === "Ready for Shipping") return "Shipped"
  return status
}

function normalizeCode(code) {
  return code.trim()
}

function ScanStation({ orders, jobs, setJobs, role, setCurrentPage }) {
  const currentUserName =
    localStorage.getItem("employee_name") || "Unknown"
  const [adminOverride, setAdminOverride] = useState(false)
  const [scanValue, setScanValue] = useState("")
  const [scanMessage, setScanMessage] = useState("")
  const [messageType, setMessageType] = useState("idle")
  const [activeOrderNumber, setActiveOrderNumber] = useState("")
  const [activeCustomer, setActiveCustomer] = useState("")
  const [activeStatus, setActiveStatus] = useState("")
  const [activeNextStatus, setActiveNextStatus] = useState("")
  const [isBusy, setIsBusy] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
  const [flashType, setFlashType] = useState("")
  const inputRef = useRef(null)
  const [scanMode, setScanMode] = useState("advance")
  

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const keepFocus = () => {
      inputRef.current?.focus()
    }

    window.addEventListener("click", keepFocus)
    return () => window.removeEventListener("click", keepFocus)
  }, [])

  function clearMessageLater(message) {
    const delay =
      message === "MUST RECEIVE FIRST"
        ? 8000   // 🔥 longer for this one
        : 2000   // normal for others

    setTimeout(() => {
      setScanMessage("")
      setMessageType("idle")
    }, delay)
  }

  async function saveScanLog({
    orderNumber = "",
    customerName = "",
    action = "SCAN",
    status = "",
    result = "SUCCESS",
    message = "",
  }) {
    const { error } = await supabase.from("scan_logs").insert({
      order_number: orderNumber,
      customer_name: customerName,
      employee_name: currentUserName,
      action,
      status,
      result,
      role,
      message,
    })

    if (error) {
      console.error("SAVE SCAN LOG ERROR:", error)
    }
  }

  async function handleScan(e) {
    e.preventDefault()

    if (isBusy) return

    const trimmedValue = scanValue.trim()
    if (!trimmedValue) return

    setIsBusy(true)

    const cleanCode = normalizeCode(trimmedValue)

    const foundOrder = orders.find(
        (order) => order.orderNumber?.toLowerCase() === cleanCode.toLowerCase()
      )

      // 🔥 1. CHECK IF ORDER EXISTS FIRST
      if (!foundOrder) {
        playSound("alert")

        setMessageType("error")
        setScanMessage("ORDER NOT FOUND")

        setScanValue("")
        setIsBusy(false)
        inputRef.current?.focus()
        clearMessageLater()

        await saveScanLog({
          orderNumber: cleanCode,
          customerName: "",
          action: "LOOKUP",
          status: "",
          result: "ERROR",
          message: "ORDER NOT FOUND",
        })

        return
      }

      // 🔥 2. THEN CHECK PAYMENT
      if (foundOrder.paymentStatus !== "Paid" && !(role === "admin" && adminOverride)) {
        playSound("alert")

        setActiveOrderNumber(foundOrder.orderNumber)
        setActiveCustomer(foundOrder.customerName || "")
        setActiveStatus("LOCKED")
        setActiveNextStatus("")

        setMessageType("error")
        setScanMessage("PAYMENT REQUIRED")

        setScanValue("")
        setIsBusy(false)
        inputRef.current?.focus()
        clearMessageLater()

        await saveScanLog({
          orderNumber: foundOrder.orderNumber,
          customerName: foundOrder.customerName || "",
          action: "BLOCKED",
          status: "LOCKED",
          result: "ERROR",
          message: "PAYMENT REQUIRED",
        })

        return
      }

    const matchingJobs = jobs.filter(
      (job) => job.orderGroup === foundOrder.orderNumber
    )

    if (matchingJobs.length === 0) {
      playSound("alert")
      setActiveOrderNumber(foundOrder.orderNumber)
      setActiveCustomer(foundOrder.customerName || "")
      setActiveStatus("")
      setActiveNextStatus("")
      setMessageType("error")
      setScanMessage("NO JOBS FOUND")
      setScanValue("")
      setIsBusy(false)
      inputRef.current?.focus()
      clearMessageLater()
      return
    }

    if (scanMode === "lookup") {
      const primaryJob = matchingJobs[0]
      const nextStatus = getNextStatus(primaryJob.status)

      playSound("scan")

      setActiveOrderNumber(foundOrder.orderNumber)
      setActiveCustomer(foundOrder.customerName || "")
      setActiveStatus(primaryJob.status)
      setActiveNextStatus(nextStatus === primaryJob.status ? "" : nextStatus)

      setMessageType("success")
      setScanMessage("ORDER LOADED")

      setScanValue("")
      setIsBusy(false)
      inputRef.current?.focus()
      clearMessageLater()
      return
    }

   const hasWaitingJobs = matchingJobs.some(
  (job) => job.status === "Waiting for Blanks"
)

if (hasWaitingJobs) {
  playSound("alert")
  setActiveOrderNumber(foundOrder.orderNumber)
  setActiveCustomer(foundOrder.customerName || "")
  setActiveStatus("Waiting for Blanks")
  setActiveNextStatus("DTF Next Up")
  setMessageType("error")
  setScanMessage("MUST RECEIVE FIRST")
  setScanValue("")
  setIsBusy(false)
  inputRef.current?.focus()
  clearMessageLater("MUST RECEIVE FIRST")
  await saveScanLog({
    orderNumber: foundOrder.orderNumber,
    customerName: foundOrder.customerName || "",
    action: "BLOCKED",
    status: "Waiting for Blanks",
    result: "ERROR",
    message: "MUST RECEIVE FIRST",
  })

  return
}

    const updatedJobs = matchingJobs.map((job) => ({
      ...job,
      status: getNextStatus(job.status),
    }))

    for (const job of updatedJobs) {
      const { error } = await supabase
        .from("jobs")
        .update({ status: job.status })
        .eq("id", job.id)

      if (error) {
        console.error("Supabase update error:", error)
        playSound("alert")
        setMessageType("error")
        setScanMessage("FAILED TO UPDATE")
        setScanValue("")
        setIsBusy(false)
        inputRef.current?.focus()
        clearMessageLater()
        return
      }
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        const updatedJob = updatedJobs.find((j) => j.id === job.id)
        return updatedJob ? updatedJob : job
      })
    )

    const primaryJob = updatedJobs[0]
    const nextStatus = getNextStatus(primaryJob.status)

    setActiveOrderNumber(foundOrder.orderNumber)
    setActiveCustomer(foundOrder.customerName || "")
    setActiveStatus(primaryJob.status)
    setActiveNextStatus(nextStatus === primaryJob.status ? "" : nextStatus)

    if (primaryJob.status === "Shipped") {
      playSound("success")
    } else {
      playSound("scan")
    }

   setMessageType("success")
   setScanMessage(`UPDATED TO ${primaryJob.status.toUpperCase()}`)

   setScanHistory((prev) => [
    {
      orderNumber: foundOrder.orderNumber,
      customer: foundOrder.customerName || "",
      status: primaryJob.status,
      time: new Date().toLocaleTimeString(),
    },
    ...prev.slice(0, 9),
   ])

   await saveScanLog({
    orderNumber: foundOrder.orderNumber,
    customerName: foundOrder.customerName || "",
    action: scanMode === "lookup" ? "LOOKUP" : "ADVANCE",
    status: primaryJob.status,
    result: "SUCCESS",
    message: `UPDATED TO ${primaryJob.status.toUpperCase()}`,
  })

    setScanValue("")
    setIsBusy(false)
    inputRef.current?.focus()
    clearMessageLater()
  }

  
  const activeStepIndex = PROCESS_STEPS.indexOf(activeStatus)

  return (
  <>
    {flashType && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            flashType === "success"
              ? "rgba(46,255,123,0.2)"
              : "rgba(255,77,79,0.2)",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    )}

    <div className="sectionCard" style={{ position: "relative", overflow: "hidden" }}>
      <style>{`
        .scanStationWrap {
          display: grid;
          gap: 18px;
        }

        .scanHero {
          border: 1px solid rgba(46, 255, 123, 0.22);
          background: rgba(255, 255, 255, 0.02);
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 0 18px rgba(46, 255, 123, 0.08);
        }

        .scanHeroHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .scanTag {
          font-size: 12px;
          letter-spacing: 1px;
          font-weight: 800;
          color: #8affb2;
        }

        .scanStatusPill {
          border: 1px solid rgba(46, 255, 123, 0.35);
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .scanMainNumber {
          font-size: 42px;
          font-weight: 900;
          line-height: 1;
          margin: 4px 0 8px 0;
          word-break: break-word;
        }

        .scanCustomer {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 18px;
        }

        .scanBigStatus {
          font-size: 28px;
          font-weight: 900;
          line-height: 1.1;
          color: #8affb2;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .scanNextLine {
          font-size: 14px;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .scanInputCard {
          border: 1px solid rgba(46, 255, 123, 0.22);
          background: rgba(255, 255, 255, 0.02);
          padding: 18px;
          border-radius: 16px;
        }

        .scanInput {
          width: 100%;
          font-size: 20px;
          padding: 16px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.35);
          color: white;
          outline: none;
        }

        .scanInput:focus {
          border-color: #2eff7b;
          box-shadow: 0 0 10px rgba(46, 255, 123, 0.2);
        }

        .scanHint {
          margin-top: 10px;
          font-size: 13px;
          opacity: 0.75;
        }

        .scanFeedback {
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .scanFeedback.success {
          background: rgba(46, 255, 123, 0.12);
          border: 1px solid rgba(46, 255, 123, 0.35);
          color: #8affb2;
        }

        .scanFeedback.error {
          background: rgba(255, 77, 79, 0.12);
          border: 1px solid rgba(255, 77, 79, 0.4);
          color: #ff8d8f;
        }

        .processCard {
          border: 1px solid rgba(46, 255, 123, 0.22);
          background: rgba(255, 255, 255, 0.02);
          padding: 18px;
          border-radius: 16px;
        }

        .processTitle {
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 800;
          opacity: 0.85;
          margin-bottom: 16px;
        }

        .processRow {
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 10px;
        }

        .processStep {
          text-align: center;
        }

        .processDot {
          height: 16px;
          width: 16px;
          border-radius: 999px;
          margin: 0 auto 10px auto;
          border: 2px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.06);
        }

        .processStep.done .processDot {
          background: #2eff7b;
          border-color: #2eff7b;
          box-shadow: 0 0 12px rgba(46, 255, 123, 0.4);
        }

        .processStep.current .processDot {
          background: #ffe066;
          border-color: #ffe066;
          box-shadow: 0 0 12px rgba(255, 224, 102, 0.45);
        }

        .processLabel {
          font-size: 11px;
          line-height: 1.15;
          font-weight: 800;
          text-transform: uppercase;
          opacity: 0.72;
        }

        .processStep.done .processLabel,
        .processStep.current .processLabel {
          opacity: 1;
        }

        .scanActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .scanButton {
          background: #111;
          color: white;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          padding: 10px 14px;
          cursor: pointer;
          font-weight: 700;
        }
      `}</style>

      <div className="scanStationWrap">
        <div className="scanHero">
          <div className="scanHeroHeader">
            <div className="scanTag">SCAN STATION</div>
            <div className="scanStatusPill">
              {isBusy ? "UPDATING..." : "READY TO SCAN"}
            </div>
          </div>

          <div className="scanMainNumber">
            {activeOrderNumber || "WAITING FOR SCAN"}
          </div>

          <div className="scanCustomer">
            {activeCustomer || "Scan a label barcode to load the job process."}
          </div>

          <div className="scanBigStatus">
            {activeStatus || "NO JOB LOADED"}
          </div>

          <div className="scanNextLine">
            {activeStatus === "Waiting for Blanks"
              ? "Must be received on Receiving Page first"
              : activeNextStatus
              ? `Next: ${activeNextStatus}`
              : activeStatus === "Shipped"
              ? "Final stage reached"
              : "Scan a job to view its process"}
          </div>
        </div>

        <div className="scanInputCard">
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
        <button
          type="button"
          className="scanButton"
          onClick={() => {
            setScanMode("lookup")
            inputRef.current?.focus()
          }}
          style={{
            background: scanMode === "lookup" ? "#2eff7b" : "#111",
            color: scanMode === "lookup" ? "#000" : "#fff",
          }}
        >
          LOOKUP
        </button>

        <button
          type="button"
          className="scanButton"
          onClick={() => {
            setScanMode("advance")
            inputRef.current?.focus()
          }}
          style={{
            background: scanMode === "advance" ? "#2eff7b" : "#111",
            color: scanMode === "advance" ? "#000" : "#fff",
          }}
        >
          ADVANCE
        </button>
      </div>
          <form onSubmit={handleScan}>
            <input
              ref={inputRef}
              className="scanInput"
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              placeholder="Scan order barcode..."
              autoFocus
            />
          </form>

          <div className="scanHint">
            Jobs still waiting for blanks must be marked received on the Receiving Page first.
          </div>
        </div>

        {scanMessage && (
          <div className={`scanFeedback ${messageType}`}>
            {scanMessage}

            {/* 🔥 NEW BUTTON */}
            {scanMessage === "MUST RECEIVE FIRST" && (
              <div style={{ marginTop: "10px" }}>
                <button
                  className="scanButton"
                  onClick={() => {
                    window.location.search = `?po=${activeOrderNumber}`
                    setCurrentPage("receiving")
                  }}
                >
                  GO TO RECEIVING
                </button>
              </div>
            )}
          </div>
        )}

        <div className="processCard">
          <div className="processTitle">Process Progress</div>

          <div className="processRow">
            {PROCESS_STEPS.map((step, index) => {
              const isCurrent = index === activeStepIndex
              const isDone = activeStepIndex > index

              return (
                <div
                  key={step}
                  className={`processStep ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                >
                  <div className="processDot" />
                  <div className="processLabel">{getStepLabel(step)}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="scanActions">
          {role === "admin" && (
          <button
            type="button"
            className="scanButton"
            onClick={() => {
              setAdminOverride((prev) => !prev)
              inputRef.current?.focus()
            }}
            style={{
              background: adminOverride ? "#ffcc66" : "#111",
              color: adminOverride ? "#000" : "#fff",
            }}
          >
            {adminOverride ? "ADMIN OVERRIDE ON" : "ADMIN OVERRIDE OFF"}
          </button>
        )}
          <button
            type="button"
            className="scanButton"
            onClick={() => {
              playSound("success")
              inputRef.current?.focus()
            }}
          >
            Test Sound
          </button>

          <button
            type="button"
            className="scanButton"
            onClick={() => {
              setActiveOrderNumber("")
              setActiveCustomer("")
              setActiveStatus("")
              setActiveNextStatus("")
              setScanMessage("")
              setMessageType("idle")
              setScanValue("")
              inputRef.current?.focus()
            }}
          >
            Clear
          </button>
        </div>
        <div className="processCard">
          <div className="processTitle">Scan History</div>

          {scanHistory.length === 0 ? (
            <div style={{ opacity: 0.7, fontSize: "13px" }}>
              No scans yet
            </div>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {scanHistory.map((scan, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "8px 10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: "13px",
                  }}
                >
                  <span>{scan.orderNumber}</span>
                  <span>{scan.status}</span>
                  <span style={{ opacity: 0.7 }}>{scan.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

         </div>
    </div>
  </>
)
}

export default ScanStation