import { useState, useRef, useEffect } from 'react'

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

    const foundOrder = orders.find(
      (order) =>
        order.orderNumber.toLowerCase() === scanValue.toLowerCase()
    )


    if (!foundOrder) {
      alert('Order not found')
      setScanValue('')
      return
    }

    setJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.orderGroup !== foundOrder.orderNumber) return job

        return {
          ...job,
          status: getNextStatus(job.status),
        }
      })
    )

    setScanMessage(`✓ ${foundOrder.orderNumber} moved to next stage`)

    setSelectedOrder(foundOrder.orderNumber)
    setCurrentPage('tickets')
    setScanValue('')
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

      {scanMessage && (
        <p className="scanSuccess">{scanMessage}</p>
      )}

    </>
  )
}

export default ScanStation