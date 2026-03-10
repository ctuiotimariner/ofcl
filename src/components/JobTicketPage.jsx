import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'


function JobTicketPage({ orders, setOrders, jobs, scannedOrderNumber }) {
  
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0)
  const [search, setSearch] = useState('')


  useEffect(() => {
  if (!scannedOrderNumber) return

  const foundIndex = orders.findIndex(
    (order) =>
      order.orderNumber.toLowerCase() === scannedOrderNumber.toLowerCase()
  )

  if (foundIndex !== -1) {
    setSelectedOrderIndex(foundIndex)
  }
}, [scannedOrderNumber, orders])


const filteredOrders = orders.filter((order) => {
  if (!order) return false

  return `${order.orderNumber} ${order.customerName}`
    .toLowerCase()
    .includes(search.toLowerCase())
})
  const order = orders[selectedOrderIndex]
  if (!order) {
  return <h2>No saved orders yet</h2>
}

  const orderJobs = jobs.filter(
  (job) => job.orderGroup === order.orderNumber
)
  if (!order) {
    return <h2>No saved orders yet</h2>
  }

function handleDeleteOrder(orderId) {
  const confirmed = window.confirm('Delete this order?')

  if (!confirmed) return

  setOrders((prev) => {
    const updatedOrders = prev.filter((order) => order.id !== orderId)

    setSelectedOrderIndex((currentIndex) =>
      updatedOrders.length === 0
        ? 0
        : Math.min(currentIndex, updatedOrders.length - 1)
    )

    return updatedOrders
  })
}

function getOrderStage(orderJobs) {
  const statuses = orderJobs.map((job) => job.status)

  if (statuses.every((s) => s === "Shipped")) return 5
  if (statuses.every((s) => s === "Completed" || s === "Shipped")) return 4
  if (statuses.some((s) => s === "Printing")) return 3
  if (statuses.some((s) => s === "Waiting for Blanks")) return 2
  return 1
}

const stage = getOrderStage(orderJobs)


  return (
    <>
      <h2>Job Ticket</h2>
      <input
        placeholder="Search orders..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
            marginBottom: "20px",
            padding: "8px",
            borderRadius: "6px"
        }}
      />

      <div style={{ marginBottom: '20px' }}>
  <h3>Select Order</h3>

  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
    {filteredOrders.map((savedOrder, index) => (
      <button
        key={savedOrder.id}
        type="button"
        onClick={() => setSelectedOrderIndex(index)}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.15)',
          background:
            index === selectedOrderIndex
              ? 'rgba(255,255,255,0.16)'
              : 'rgba(255,255,255,0.06)',
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        {savedOrder.orderNumber}
      </button>
    ))}
  </div>
</div>

      <button type="button" onClick={() => window.print()}>
        Print / Save PDF
      </button>

      <div className="tableCard" style={{ marginTop: '20px' }}>

        <div className="ticketTopLayout">
  <div>
    <h3>{order.orderNumber}</h3>

    <div className="timelineWrap">
      <div className="timelineRow">
        <div className={`timelineDot ${stage >= 1 ? 'active' : ''}`}></div>
        <div className={`timelineLine ${stage >= 2 ? 'active' : ''}`}></div>

        <div className={`timelineDot ${stage >= 2 ? 'active' : ''}`}></div>
        <div className={`timelineLine ${stage >= 3 ? 'active' : ''}`}></div>

        <div className={`timelineDot ${stage >= 3 ? 'active' : ''}`}></div>
        <div className={`timelineLine ${stage >= 4 ? 'active' : ''}`}></div>

        <div className={`timelineDot ${stage >= 4 ? 'active' : ''}`}></div>
        <div className={`timelineLine ${stage >= 5 ? 'active' : ''}`}></div>

        <div className={`timelineDot ${stage >= 5 ? 'active' : ''}`}></div>
      </div>

      <div className="timelineLabels">
        <span className={stage >= 1 ? 'active' : ''}>Email</span>
        <span className={stage >= 2 ? 'active' : ''}>Blanks</span>
        <span className={stage >= 3 ? 'active' : ''}>Printing</span>
        <span className={stage >= 4 ? 'active' : ''}>Completed</span>
        <span className={stage >= 5 ? 'active' : ''}>Shipped</span>
      </div>
    </div>

    <button
      type="button"
      onClick={() => handleDeleteOrder(order.id)}
      style={{ marginBottom: '15px' }}
    >
      Delete Order
    </button>

    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
      <QRCodeCanvas value={order.orderNumber} size={120} />
    </div>

    <p><strong>Customer:</strong> {order.customerName}</p>
    <p><strong>Vendor:</strong> {order.vendor}</p>
    <p><strong>PO Number:</strong> {order.poNumber}</p>
    <p><strong>Due Date:</strong> {order.dueDate}</p>
    <p><strong>Notes:</strong> {order.generalNotes || '—'}</p>
  </div>

  <div className="ticketMockupBox">
    {order.items?.[0]?.mockup instanceof File && (
      <img
        src={URL.createObjectURL(order.items[0].mockup)}
        alt="mockup"
        className="ticketMockupImage"
      />
    )}
  </div>
</div>


        <h3 style={{ marginTop: '24px' }}>Placement Guide</h3>

        <div className="placementGuide">
          {order.items.map((item, index) => (
            <div key={index} className="placementCard">
              <h4>{item.garment}</h4>

              <p>
                <strong>Placement:</strong>{' '}
                <span className="placementTag">
                  {item.placement || '—'}
                </span>
              </p>

              <p><strong>Design:</strong> {item.designName || '—'}</p>
              <p><strong>Method:</strong> {item.method || '—'}</p>
              <p><strong>Sizes:</strong> {item.sizes || '—'}</p>
            </div>
          ))}
        </div>
        <h3 style={{ marginTop: '20px' }}>Items</h3>

        <table>
          <thead>
            <tr>
              <th>Garment</th>
              <th>Qty</th>
              <th>Sizes</th>
              <th>Placement</th>
              <th>Design</th>
              <th>Method</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{item.garment}</td>
                <td>{item.qty}</td>
                <td>{item.sizes}</td>
                <td>{item.placement}</td>
                <td>{item.designName}</td>
                <td>{item.method}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default JobTicketPage