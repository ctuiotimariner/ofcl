import { useState, useRef, useEffect } from 'react'

const sounds = {
  scan: new Audio('/scan.mp3'),
  alert: new Audio('/alert.mp3'),
  success: new Audio('/success.mp3')
}

function playSound(name, volume = 0.3) {
  const audio = sounds[name]
  if (!audio) return

  audio.volume = volume
  audio.currentTime = 0
  audio.play().catch(() => {})
}

function ScanStation({ orders, jobs, setJobs, setCurrentPage, setSelectedOrder }) {
  const [scanValue, setScanValue] = useState('')
  const inputRef = useRef(null)
  const [scanMessage, setScanMessage] = useState('')

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function getNextStatus(status) {
    if (status === 'Waiting for Blanks') return 'Printing'
    if (status === 'Printing') return 'Completed'
    if (status === 'Completed') return 'Shipped'
    return status
  }

  function handleScan(e) {
    e.preventDefault()
    console.log('handleScan fired')

    const foundOrder = orders.find(
      (order) => order.orderNumber.toLowerCase() === scanValue.toLowerCase()
    )

    if (!foundOrder) {
      playSound('alert')
      alert('Order not found')
      setScanValue('')
      return
    }

    let playedSuccess = false

setJobs((prevJobs) =>
  prevJobs.map((job) => {
    if (job.orderGroup !== foundOrder.orderNumber) return job

    const nextStatus = getNextStatus(job.status)

    if (nextStatus === 'Completed') {
      playedSuccess = true
    }

    return {
      ...job,
      status: nextStatus,
    }
  })
)

// 🔥 play correct sound
if (playedSuccess) {
  playSound('success')
} else {
  playSound('scan')
}

    playSound('scan')

    setScanMessage(`✓ ${foundOrder.orderNumber} moved to next stage`)

    setSelectedOrder(foundOrder.orderNumber)
    setCurrentPage('tickets')
    setScanValue('')
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <>
      <h2 className="scanTitle">SCAN STATION</h2>
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
          playSound('success')
        }}
      >
        Test Scan Sound
      </button>

      {scanMessage && <p className="scanSuccess">{scanMessage}</p>}
    </>
  )
}

export default ScanStation