import { useState } from 'react'
import { supabase } from '../lib/supabase'

function OrdersPage({
  orders,
  jobs,
  setJobs,
  setOrders,
  setCurrentPage,
  setSelectedOrder,
}) {
  const [orderNumber, setOrderNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [vendor, setVendor] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [generalNotes, setGeneralNotes] = useState('')

  const [garment, setGarment] = useState('')
  const [qty, setQty] = useState(0)
  const [sizes, setSizes] = useState('')
  const [placement, setPlacement] = useState('')
  const [designName, setDesignName] = useState('')
  const [method, setMethod] = useState('')
  const [mockup, setMockup] = useState(null)

  const [orderItems, setOrderItems] = useState([])
  const [orderSearch, setOrderSearch] = useState('')

  function handleAddItem() {
    if (!garment || Number(qty) <= 0 || !method || !placement) return

    const newItem = {
      garment,
      qty: Number(qty),
      sizes,
      placement,
      designName,
      method,
      mockup,
    }

    setOrderItems((prev) => [...prev, newItem])

    setGarment('')
    setQty(0)
    setSizes('')
    setPlacement('')
    setDesignName('')
    setMethod('')
    setMockup(null)
  }

 async function handleCreateOrder() {
  if (!orderNumber || !customerName || orderItems.length === 0) return

  const newJobs = orderItems.map((item) => ({
    orderGroup: orderNumber,
    client: customerName,
    garment: item.garment,
    qty: item.qty,
    sizes: item.sizes,
    placement: item.placement,
    designName: item.designName,
    method: item.method,
    mockup: item.mockup,
    status: 'Waiting for Blanks',
    dueDate,
    vendor,
    poNumber,
    delivered: false,
  }))

  const newOrder = {
    id: Date.now(),
    orderNumber,
    customerName,
    vendor,
    poNumber,
    dueDate,
    generalNotes,
    items: orderItems,
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert(newJobs)
    .select()

  if (error) {
    console.error('INSERT ERROR FULL:', JSON.stringify(error, null, 2))
    alert(`Order failed: ${error.message}`)
    return
  }

  console.log('INSERT SUCCESS:', data)

  setJobs((prev) => [...prev, ...(data || newJobs)])
  setOrders((prev) => [...prev, newOrder])

  setOrderItems([])
  setOrderNumber('')
  setCustomerName('')
  setVendor('')
  setPoNumber('')
  setDueDate('')
  setGeneralNotes('')
}

  function handleDeleteOrder(orderId) {
    const updatedOrders = orders.filter((order) => order.id !== orderId)
    setOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
  }

  const filteredOrders = orders.filter((order) => {
    const search = orderSearch.toLowerCase()

    return (
      order.orderNumber.toLowerCase().includes(search) ||
      order.customerName.toLowerCase().includes(search) ||
      order.vendor.toLowerCase().includes(search)
    )
  })

  function getOrderStatus(orderNumber) {
    const orderJobs = jobs.filter(
      (job) => job.orderGroup === orderNumber
    )

    if (orderJobs.length === 0) return "No Jobs"

    const allShipped = orderJobs.every(
      (job) => job.status === "Shipped"
    )

    const allCompleted = orderJobs.every(
      (job) =>
        job.status === "Completed" || job.status === "Shipped"
    )

    const printing = orderJobs.some(
      (job) => job.status === "Printing"
    )

    const waiting = orderJobs.some(
      (job) => job.status === "Waiting for Blanks"
    )

    if (allShipped) return "Shipped"
    if (allCompleted) return "Completed"
    if (printing) return "Printing"
    if (waiting) return "Waiting for Blanks"

    return "Email Received"
  }

function getOrderStatusStyle(status) {
  switch (status) {
    case 'Waiting for Blanks':
      return { color: '#ffcc66', fontWeight: 600 }

    case 'Printing':
      return { color: '#5da3ff', fontWeight: 600 }

    case 'Completed':
      return { color: '#4cd964', fontWeight: 600 }

    case 'Shipped':
      return { color: '#a78bfa', fontWeight: 600 }

    default:
      return {}
  }
}

function getOrderStatusBadge(status) {
  switch (status) {
    case "Waiting for Blanks":
      return "status-badge status-waiting"

    case "Printing":
      return "status-badge status-printing"

    case "Completed":
      return "status-badge status-completed"

    case "Shipped":
      return "status-badge status-shipped"

    default:
      return "status-badge"
  }
}







  return (
    <>
      <h2>Create Order</h2>

      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder="Order Number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />

        <input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          placeholder="Vendor"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
        />

        <input
          placeholder="PO Number"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <input
          placeholder="General Notes"
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
        />
      </form>

      <h3>Add Order Item</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAddItem()
        }}
      >
        <input
          placeholder="Garment"
          value={garment}
          onChange={(e) => setGarment(e.target.value)}
        />

        <input
          type="number"
          placeholder="Qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <input
          placeholder="Sizes / Notes"
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
        />

        <input
          placeholder="Placement"
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
        />

        <input
          placeholder="Design Name"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0]
            if (!file) return

            const reader = new FileReader()
            reader.onloadend = () => {
              setMockup(reader.result)
            }
            reader.readAsDataURL(file)
          }}
        />

        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">Print Method</option>
          <option>Embroidery</option>
          <option>DTF Printing</option>
        </select>

        <button type="submit">Add Item</button>
      </form>

      <div className="tableCard">
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
            {orderItems.map((item, index) => (
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

      <button type="button" onClick={handleCreateOrder}>
        Create Order
      </button>

      <h3 style={{ marginTop: '30px' }}>Saved Orders</h3>

      <input
        placeholder="Search orders..."
        value={orderSearch}
        onChange={(e) => setOrderSearch(e.target.value)}
      />

      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Due Date</th>
              <th>Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>  
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customerName}</td>
                <td>{order.dueDate}</td>
                <td>{order.items.length}</td>
                <td>
                  <span className={getOrderStatusBadge(getOrderStatus(order.orderNumber))}>
                    {getOrderStatus(order.orderNumber)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order.orderNumber)
                        setCurrentPage('tickets')
                      }}
                    >
                      View Ticket
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default OrdersPage