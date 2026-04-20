import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const [poItems, setPOItems] = useState([])
  const [vendorOrderNumber, setVendorOrderNumber] = useState("")

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  async function fetchPurchaseOrders() {
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading purchase orders:", error)
      return
    }

    setPurchaseOrders(data || [])
  }

  async function openPO(po) {
    setSelectedPO(po)
    setVendorOrderNumber(po.vendor_order_number || "")

    const { data, error } = await supabase
      .from("purchase_order_items")
      .select("*")
      .eq("purchase_order_id", po.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error loading PO items:", error)
      return
    }

    setPOItems(data || [])
  }

  async function saveVendorOrderNumber() {
    if (!selectedPO) return

    const { data, error } = await supabase
      .from("purchase_orders")
      .update({
        vendor_order_number: vendorOrderNumber
      })
      .eq("id", selectedPO.id)
      .select()
      .single()

    if (error) {
      console.error("Error saving vendor PO number:", error)
      alert("Failed to save vendor PO number")
      return
    }

    setSelectedPO(data)

    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === data.id ? data : po))
    )

    alert("Vendor PO number saved")
  }

  return (
    <div className="sectionCard">
      <h2>Purchase Orders</h2>

      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>PO #</th>
              <th>Vendor</th>
              <th>Order Group</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Vendor Ref</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan="6">No purchase orders yet</td>
              </tr>
            ) : (
              purchaseOrders.map((po) => (
                <tr
                  key={po.id}
                  onClick={() => openPO(po)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{po.po_number || "-"}</td>
                  <td>{po.vendor || "-"}</td>
                  <td>{po.order_group || "-"}</td>
                  <td>{po.customer_name || "-"}</td>
                  <td>{po.status || "-"}</td>
                  <td>{po.vendor_order_number || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedPO && (
        <div className="sectionCard" style={{ marginTop: "20px" }}>
          <h3>{selectedPO.po_number}</h3>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold"
              }}
            >
              Vendor PO Number
            </label>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                value={vendorOrderNumber}
                onChange={(e) => setVendorOrderNumber(e.target.value)}
                placeholder="Enter vendor PO number"
                className="scanInput"
                style={{ maxWidth: "320px" }}
              />

              <button type="button" onClick={saveVendorOrderNumber}>
                Save Vendor PO
              </button>
            </div>
          </div>

          <div className="tableCard">
            <table>
              <thead>
                <tr>
                  <th>Garment</th>
                  <th>Style</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th>Qty Ordered</th>
                  <th>Qty Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {poItems.length === 0 ? (
                  <tr>
                    <td colSpan="7">No items on this PO yet</td>
                  </tr>
                ) : (
                  poItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.garment || "-"}</td>
                      <td>{item.style || "-"}</td>
                      <td>{item.color || "-"}</td>
                      <td>{item.size || "-"}</td>
                      <td>{item.qty_ordered || 0}</td>
                      <td>{item.qty_received || 0}</td>
                      <td>{item.status || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseOrdersPage