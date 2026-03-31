import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { getOrderStatusFromJobs } from "../utils/statusHelpers"

function OrdersPage({
  orders,
  jobs,
  setJobs,
  setOrders,
  setCurrentPage,
  setSelectedOrder,
  fetchOrders,
  fetchJobs,
}) {
  const [orderNumber, setOrderNumber] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [vendor, setVendor] = useState("")
  const [poNumber, setPoNumber] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [generalNotes, setGeneralNotes] = useState("")

  const [vendorData, setVendorData] = useState(null)
  const [productStyle, setProductStyle] = useState("")
  const [productColor, setProductColor] = useState("")

  const [garment, setGarment] = useState("")
  const [qty, setQty] = useState("")
  const [sellPrice, setSellPrice] = useState("")
  const [sizes, setSizes] = useState("")
  const [placement, setPlacement] = useState("")
  const [designName, setDesignName] = useState("")
  const [method, setMethod] = useState("")
  const [mockup, setMockup] = useState(null)

  const [orderItems, setOrderItems] = useState([])
  const [orderSearch, setOrderSearch] = useState("")

  useEffect(() => {
        const safeQty = Number(qty)

        if (!vendor || !productStyle || !productColor || !safeQty) {
          setVendorData(null)
          return
        }

        getVendorData()
      }, [vendor, productStyle, productColor, qty])

  async function getVendorData() {
  if (!vendor || !productStyle || !productColor || !qty) {
  return
}

  try {
    console.log("SENDING:", {
      vendor,
      style: productStyle,
      color: productColor,
      qty: Number(qty),
    })

    const response = await fetch("http://localhost:5001/api/vendor/ss", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendor,
        style: productStyle,
        color: productColor,
        qty: Number(qty),
      }),
    })

    const data = await response.json()
    console.log("RESPONSE DATA:", data)

    setVendorData(data.data)
  } catch (error) {
    console.error("Vendor fetch error:", error)
    alert("Could not load vendor data")
  }
}

  function handleAddItem() {
    if (!vendorData) {
      alert("Click 'Get Live Price' before adding item")
      return
    }

    if (!garment || Number(qty) <= 0 || !method || !placement) return

    const unitCost = Number(vendorData?.price || 0)
    const itemQty = Number(qty || 0)
    const itemSellPrice = Number(sellPrice || 0)

    const profitEach = itemSellPrice - unitCost
    const totalProfit = profitEach * itemQty

    const newItem = {
      vendor,
      garment,
      color: productColor,
      qty: itemQty,
      sizes,
      placement,
      designName,
      method,
      mockup,
      unitPrice: unitCost,
      totalPrice: unitCost * itemQty,
      sellPrice: itemSellPrice,
      profitEach,
      totalProfit,
    }

    setOrderItems((prev) => [...prev, newItem])

    setGarment("")
    setQty("")
    setSellPrice("")
    setSizes("")
    setPlacement("")
    setDesignName("")
    setMethod("")
    setMockup(null)
    setVendorData(null)
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
      status: "Waiting for Blanks",
      dueDate,
      vendor,
      poNumber,
      delivered: false,
    }))

    const totalOrderProfit = orderItems.reduce((sum, item) => {
      return sum + Number(item.totalProfit || 0)
    }, 0)

    const totalRevenue = orderItems.reduce((sum, item) => {
  return sum + (Number(item.sellPrice) * Number(item.qty))
}, 0)

    const newOrder = {
      orderNumber,
      customerName,
      vendor,
      poNumber,
      dueDate,
      generalNotes,
      items: orderItems,
      totalProfit: totalOrderProfit,
      totalRevenue: totalRevenue,
      paymentStatus: "Unpaid",
    }

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .insert(newJobs)
      .select()

    if (jobError) {
      console.error("INSERT JOBS ERROR FULL:", JSON.stringify(jobError, null, 2))
      alert(`Jobs failed: ${jobError.message}`)
      return
    }

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([newOrder])
      .select()

    if (orderError) {
      console.error("INSERT ORDER ERROR FULL:", JSON.stringify(orderError, null, 2))
      alert(`Order failed: ${orderError.message}`)
      return
    }


await fetchJobs()

    setOrderItems([])
    setOrderNumber("")
    setCustomerName("")
    setVendor("")
    setPoNumber("")
    setDueDate("")
    setGeneralNotes("")
    setVendorData(null)
    setProductStyle("")
    setProductColor("")
  }

  async function handleDeleteOrder(orderId, orderNumber) {
    const confirmed = window.confirm("Delete this order and all related jobs?")
    if (!confirmed) return

    const { error: jobsError } = await supabase
      .from("jobs")
      .delete()
      .eq("orderGroup", orderNumber)

    if (jobsError) {
      console.error("DELETE JOBS ERROR:", jobsError)
      alert("Failed to delete related jobs")
      return
    }

    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)

    if (orderError) {
      console.error("DELETE ORDER ERROR:", orderError)
      alert("Failed to delete order")
      return
    }

    setOrders((prev) => prev.filter((order) => order.id !== orderId))
    setJobs((prev) => prev.filter((job) => job.orderGroup !== orderNumber))
  }

  async function handleMarkPaid(orderId) {
    const { error } = await supabase
      .from("orders")
      .update({ paymentStatus: "Paid" })
      .eq("id", orderId)

    if (error) {
      console.error("MARK PAID ERROR:", error)
      alert("Failed to update payment status")
      return
    }

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false })

    if (fetchError) {
      console.error("REFETCH ORDERS ERROR:", fetchError)
      return
    }

    setOrders(data || [])
  }

  function getOrderStatusBadge(status) {
    switch (status) {
      case "Waiting for Blanks":
        return "status-badge status-waiting"
      case "Printing":
        return "status-badge status-printing"
      case "Completed":
        return "status-badge status-completed"
      case "Will Call":
        return "status-badge status-will-call"
      case "Picked Up":
        return "status-badge status-picked-up"
      case "Shipped":
        return "status-badge status-shipped"
      default:
        return "status-badge"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const search = orderSearch.toLowerCase()

    return (
      order.orderNumber.toLowerCase().includes(search) ||
      order.customerName.toLowerCase().includes(search) ||
      order.vendor.toLowerCase().includes(search)
    )
  })

  const isReadyToAdd =
    !!vendor &&
    Number(qty) > 0 &&
    !!vendorData &&
    !!vendorData.price

  return (
    <>
      <h2>Create Order</h2>

      {vendorData && (
  <div>
    <p><strong>Vendor:</strong> {vendorData.vendor}</p>
    <p><strong>Product:</strong> {vendorData.product}</p>
    <p><strong>Color:</strong> {vendorData.color}</p>
    <p><strong>Qty:</strong> {vendorData.qty}</p>

    <p>
      <strong>Unit Price:</strong> ${Number(vendorData.price).toFixed(2)}
    </p>

    <p>
      <strong>Total:</strong> ${Number(vendorData.total).toFixed(2)}
    </p>
  </div>
)}

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

        <select value={vendor} onChange={(e) => setVendor(e.target.value)}>
          <option value="">Select Vendor</option>
          <option value="S&S Activewear">S&S Activewear</option>
          <option value="SanMar">SanMar</option>
          <option value="AS Colour">AS Colour</option>
        </select>

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

      <h3>Vendor Pricing</h3>

      <div>
        <p>Using order vendor: {vendor || "No vendor selected"}</p>

        <input
          type="text"
          placeholder="Product Style"
          value={productStyle}
          onChange={(e) => setProductStyle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Color"
          value={productColor}
          onChange={(e) => setProductColor(e.target.value)}
        />

        <button type="button" onClick={getVendorData}>
          Get Live Price
        </button>

        <p
          style={{
            marginTop: "8px",
            fontWeight: 600,
            color: vendorData ? "#4cd964" : "#ffcc66",
          }}
        >
          {vendorData ? "Live price ready" : "Live price not loaded"}
        </p>
      </div>

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

        <div className="inputWithLabel">
          <span>Qty</span>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>

        <div className="inputWithLabel">
          <span>Sell Price</span>
          <input
            type="number"
            step="0.01"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
          />
        </div>

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

        <button type="submit" disabled={!isReadyToAdd}>
          Add Item
        </button>
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
              <th>Unit Cost</th>
              <th>Sell Price</th>
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
                <td>${Number(item.unitPrice || 0).toFixed(2)}</td>
                <td>${Number(item.sellPrice || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={handleCreateOrder}>
        Create Order
      </button>

      <h3 style={{ marginTop: "30px" }}>Saved Orders</h3>

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
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => {
              const displayStatus =
                getOrderStatusFromJobs(jobs, order.orderNumber) || order.status

              return (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.dueDate}</td>
                  <td>{order.items.length}</td>

                  <td>
                    <span className={getOrderStatusBadge(displayStatus)}>
                      {displayStatus}
                    </span>
                  </td>

                  <td>
                    <span
                      style={{
                        color: order.paymentStatus === "Paid" ? "#4cd964" : "#ffcc66",
                        fontWeight: 700,
                      }}
                    >
                      {order.paymentStatus || "Unpaid"}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(order.id)}
                      >
                        Mark Paid
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order.orderNumber)
                          setCurrentPage("tickets")
                        }}
                      >
                        View Ticket
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default OrdersPage