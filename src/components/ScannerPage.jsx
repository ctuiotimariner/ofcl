import { useState } from 'react'

function ScannerPage({ orders, setCurrentPage, setScannedOrderNumber }) {
  const [scanValue, setScanValue] = useState('')

  function handleScan() {
    const foundOrder = orders.find(
      (order) =>
        order.orderNumber.toLowerCase() === scanValue.toLowerCase()
    )

    if (!foundOrder) {
      alert('Order not found')
      return
    }

    setScannedOrderNumber(foundOrder.orderNumber)
    setCurrentPage('tickets')
  }

  return (
    <>
      <h2>QR / Barcode Scanner</h2>

      <p>Scan or type an order number below.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleScan()
        }}
      >
        <input
          placeholder="Scan order number..."
          value={scanValue}
          onChange={(e) => setScanValue(e.target.value)}
        />

        <button type="submit">Open Ticket</button>
      </form>
    </>
  )
}

export default ScannerPage