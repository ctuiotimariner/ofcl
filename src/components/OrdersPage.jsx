import { useState } from 'react'

function OrdersPage({ setJobs, setOrders, setCurrentPage, setSelectedOrder }) {
  const [orderNumber, setOrderNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [vendor, setVendor] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [generalNotes, setGeneralNotes] = useState('')

  const [garment, setGarment] = useState('')
  const [qty, setQty] = useState(0)
  const [sizes, setSizes] = useState('')
  const [method, setMethod] = useState('')
  const [placement, setPlacement] = useState('')
  const [designName, setDesignName] = useState('')
  const [mockup, setMockup] = useState(null)

  const [orderItems, setOrderItems] = useState([])

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

    setOrderItems([...orderItems, newItem])

    setGarment('')
    setQty(0)
    setSizes('')
    setPlacement('')
    setDesignName('')
    setMethod('')
    setMockup(null)
  }

  function handleCreateOrder() {
    if (!orderNumber || !customerName || orderItems.length === 0) return

    const newJobs = orderItems.map((item) => ({
      id: Date.now() + Math.random(),
      orderGroup: orderNumber,
      client: customerName,
      garment: item.garment,
      qty: item.qty,
      sizes: item.sizes,
      placement: item.placement,
      designName: item.designName,
      method: item.method,
      mockup: item.mockup,
      status: 'Email Received',
      dueDate: dueDate,
      vendor: vendor,
      poNumber: poNumber,
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


    setJobs((prev) => [...prev, ...newJobs])
    setOrders((prev) => [...prev, newOrder])

    setOrderItems([])

    setOrderNumber('')
    setCustomerName('')
    setVendor('')
    setPoNumber('')
    setDueDate('')
    setGeneralNotes('')
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
          onChange={(e) => setMockup(e.target.files[0])}
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="">Print Method</option>
          <option>Embroidery</option>
          <option>Heat Transfer</option>
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
      <h3 style={{ marginTop: "30px" }}>Saved Orders</h3>

      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Due Date</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {JSON.parse(localStorage.getItem("orders") || "[]").map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customerName}</td>
                <td>{order.dueDate}</td>
                <td>{order.items.length}</td>
               <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedOrder(order.orderNumber)
                        setCurrentPage('tickets')
                      }}
                    >
                      View Ticket
                    </button>

                    <button
                      onClick={() => {
                        const updatedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
                          .filter((savedOrder) => savedOrder.id !== order.id)

                        localStorage.setItem('orders', JSON.stringify(updatedOrders))
                        setOrders(updatedOrders)
                      }}
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