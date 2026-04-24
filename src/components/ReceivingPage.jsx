import { useEffect, useState, useRef } from "react"
import { supabase } from "../lib/supabase"

function ReceivingPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const [poItems, setPOItems] = useState([])
  const [receiveInputs, setReceiveInputs] = useState({})
  const params = new URLSearchParams(window.location.search)
  const poFromScan = params.get("po")
  const firstInputRef = useRef(null)
  const inputRefs = useRef({})

  useEffect(() => {
    fetchOpenPOs()
  }, [])

  async function fetchOpenPOs() {
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("*")
      .in("status", ["Ordered", "Partially Received"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("FETCH PO ERROR:", error)
      return
    }

    setPurchaseOrders(data || [])
      if (poFromScan && data) {
    const match = data.find(
      (po) => po.order_group === poFromScan
    )

    if (match) {
      openPO(match)
    }
  }
  }

  async function openPO(po) {
    setSelectedPO(po)

    const { data, error } = await supabase
      .from("purchase_order_items")
      .select("*")
      .eq("purchase_order_id", po.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("FETCH PO ITEMS ERROR:", error)
      return
    }

    setPOItems(data || [])

    const startingInputs = {}
    ;(data || []).forEach((item) => {
      startingInputs[item.id] = ""
    })
    setReceiveInputs(startingInputs)

    setTimeout(() => {
  firstInputRef.current?.focus()
}, 200)
  }

  function handleReceiveInputChange(itemId, value) {
    setReceiveInputs((prev) => ({
      ...prev,
      [itemId]: value
    }))
  }

  function getItemStatus(qtyOrdered, qtyReceived) {
    if (qtyReceived <= 0) return "Pending"
    if (qtyReceived < qtyOrdered) return "Partially Received"
    return "Received"
  }

  async function updatePOStatus(poId) {
    const { data, error } = await supabase
      .from("purchase_order_items")
      .select("qty_ordered, qty_received")
      .eq("purchase_order_id", poId)

    if (error) {
      console.error("REFETCH PO ITEMS ERROR:", error)
      return
    }

    const items = data || []

    const allPending = items.every((item) => Number(item.qty_received) === 0)
    const allReceived = items.every(
      (item) => Number(item.qty_received) >= Number(item.qty_ordered)
    )

    let nextStatus = "Ordered"

    if (allReceived) {
      nextStatus = "Received"
    } else if (!allPending) {
      nextStatus = "Partially Received"
    }

    const { error: updateError } = await supabase
      .from("purchase_orders")
      .update({ status: nextStatus })
      .eq("id", poId)

    if (updateError) {
      console.error("UPDATE PO STATUS ERROR:", updateError)
      return
    }

    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === poId ? { ...po, status: nextStatus } : po
      )
    )

    setSelectedPO((prev) =>
      prev && prev.id === poId ? { ...prev, status: nextStatus } : prev
    )
  }

  async function receiveItem(item) {
    const currentReceived = Number(item.qty_received || 0)
    const qtyOrdered = Number(item.qty_ordered || 0)
    const remainingQty = qtyOrdered - currentReceived

    const receiveQty =
      receiveInputs[item.id] === "" || receiveInputs[item.id] === undefined
        ? remainingQty
        : Number(receiveInputs[item.id] || 0)

    if (receiveQty <= 0) {
      alert("Enter a valid received qty")
      return
    }
    if (receiveQty > remainingQty) {
      alert("Cannot receive more than remaining quantity")
      return
    }

   
    const newQtyReceived = currentReceived + receiveQty
    const newStatus = getItemStatus(qtyOrdered, newQtyReceived)

    const { error } = await supabase
      .from("purchase_order_items")
      .update({
        qty_received: newQtyReceived,
        status: newStatus
      })
      .eq("id", item.id)

    if (error) {
      console.error("RECEIVE ITEM ERROR:", error)
      alert(`Failed to receive item: ${error.message}`)
      return
    }

    // ✅ If fully received, update jobs too
      if (newQtyReceived >= qtyOrdered) {
        const { error: jobError } = await supabase
          .from("jobs")
            .update({
              delivered: true,
              status: "DTF Next Up"
            })
          .eq("orderGroup", selectedPO.order_group)

        if (jobError) {
          console.error("UPDATE JOBS ERROR:", jobError)
        }
      }

    const updatedItems = poItems.map((poItem) =>
      poItem.id === item.id
        ? {
            ...poItem,
            qty_received: newQtyReceived,
            status: newStatus
          }
        : poItem
    )

    setPOItems(updatedItems)

    setReceiveInputs((prev) => ({
      ...prev,
      [item.id]: ""
    }))

    await updatePOStatus(item.purchase_order_id)
  }

  return (
    <>
      <div className="sectionCard">
        <h3 className="sectionTitle">Receiving</h3>

        <div className="tableCard">
          <table>
            <thead>
              <tr>
                <th>PO #</th>
                <th>Vendor</th>
                <th>Order Group</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Open</th>
              </tr>
            </thead>

            <tbody>
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan="6">No open purchase orders</td>
                </tr>
              ) : (
                purchaseOrders.map((po) => (
                  <tr key={po.id}>
                    <td>{po.po_number}</td>
                    <td>{po.vendor}</td>
                    <td>{po.order_group}</td>
                    <td>{po.customer_name}</td>
                    <td>{po.status}</td>
                    <td>
                      <button onClick={() => openPO(po)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPO && (
        <div className="sectionCard">
          <h3 className="sectionTitle">
            Receiving Items for {selectedPO.po_number}
          </h3>

          <div className="tableCard">
            <table>
              <thead>
                <tr>
                  <th>Garment</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Qty Ordered</th>
                  <th>Qty Received</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Receive Qty</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {poItems.length === 0 ? (
                  <tr>
                    <td colSpan="9">No PO items found</td>
                  </tr>
                ) : (
                  poItems.map((item) => {
                    const remaining =
                      Number(item.qty_ordered || 0) -
                      Number(item.qty_received || 0)

                    return (
                      <tr
                        key={item.id}
                        className={remaining > 0 ? "needsReceivingRow" : "receivedRow"}
                      >
                        <td>{item.garment}</td>
                        <td>{item.color || "-"}</td>
                        <td>{item.size || "-"}</td>
                        <td>{item.qty_ordered}</td>
                        <td>{item.qty_received}</td>
                        <td>{remaining > 0 ? remaining : 0}</td>
                        <td>{item.status}</td>
                        <td>
                          <input
                            ref={(el) => {
                              if (el) {
                                inputRefs.current[item.id] = el

                                if (remaining > 0 && !firstInputRef.current) {
                                  firstInputRef.current = el
                                }
                              }
                            }}
                            type="number"
                            min="0"
                            value={receiveInputs[item.id] || ""}
                            onChange={(e) =>
                              handleReceiveInputChange(item.id, e.target.value)
                            }
                            style={{ width: "90px" }}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()

                                await receiveItem(item)

                                const nextItem = poItems.find((poItem) => {
                                  const remainingQty =
                                    Number(poItem.qty_ordered || 0) -
                                    Number(poItem.qty_received || 0)

                                  return remainingQty > 0 && poItem.id !== item.id
                                })

                                if (nextItem && inputRefs.current[nextItem.id]) {
                                  setTimeout(() => {
                                    inputRefs.current[nextItem.id]?.focus()
                                  }, 200)
                                }
                              }
                            }}
                          />
                          
                        </td>
                        <td>
                          <button onClick={() => receiveItem(item)}>
                            Receive
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default ReceivingPage