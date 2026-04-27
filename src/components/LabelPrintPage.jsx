import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { QRCodeCanvas } from "qrcode.react"
import Barcode from "react-barcode"

function getDepartment(order) {
  const firstMethod = order?.items?.[0]?.method || ""

  if (firstMethod === "DTF Printing") return "DTF"
  if (firstMethod === "Embroidery") return "EMBROIDERY"

  return firstMethod || "PRODUCTION"
}

function getTotalQty(order) {
  return (order?.items || []).reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  )
}

function LabelPrintPage({ orders, selectedOrder }) {
  const [poData, setPOData] = useState(null)

  const jobLabels = JSON.parse(localStorage.getItem("labelPreview") || "[]")
  const isJobMode = jobLabels.length > 0

  const order = orders.find(
    (o) => o.orderNumber?.toLowerCase() === selectedOrder?.toLowerCase()
  )

  useEffect(() => {
    async function fetchPO() {
      if (!selectedOrder) return

      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*")
        .eq("order_group", selectedOrder)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error("PO fetch error:", error)
        setPOData(null)
        return
      }

      setPOData(data)
    }

    fetchPO()
  }, [selectedOrder])

  useEffect(() => {
  if (isJobMode) return

  const timer = setTimeout(() => {
    window.print()

    setTimeout(() => {
      window.close()
    }, 500)
  }, 500)

  return () => clearTimeout(timer)
}, [isJobMode])

  if (!order && !isJobMode) {
  return <h2 style={{ padding: "20px" }}>No order found</h2>
}

  const department = getDepartment(order)
  const totalQty = getTotalQty(order)


if (isJobMode) {
  return (
    <>
    <button
        className="noPrint"
        onClick={() => window.print()}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "12px 18px",
          fontWeight: "bold",
        }}
      >
        Print All Labels
      </button>
    <style>{`

            html, body {
        margin: 0;
        padding: 0;
        background: #111;
        }

        .noPrint {
        display: block;
        }

        @media print {
        .noPrint {
            display: none;
        }
        }
        @page {
          size: 4in 6in;
          margin: 0;
        }

        .labelPage {
          width: 4in;
          height: 6in;
          padding: 0.18in;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          page-break-after: always;
          break-after: page;
        }
      `}</style>

      {jobLabels.map((job, i) => (
        <div key={i} className="labelPage printOnly">
          <div className="topSection">
            <div className="labelTop">
              <div className="brand">OFCL WORK ORDER</div>
              <div className="department">DTF</div>
            </div>

            <div className="orderNumber">{job.customer}</div>

            <div className="customerName">Aldridge</div>

            <div className="infoBlock">
              <div>
                <strong>Garment:</strong> {job.garment}
              </div>

              <div className="qtyLine">
                <strong>Qty:</strong> {job.qty}
              </div>

              <div style={{ marginTop: "10px", whiteSpace: "pre-line" }}>
                <strong>Ship To:</strong>
                <br />
                {job.shippingAddress}
              </div>
            </div>
          </div>

          <div className="bottomSection">
            <div className="qrWrap">
              <QRCodeCanvas value={job.customer + job.qty} size={88} />

              <div className="barcodeWrap">
                <Barcode
                    value={job.customer || "OFCL-JOB"}
                    width={1.2}
                    height={40}
                    fontSize={12}
                    margin={0}
                    displayValue={true}
                />
                </div>

              <div className="scanText">SCAN TO MOVE</div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
  return (
    
    <>
      <style>{`
        @page {
          size: 4in 6in;
          margin: 0;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 4in;
          height: 6in;
          background: white;
          font-family: Arial, sans-serif;
          color: black;
          overflow: hidden;
        }

        * {
          box-sizing: border-box;
        }

        .labelPage {
          width: 4in;
          height: 6in;
          padding: 0.18in;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          page-break-after: always;
          break-after: page;
        }

        .topSection {
          width: 100%;
        }

        .labelTop {
          text-align: center;
        }

        .brand {
          font-size: 20px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 8px;
        }

        .department {
          font-size: 15px;
          font-weight: 800;
          border: 2px solid black;
          display: inline-block;
          padding: 6px 16px;
          margin-bottom: 16px;
        }

        .orderNumber {
          font-size: 30px;
          letter-spacing: 1px;
          font-weight: 900;
          text-align: center;
          line-height: 1.1;
          margin-bottom: 10px;
          word-break: break-word;
          text-transform: uppercase;
        }

        .customerName {
          text-align: center;
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 14px;
        }

        .infoBlock {
          border-top: 2px solid black;
          padding-top: 12px;
          font-size: 15px;
          line-height: 1.45;
        }

        .qtyLine {
          margin-top: 12px;
        }

        .bottomSection {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 10px;
          margin-top: 10px;
        }

        .qrWrap {
          width: 1.7in;
          border: 1px solid black;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .barcodeWrap {
          width: 100%;
          display: flex;
          justify-content: center;
          overflow: hidden;
        }

        .scanText {
          font-size: 11px;
          font-weight: 800;
          text-align: center;
          margin-top: 2px;
        }

        .dueBox {
          flex: 1;
          min-height: 0.95in;
          border: 2px solid black;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .dueLabel {
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .dueDate {
          font-size: 16px;
          font-weight: 900;
          line-height: 1.1;
          word-break: break-word;
        }

        @media print {
          html, body {
            width: 4in;
            height: 6in;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          body * {
            visibility: hidden;
          }

          .labelPage.printOnly,
          .labelPage.printOnly * {
            visibility: visible;
          }

          .labelPage.printOnly {
            position: fixed;
            top: 0;
            left: 0;
            width: 4in;
            height: 6in;
            background: white;
            z-index: 9999;
          }
        }
      `}</style>

      <div className="labelPage printOnly">
        <div className="topSection">
          <div className="labelTop">
            <div className="brand">OFCL WORK ORDER</div>
            <div className="department">{department}</div>
          </div>

          <div className="orderNumber">{order.orderNumber}</div>

          <div className="customerName">{order.customerName}</div>

          <div className="infoBlock">
            <div>
              <strong>Garment:</strong> {order.items?.[0]?.garment}
            </div>
            <div>
              <strong>Placement:</strong> {order.items?.[0]?.placement}
            </div>
            <div>
              <strong>Method:</strong> {order.items?.[0]?.method}
            </div>
            <div>
              <strong>Vendor:</strong> {poData?.vendor || order.vendor || "-"}
            </div>
            <div>
              <strong>PO:</strong> {poData?.vendor_order_number || "-"}
            </div>

            <div className="qtyLine">
              <strong>Qty:</strong> {totalQty}
            </div>
          </div>
        </div>

        <div className="bottomSection">
          <div className="qrWrap">
            <QRCodeCanvas value={order.orderNumber} size={88} />

            <div className="barcodeWrap">
              <Barcode
                value={order.orderNumber || "OFCL-ORDER"}
                width={1.6}
                height={34}
                fontSize={12}
                margin={0}
                displayValue={true}
              />
            </div>

            <div className="scanText">SCAN TO MOVE</div>
          </div>

          <div className="dueBox">
            <div className="dueLabel">DUE DATE</div>
            <div className="dueDate">{order.dueDate || "N/A"}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LabelPrintPage