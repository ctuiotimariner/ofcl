import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'






function JobTicketPage({ orders, setOrders }) {
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0)
  const [search, setSearch] = useState('')
  const filteredOrders = orders.filter((order) =>
  `${order.orderNumber} ${order.customerName}`
    .toLowerCase()
    .includes(search.toLowerCase())
)
  const order = orders[selectedOrderIndex]

  if (!order) {
    return <h2>No saved orders yet</h2>
  }

function handleDeleteOrder(orderId) {
  const confirmed = window.confirm("Delete this order?")

  if (!confirmed) return

  setOrders((prev) =>
    prev.filter((order) => order.id !== orderId)
  )
}

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
        <h3>{order.orderNumber}</h3>
        <h3>{order.orderNumber}</h3>

        <button
            type="button"
            onClick={() => handleDeleteOrder(order.id)}
            style={{ marginBottom: "15px" }}
            >
            Delete Order
        </button>

        <div 
        style={{ marginTop: "20px" }}>
        <QRCodeCanvas
            value={order.orderNumber}
            size={120}/>
        </div>

        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Vendor:</strong> {order.vendor}</p>
        <p><strong>PO Number:</strong> {order.poNumber}</p>
        <p><strong>Due Date:</strong> {order.dueDate}</p>
        <p><strong>Notes:</strong> {order.generalNotes || '—'}</p>

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