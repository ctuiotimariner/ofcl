import { useState, useRef, useEffect } from "react"
import { supabase } from "../lib/supabase"

const sounds = {
  scan: new Audio("/scan.mp3"),
  alert: new Audio("/alert.mp3"),
  success: new Audio("/success.mp3")
}

function playSound(name, volume = 0.3) {
  const audio = sounds[name]
  if (!audio) return

  audio.volume = volume
  audio.currentTime = 0
  audio.play().catch(() => {})
}

function ScanStation({
  orders,
  jobs,
  setJobs,
  setCurrentPage,
  setSelectedOrder
}) {
  const [scanValue, setScanValue] = useState("")
  const [scanMessage, setScanMessage] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function getNextStatus(status) {
    if (status === "Waiting for Blanks") return "Printing"
    if (status === "Printing") return "Completed"
    if (status === "Completed") return "Shipped"
    return status
  }

  async function handleScan(e) {
    e.preventDefault()

    const trimmedValue = scanValue.trim()

    if (!trimmedValue) return

    const foundOrder = orders.find(
      (order) =>
        order.orderNumber?.toLowerCase() === trimmedValue.toLowerCase()
    )

    if (!foundOrder) {
      playSound("alert")
      alert("Order not found")
      setScanMessage("")
      setScanValue("")
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    const isPaid =
      orders.find((order) => order.orderNumber === foundOrder.orderNumber)
        ?.paymentStatus === "Paid"

    if (!isPaid) {
      playSound("alert")
      alert("Order is NOT paid yet!")
      setScanMessage("")
      setScanValue("")
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    const matchingJobs = jobs.filter(
      (job) => job.orderGroup === foundOrder.orderNumber
    )

    if (matchingJobs.length === 0) {
      playSound("alert")
      alert("No jobs found for this order")
      setScanMessage("")
      setScanValue("")
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    let playedSuccess = false

    const updatedJobs = matchingJobs.map((job) => {
      const nextStatus = getNextStatus(job.status)

      if (nextStatus === "Completed") {
        playedSuccess = true
      }

      return {
        ...job,
        status: nextStatus
      }
    })

    for (const job of updatedJobs) {
      const { error } = await supabase
        .from("jobs")
        .update({ status: job.status })
        .eq("id", job.id)

      if (error) {
        console.error("Supabase update error:", error)
        playSound("alert")
        alert("Failed to update job status in database")
        return
      }
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        const updatedJob = updatedJobs.find((j) => j.id === job.id)
        return updatedJob ? updatedJob : job
      })
    )

    if (playedSuccess) {
      playSound("success")
    } else {
      playSound("scan")
    }

    setScanMessage(`✓ ${foundOrder.orderNumber} moved to next stage`)
    setSelectedOrder(foundOrder.orderNumber)
    setCurrentPage("tickets")
    setScanValue("")

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <div className="sectionCard">
      <h3 className="sectionTitle">Scan</h3>
      <p>Scan a ticket to move its jobs to the next stage.</p>

      <form onSubmit={handleScan}>
        <input
          ref={inputRef}
          className="scanInput"
          value={scanValue}
          onChange={(e) => setScanValue(e.target.value)}
          placeholder="Scan order number..."
        />
      </form>

      <button
        type="button"
        onClick={() => {
          playSound("success")
        }}
      >
        Test Scan Sound
      </button>

      {scanMessage && <p className="scanSuccess">{scanMessage}</p>}
    </div>
  )
}

export default ScanStation