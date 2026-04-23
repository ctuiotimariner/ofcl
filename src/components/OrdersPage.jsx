import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { getOrderStatusFromJobs } from "../utils/statusHelpers"

const EMPTY_SIZE_ROWS = [{ size: "XS", qty: "" }]

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
  const [openActionId, setOpenActionId] = useState(null)
  const [vendor, setVendor] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [generalNotes, setGeneralNotes] = useState("")
  const [orderType, setOrderType] = useState("")
  const [productsData, setProductsData] = useState([])

  const [vendorData, setVendorData] = useState(null)
  const [productStyle, setProductStyle] = useState("")
  const [productColor, setProductColor] = useState("")
  const [markupPercent, setMarkupPercent] = useState(40)
  const [showProductSuggestions, setShowProductSuggestions] = useState(false)

  const [garment, setGarment] = useState("")
  const [productType, setProductType] = useState("shirt")
  const [sellPrice, setSellPrice] = useState("")
  const [sizeRows, setSizeRows] = useState(EMPTY_SIZE_ROWS)
  const [placement, setPlacement] = useState("")
  const [designName, setDesignName] = useState("")
  const [method, setMethod] = useState("")
  const [mockup, setMockup] = useState(null)

  const [orderItems, setOrderItems] = useState([])
  const [orderSearch, setOrderSearch] = useState("")

  const sizeOptionsByType = {
    shirt: ["XS", "S", "M", "L", "XL", "2X", "3X", "4X", "5X"],
    youth: ["YXS", "YS", "YM", "YL", "YXL"],
    hat: ["Adjustable", "One Size", "S/M", "L/XL"],
    beanie: ["One Size"],
    bag: ["One Size"],
  }

  async function generateOrderNumber() {
    const { data, error } = await supabase
      .from("orders")
      .select("orderNumber")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Order number fetch error:", error)
      return
    }

    let nextNumber = 1001

    if (data && data.length > 0) {
      const lastOrder = data[0].orderNumber || ""
      const match = lastOrder.match(/OFCL-(\d+)/)

      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    setOrderNumber(`OFCL-${nextNumber}`)
  }

  const totalQty = sizeRows.reduce((sum, row) => sum + Number(row.qty || 0), 0)

  function getDefaultSizeRows(type) {
    return [
      {
        size: sizeOptionsByType[type][0],
        qty: "",
      },
    ]
  }

  function resetItemForm(nextType = "shirt") {
    setProductType(nextType)
    setGarment("")
    setSellPrice("")
    setSizeRows(getDefaultSizeRows(nextType))
    setPlacement("")
    setDesignName("")
    setMethod("")
    setMockup(null)
    setVendorData(null)
    setProductStyle("")
    setProductColor("")
    setShowProductSuggestions(false)
  }

  function handleProductTypeChange(e) {
    const newType = e.target.value
    setProductType(newType)
    setSizeRows(getDefaultSizeRows(newType))
  }

  useEffect(() => {
    loadProducts()
    generateOrderNumber()
  }, [])

  useEffect(() => {
    setSizeRows(getDefaultSizeRows(productType))
  }, [])

  function getAutoSellPrice(cost, markup) {
    const safeCost = Number(cost) || 0
    const safeMarkup = Number(markup) || 0
    return Number((safeCost * (1 + safeMarkup / 100)).toFixed(2))
  }

  function getMinSellPrice(cost, targetMargin = 30) {
    const safeCost = Number(cost) || 0
    const marginDecimal = targetMargin / 100

    if (safeCost === 0) return 0

    return Number((safeCost / (1 - marginDecimal)).toFixed(2))
  }

  function handleSizeRowChange(index, field, value) {
    setSizeRows((prev) => {
      const updatedRows = prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )

      if (field === "size" && value) {
        const duplicateCount = updatedRows.filter((row) => row.size === value).length

        if (duplicateCount > 1) {
          alert(`${value} is already added`)
          return prev
        }
      }

      return updatedRows
    })
  }

  function addSizeRow() {
    setSizeRows((prev) => [
      ...prev,
      {
        size: sizeOptionsByType[productType][0],
        qty: "",
      },
    ])
  }

  function removeSizeRow(index) {
    setSizeRows((prev) => {
      if (prev.length === 1) return getDefaultSizeRows(productType)
      return prev.filter((_, i) => i !== index)
    })
  }

  function buildSizesObject() {
    return sizeRows.reduce((acc, row) => {
      const cleanSize = String(row.size || "").trim()
      const cleanQty = Number(row.qty || 0)

      if (cleanSize && cleanQty > 0) {
        acc[cleanSize] = cleanQty
      }

      return acc
    }, {})
  }

  function formatSizes(sizeObject) {
    return Object.entries(sizeObject || {})
      .filter(([_, value]) => Number(value) > 0)
      .map(([size, value]) => `${size}:${value}`)
      .join(", ")
  }

  useEffect(() => {
    const safeQty = Number(totalQty)

    if (!vendor || !productStyle || !productColor || !safeQty) {
      setVendorData(null)
      return
    }

    getVendorData()
  }, [vendor, productStyle, productColor, totalQty])

  async function getVendorData() {
    if (!vendor || !productStyle || !productColor || !totalQty) return

    try {
      const response = await fetch("http://localhost:3001/api/vendor/ss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor,
          style: productStyle,
          color: productColor,
          qty: totalQty,
        }),
      })

      const data = await response.json()

      if (!data?.data) {
        alert("Vendor data not found")
        return
      }

      const vendorResult = data.data

      setVendorData(vendorResult)
      setGarment(`${productStyle} - ${productColor}`)

      const unitCost = Number(vendorResult.price || 0)
      const autoSell = getAutoSellPrice(unitCost, markupPercent)

      setSellPrice(autoSell)
    } catch (error) {
      console.error("Vendor fetch error:", error)
      alert("Could not load vendor data")
    }
  }

  function getSizePrice(productsData, styleName, colorName, sizeName) {
    let normalizedSize = String(sizeName || "").trim().toUpperCase()

    if (normalizedSize === "2X") normalizedSize = "2XL"
    if (normalizedSize === "3X") normalizedSize = "3XL"
    if (normalizedSize === "4X") normalizedSize = "4XL"
    if (normalizedSize === "5X") normalizedSize = "5XL"

    const match = productsData.find(
      (p) =>
        String(p.styleName || "").trim().toLowerCase() ===
          String(styleName || "").trim().toLowerCase() &&
        String(p.colorName || "").trim().toLowerCase() ===
          String(colorName || "").trim().toLowerCase() &&
        String(p.sizeName || "").trim().toUpperCase() === normalizedSize
    )

    return match ? Number(match.piecePrice) : 0
  }

  function handleAddItem() {
    const needsVendorPricing = orderType === "Full Production"

    if (needsVendorPricing && !vendorData) {
      alert("Click 'Get Price' before adding item")
      return
    }

    const sizesObj = buildSizesObject()

    const calculatedQty = Object.values(sizesObj).reduce(
      (sum, qty) => sum + Number(qty || 0),
      0
    )

    if (!garment || calculatedQty <= 0 || !method || !placement) return

    const calculatedTotalCost = Object.entries(sizesObj).reduce(
      (sum, [size, qty]) => {
        const price = getSizePrice(
          productsData,
          productStyle,
          productColor,
          size
        )

        return sum + Number(qty || 0) * price
      },
      0
    )

    const calculatedTotalPrice = Number(sellPrice || 0) * calculatedQty

    const newItem = {
      vendor,
      garment,
      color: productColor,
      productType,
      qty: calculatedQty,
      sizes: sizesObj,
      placement,
      designName,
      method,
      mockup,
      unitCost: calculatedQty > 0 ? calculatedTotalCost / calculatedQty : 0,
      totalCost: calculatedTotalCost,
      sellPrice: Number(sellPrice || 0),
      totalPrice: calculatedTotalPrice,
      markup: Number(markupPercent || 0),
      profitEach:
        calculatedQty > 0
          ? (calculatedTotalPrice - calculatedTotalCost) / calculatedQty
          : 0,
      totalProfit: calculatedTotalPrice - calculatedTotalCost,
    }

    setOrderItems((prev) => [...prev, newItem])
    resetItemForm("shirt")
  }

  async function handleCreateOrder() {
    const needsVendorPricing = orderType === "Full Production"

    if (
      !orderNumber ||
      !customerName ||
      !orderType ||
      orderItems.length === 0 ||
      (needsVendorPricing && !vendor)
    ) {
      return
    }

    const newJobs = orderItems.map((item) => ({
      orderGroup: orderNumber,
      client: customerName,
      orderType,
      garment: item.garment,
      productType: item.productType,
      qty: item.qty,
      sizes: item.sizes,
      placement: item.placement,
      designName: item.designName,
      method: item.method,
      mockup: item.mockup,
      status: "Waiting for Blanks",
      dueDate: dueDate || null,
      vendor,
      delivered: false,
    }))

    const totalOrderProfit = orderItems.reduce((sum, item) => {
      return sum + Number(item.totalProfit || 0)
    }, 0)

    const totalCost = orderItems.reduce((sum, item) => {
      return sum + Number(item.totalCost || 0)
    }, 0)

    const totalRevenue = orderItems.reduce((sum, item) => {
      return sum + Number(item.totalPrice || 0)
    }, 0)

    const profit = totalRevenue - totalCost
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    if (margin < 30) {
      const proceed = window.confirm(
        `⚠️ Low Margin Alert\n\nMargin: ${margin.toFixed(1)}%\n\nProceed anyway?`
      )

      if (!proceed) return
    }

    const newOrder = {
      orderNumber,
      customerName,
      orderType,
      vendor,
      dueDate: dueDate || null,
      generalNotes,
      items: orderItems,
      totalProfit: totalOrderProfit,
      totalRevenue,
      paymentStatus: "Unpaid",
    }

    const { error: jobError } = await supabase.from("jobs").insert(newJobs)

    if (jobError) {
      console.error("INSERT JOBS ERROR FULL:", JSON.stringify(jobError, null, 2))
      alert(`Jobs failed: ${jobError.message}`)
      return
    }

    const { error: orderError } = await supabase.from("orders").insert([newOrder])

    if (orderError) {
      console.error("INSERT ORDER ERROR FULL:", JSON.stringify(orderError, null, 2))
      alert(`Order failed: ${orderError.message}`)
      return
    }

    await fetchJobs()
    if (fetchOrders) {
      await fetchOrders()
    }

    const newOrderNumber = orderNumber

    setOrderItems([])
    setOrderNumber("")
    setCustomerName("")
    setOrderType("")
    setVendor("")
    setDueDate("")
    setGeneralNotes("")
    setProductStyle("")
    setProductColor("")
    setGarment("")
    setPlacement("")
    setDesignName("")
    setMockup("")
    setMethod("")
    setSellPrice("")
    setMarkupPercent("30")
    setVendorData(null)
    setProductType("shirt")
    setSizeRows([{ size: "M", qty: "" }])

    setSelectedOrder(newOrderNumber)
    generateOrderNumber()
  }

  async function handleDeleteOrder(orderId, orderNumber) {
    const confirmed = window.confirm(
      "Delete this order, related jobs, and related purchase orders?"
    )
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

    const { error: poError } = await supabase
      .from("purchase_orders")
      .delete()
      .eq("order_group", orderNumber)

    if (poError) {
      console.error("DELETE PURCHASE ORDERS ERROR:", poError)
      alert("Failed to delete related purchase orders")
      return
    }

    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId)

    if (orderError) {
      console.error("DELETE ORDER ERROR:", orderError)
      alert(`Failed to delete order: ${orderError.message}`)
      return
    }

    if (fetchOrders) {
      await fetchOrders()
    }

    if (fetchJobs) {
      await fetchJobs()
    }

    alert("Order deleted")
  }

  async function handleCreatePOFromOrder(order) {
    try {
      const newPONumber = `OFCL-PO-${Date.now()}`

      const { data: newPO, error: poError } = await supabase
        .from("purchase_orders")
        .insert({
          po_number: newPONumber,
          vendor: order.vendor || "S&S Activewear",
          order_group: order.orderNumber,
          customer_name: order.customerName,
          status: "Ordered",
        })
        .select()
        .single()

      if (poError) {
        console.error("PO ERROR:", poError)
        alert("Failed to create PO")
        return
      }

      setSelectedOrder(newPO.order_group)
      setCurrentPage("purchaseOrders")

      const poItems = []

      order.items.forEach((item) => {
        Object.entries(item.sizes || {}).forEach(([size, qty]) => {
          if (qty > 0) {
            poItems.push({
              purchase_order_id: newPO.id,
              garment: item.garment,
              style: item.garment,
              color: item.color || "",
              size,
              qty_ordered: qty,
              qty_received: 0,
              status: "Pending",
            })
          }
        })
      })

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(poItems)

      if (itemsError) {
        console.error("PO ITEMS ERROR:", itemsError)
        alert("Failed to create PO items")
        return
      }

      alert(`PO Created: ${newPONumber}`)
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }
  }

  async function handleMarkPaid(orderId) {
    const confirmPaid = window.confirm("Mark this order as paid?")
    if (!confirmPaid) return

    const now = new Date()

    const { error } = await supabase
      .from("orders")
      .update({
        paymentStatus: "Paid",
        paidAt: now,
      })
      .eq("id", orderId)

    if (error) {
      console.error("MARK PAID ERROR:", error)
      alert("Failed to update payment status")
      return
    }

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, paymentStatus: "Paid", paidAt: now.toISOString() }
          : order
      )
    )

    if (fetchOrders) {
      await fetchOrders()
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
      (order.orderNumber || "").toLowerCase().includes(search) ||
      (order.customerName || "").toLowerCase().includes(search) ||
      (order.vendor || "").toLowerCase().includes(search)
    )
  })

  const needsVendorPricing = orderType === "Full Production"

  const isReadyToAdd =
    !!garment &&
    Number(totalQty) > 0 &&
    !!method &&
    !!placement &&
    (!needsVendorPricing || (!!vendorData && !!vendorData.price))

  const isReadyToCreate =
    !!orderNumber &&
    !!customerName &&
    !!orderType &&
    orderItems.length > 0 &&
    (!needsVendorPricing || !!vendor)

  const summaryTotalCost = orderItems.reduce((sum, item) => {
    return sum + Number(item.totalCost || 0)
  }, 0)

  const summaryTotalRevenue = orderItems.reduce((sum, item) => {
    return sum + Number(item.totalPrice || 0)
  }, 0)

  const summaryProfit = orderItems.reduce((sum, item) => {
    return sum + Number(item.totalProfit || 0)
  }, 0)

  const summaryMargin =
    summaryTotalRevenue > 0
      ? (summaryProfit / summaryTotalRevenue) * 100
      : 0

  const draftSizesObj = buildSizesObject()

  const draftQty = Object.values(draftSizesObj).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0
  )

  const draftTotalCost = Object.entries(draftSizesObj).reduce(
    (sum, [size, qty]) => {
      const price = getSizePrice(
        productsData,
        productStyle,
        productColor,
        size
      )

      return sum + Number(qty || 0) * price
    },
    0
  )

  const draftTotalPrice = Number(sellPrice || 0) * draftQty
  const draftProfit = draftTotalPrice - draftTotalCost
  const draftMargin =
    draftTotalPrice > 0 ? (draftProfit / draftTotalPrice) * 100 : 0

  async function loadProducts() {
    try {
      const response = await fetch("http://localhost:3001/api/products")
      const data = await response.json()
      setProductsData(data)
    } catch (error) {
      console.error("Failed to load products:", error)
    }
  }

  const vendorSizesObj = buildSizesObject()

  const vendorTotalCost = Object.entries(vendorSizesObj).reduce(
    (sum, [size, qty]) => {
      const price = getSizePrice(
        productsData,
        productStyle,
        productColor,
        size
      )
      return sum + Number(qty || 0) * price
    },
    0
  )

  const vendorUnitPrice =
    totalQty > 0 ? vendorTotalCost / totalQty : 0

  useEffect(() => {
    if (!vendorUnitPrice) return
    const autoSell = getAutoSellPrice(vendorUnitPrice, markupPercent)
    setSellPrice(autoSell)
  }, [markupPercent, vendorUnitPrice])

  const minSellPrice30 = getMinSellPrice(vendorUnitPrice, 30)

  const filteredProducts = [
    ...new Map(
      productsData
        .filter((p) => {
          const search = productStyle.toLowerCase()

          if (!search) return true

          return (
            String(p.styleName || "").toLowerCase().includes(search) ||
            String(p.brandName || "").toLowerCase().includes(search)
          )
        })
        .map((p) => [p.styleName, p])
    ).values(),
  ]

  const filteredColorObjects = [
    ...new Map(
      productsData
        .filter(
          (p) =>
            String(p.styleName || "").toLowerCase() ===
            String(productStyle || "").toLowerCase()
        )
        .map((p) => [p.colorName, p])
    ).values(),
  ]

  function handleRemoveItem(indexToRemove) {
    setOrderItems((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    )
  }

  function getMissingFields() {
    const missing = []

    if (!orderNumber) missing.push("Order Number")
    if (!customerName) missing.push("Customer Name")
    if (!orderType) missing.push("Order Type")
    if (orderItems.length === 0) missing.push("At least 1 item")
    if (orderType === "Full Production" && !vendor) {
      missing.push("Vendor")
    }

    return missing
  }

  return (
    <>
      <div className="sectionCard">
        <h3 className="sectionTitle">Order Details</h3>

        <form onSubmit={(e) => e.preventDefault()} className="orderGrid">
          <input
            placeholder="Order Number"
            value={orderNumber}
            readOnly
          />

          <input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <select
            className="inputField"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option value="" disabled>
              Order Type
            </option>
            <option value="Full Production">Full Production</option>
            <option value="Customer Supplied">Customer Supplied</option>
            <option value="Split Ship">Split Ship</option>
          </select>

          <select value={vendor} onChange={(e) => setVendor(e.target.value)}>
            <option value="">Select Vendor</option>
            <option value="S&S Activewear">S&S Activewear</option>
            <option value="SanMar">SanMar</option>
            <option value="AS Colour">AS Colour</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <input
            className="fullWidth"
            placeholder="General Notes"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
          />
        </form>
      </div>

      {orderType === "Full Production" && (
        <div className="sectionCard">
          <h3 className="sectionTitle">Vendor Pricing</h3>

          <div className="orderGrid">
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Product Style"
                value={productStyle}
                onChange={(e) => {
                  setProductStyle(e.target.value)
                  setProductColor("")
                  setShowProductSuggestions(true)
                }}
              />

              {showProductSuggestions &&
                productStyle &&
                filteredProducts.length > 0 && (
                  <div
  style={{
    position: "absolute",
    top: "110%",
    left: 0,
    background: "#111",
    border: "1px solid #333",
    borderRadius: "6px",
    padding: "6px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "140px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
    maxHeight: "250px",
    overflowY: "auto",
  }}
>
                    {filteredProducts.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #222",
                          transition: "0.15s ease",
                          background: "transparent",
                          color: "#fff",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#0f2a1a"
                          e.currentTarget.style.color = "#00ff99"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent"
                          e.currentTarget.style.color = "#fff"
                        }}
                        onClick={() => {
                          setProductStyle(p.styleName || "")
                          setProductColor("")
                          setGarment(p.styleName || "")
                          setShowProductSuggestions(false)
                        }}
                      >
                        {p.brandName} {p.styleName}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <select
              value={productColor}
              onChange={(e) => setProductColor(e.target.value)}
            >
              <option value="">Select Color</option>
              {filteredColorObjects.map((p, i) => (
                <option key={i} value={p.colorName}>
                  {p.colorName}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Qty"
              value={totalQty || ""}
              readOnly
            />
          </div>

          <button
            type="button"
            onClick={getVendorData}
            className="primaryButton"
            disabled={!vendor || !totalQty}
            style={{
              marginTop: "12px",
              opacity: !vendor || !totalQty ? 0.5 : 1,
            }}
          >
            Get Price
          </button>

          {!vendor && (
            <p style={{ color: "#ff48d1", marginTop: "6px" }}>
              ⚠️ Select a vendor to get pricing
            </p>
          )}

          {!!vendor && !totalQty && (
            <p style={{ color: "#ffcc66", marginTop: "6px" }}>
              ⚠️ Add size quantities first
            </p>
          )}

          <p
            className="mutedText"
            style={{
              marginTop: "8px",
              fontWeight: 600,
              color: vendorData ? "#4cd964" : "#ffcc66",
            }}
          >
            {vendorData
              ? `Price loaded (${vendorData.source === "api" ? "Live API" : "CSV"})`
              : "Price not loaded"}
          </p>

          {vendorData && (
            <div style={{ marginTop: "14px" }}>
              <p><strong>Vendor:</strong> {vendorData.vendor}</p>
              <p><strong>Product:</strong> {vendorData.product}</p>
              <p><strong>Color:</strong> {vendorData.color}</p>
              <p><strong>Qty:</strong> {vendorData.qty}</p>
              <p><strong>Unit Price:</strong> ${Number(vendorUnitPrice || 0).toFixed(2)}</p>
              <p><strong>Total:</strong> ${Number(vendorTotalCost || 0).toFixed(2)}</p>
              <p style={{ marginTop: "8px", color: "#ffcc66" }}>
                <strong>Min Sell (30% margin):</strong> ${minSellPrice30.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="sectionCard">
        <h3 className="sectionTitle">Add Order Item</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAddItem()
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "12px",
              marginBottom: "16px",
              alignItems: "start",
            }}
          >
            <div className="orderGrid">
              <div className="inputWithLabel">
                <span>Garment</span>
                <input
                  value={garment}
                  onChange={(e) => setGarment(e.target.value)}
                />
              </div>

              <div className="inputWithLabel">
                <span>Product Type</span>
                <select value={productType} onChange={handleProductTypeChange}>
                  <option value="shirt">Shirt</option>
                  <option value="youth">Youth</option>
                  <option value="hat">Hat</option>
                  <option value="beanie">Beanie</option>
                  <option value="bag">Bag</option>
                </select>
              </div>

              <div className="inputWithLabel">
                <span>Qty</span>
                <input type="number" value={totalQty || ""} readOnly />
              </div>

              <div className="inputWithLabel">
                <span>Markup %</span>
                <input
                  type="number"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                />
              </div>

              <div className="inputWithLabel">
                <span>Sell Price</span>
                <div className="stackField">
                  <input
                    type="number"
                    step="0.01"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                  />
                  {draftTotalCost > 0 && (
                    <span className="helperText">
                      Suggested (30%): ${(draftTotalCost / 0.7).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="inputWithLabel">
                <span>Placement</span>
                <input
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                />
              </div>

              <div className="inputWithLabel">
                <span>Design Name</span>
                <input
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                />
              </div>

              <div className="inputWithLabel fileField">
                <span>Mockup</span>
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
              </div>

              <div className="inputWithLabel">
                <span>Print Method</span>
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="">Print Method</option>
                  <option>Embroidery</option>
                  <option>DTF Printing</option>
                </select>
              </div>
            </div>

            <div className="sizeBox">
              <h4 className="sectionTitle" style={{ marginBottom: "10px" }}>
                Size Breakdown
              </h4>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {sizeRows.map((row, index) => (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr auto",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <select
                      value={row.size}
                      onChange={(e) =>
                        handleSizeRowChange(index, "size", e.target.value)
                      }
                    >
                      {sizeOptionsByType[productType].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={row.qty || ""}
                      onChange={(e) =>
                        handleSizeRowChange(index, "qty", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeSizeRow(index)}
                      style={{
                        background: "#222",
                        color: "#aaa",
                        border: "1px solid #333",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button type="button" onClick={addSizeRow}>
                  + Add Size
                </button>
              </div>
            </div>
          </div>

          <div
            className="orderSummaryGrid"
            style={{
              marginTop: "12px",
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            <div className="summaryCard">
              <div className="summaryLabel">Draft Price</div>
              <div className="summaryValue">${draftTotalPrice.toFixed(2)}</div>
            </div>

            <div className="summaryCard">
              <div className="summaryLabel">Draft Cost</div>
              <div className="summaryValue">${draftTotalCost.toFixed(2)}</div>
            </div>

            <div
              className={`summaryCard ${
                draftProfit <= 0
                  ? "dangerSummary"
                  : draftProfit < 100
                  ? "warnSummary"
                  : "goodSummary"
              }`}
            >
              <div className="summaryLabel">Draft Profit</div>
              <div className="summaryValue">${draftProfit.toFixed(2)}</div>
            </div>

            <div
              className={`summaryCard ${
                draftMargin < 30
                  ? "dangerSummary"
                  : draftMargin < 50
                  ? "warnSummary"
                  : "goodSummary"
              }`}
            >
              <div className="summaryLabel">Draft Margin</div>
              <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                {draftMargin <= 0 && (
                  <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                    ❌ Losing money
                  </span>
                )}

                {draftMargin > 0 && draftMargin < 30 && (
                  <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
                    ⚠️ Low margin
                  </span>
                )}

                {draftMargin >= 30 && draftMargin < 50 && (
                  <span style={{ color: "#ffcc66", fontSize: "12px" }}>
                    ⚠️ Okay margin
                  </span>
                )}

                {draftMargin >= 50 && (
                  <span style={{ color: "#4cd964", fontSize: "12px" }}>
                    ✅ Great margin
                  </span>
                )}
              </div>
              <div className="summaryValue">{draftMargin.toFixed(1)}%</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "start",
              flexWrap: "wrap",
              marginTop: "16px",
            }}
          >
            <button
              type="submit"
              disabled={!isReadyToAdd}
              style={{
                background: "#00ff99",
                color: "#000",
                fontWeight: "bold",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 10px #00ff99",
              }}
            >
              ADD ITEM
            </button>
          </div>
        </form>
      </div>

      <div className="sectionCard">
        <h3 className="sectionTitle">Order Items</h3>

        <div className="tableCard" style={{ marginTop: 0 }}>
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
                <th className="ordersActionCol">Action</th>
              </tr>
            </thead>

            <tbody>
              {orderItems.map((item, index) => (
                <tr
                  key={index}
                  style={{ transition: "0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#111")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td>{item.garment}</td>
                  <td>{item.qty}</td>
                  <td>{formatSizes(item.sizes)}</td>
                  <td>{item.placement}</td>
                  <td>{item.designName}</td>
                  <td>{item.method}</td>
                  <td>${Number(item.unitCost || 0).toFixed(2)}</td>
                  <td>${Number(item.sellPrice || 0).toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => handleRemoveItem(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="orderSummaryGrid"
          style={{
            marginTop: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "12px",
          }}
        >
          <div className="summaryCard">
            <div className="summaryLabel">Total Price</div>
            <div className="summaryValue">
              ${summaryTotalRevenue.toFixed(2)}
            </div>
          </div>

          <div className="summaryCard">
            <div className="summaryLabel">Total Cost</div>
            <div className="summaryValue">
              ${summaryTotalCost.toFixed(2)}
            </div>
          </div>

          <div
            className={`summaryCard ${
              summaryProfit <= 0
                ? "dangerSummary"
                : summaryProfit < 100
                ? "warnSummary"
                : "goodSummary"
            }`}
          >
            <div className="summaryLabel">Profit</div>
            <div className="summaryValue">${summaryProfit.toFixed(2)}</div>
          </div>

          <div
            className={`summaryCard ${
              summaryMargin < 30
                ? "dangerSummary"
                : summaryMargin < 50
                ? "warnSummary"
                : "goodSummary"
            }`}
          >
            <div className="summaryLabel">Margin</div>
            <div className="summaryValue">{summaryMargin.toFixed(1)}%</div>
          </div>
        </div>

        <button
          type="button"
          disabled={!isReadyToCreate}
          title={
            !isReadyToCreate
              ? `Missing: ${getMissingFields().join(", ")}`
              : ""
          }
          style={{
            opacity: isReadyToCreate ? 1 : 0.4,
            cursor: isReadyToCreate ? "pointer" : "not-allowed",
          }}
          onClick={handleCreateOrder}
        >
          Create Order
        </button>
      </div>

      <div className="sectionCard">
        <h3 className="sectionTitle">Saved Orders</h3>

        <input
          placeholder="Search orders..."
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
        />

        <div className="tableCard ordersTable">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Due Date</th>
                <th>Items</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, index) => {
                const displayStatus =
                  getOrderStatusFromJobs(jobs, order.orderNumber) || order.status
                const openUp = index >= filteredOrders.length - 2
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
                          color:
                            order.paymentStatus === "Paid" ? "#4cd964" : "#ffcc66",
                          fontWeight: 700,
                        }}
                      >
                        {order.paymentStatus === "Paid" ? (
                          <>
                            Paid{" "}
                            {order.paidAt && (
                              <span style={{ opacity: 0.7, fontWeight: 500 }}>
                                ({new Date(order.paidAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })})
                              </span>
                            )}
                          </>
                        ) : (
                          "Unpaid"
                        )}
                      </span>
                    </td>

                    <td>
  <div className="ordersActionRow">
    {order.paymentStatus === "Paid" ? (
      <button
        type="button"
        disabled
        style={{
          opacity: 0.6,
          cursor: "not-allowed",
          background: "#1f3b1f",
          color: "#4cd964",
          fontWeight: "bold",
        }}
      >
        ✔ PAID
      </button>
    ) : (
      <button
        type="button"
        onClick={() => handleMarkPaid(order.id)}
      >
        PAY
      </button>
    )}

    <button
      type="button"
      onClick={() => {
        setSelectedOrder(order.orderNumber)
        setCurrentPage("tickets")
      }}
    >
      VIEW
    </button>

    <button
      type="button"
      onClick={() =>
        handleDeleteOrder(order.id, order.orderNumber)
      }
    >
      DELETE
    </button>

    <button
      type="button"
      onClick={() => handleCreatePOFromOrder(order)}
    >
      CREATE PO
    </button>
  </div>
</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default OrdersPage