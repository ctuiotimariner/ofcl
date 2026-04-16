import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function ReceivingPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const [poItems, setPOItems] = useState([])
  const [receiveInputs, setReceiveInputs] = useState({})

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
    const receiveQty = Number(receiveInputs[item.id] || 0)

    if (receiveQty <= 0) {
      alert("Enter a valid received qty")
      return
    }

    const currentReceived = Number(item.qty_received || 0)
    const qtyOrdered = Number(item.qty_ordered || 0)
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
                      <tr key={item.id}>
                        <td>{item.garment}</td>
                        <td>{item.color || "-"}</td>
                        <td>{item.size || "-"}</td>
                        <td>{item.qty_ordered}</td>
                        <td>{item.qty_received}</td>
                        <td>{remaining > 0 ? remaining : 0}</td>
                        <td>{item.status}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={receiveInputs[item.id] || ""}
                            onChange={(e) =>
                              handleReceiveInputChange(item.id, e.target.value)
                            }
                            style={{ width: "90px" }}
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