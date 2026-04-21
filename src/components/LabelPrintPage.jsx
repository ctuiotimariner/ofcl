import { useEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"

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
  const order = orders.find(
    (o) => o.orderNumber?.toLowerCase() === selectedOrder?.toLowerCase()
  )

  useEffect(() => {
    setTimeout(() => {
      window.print()
    }, 500)
  }, [])

  if (!order) {
    return <h2 style={{ padding: "20px" }}>No order found</h2>
  }

  const department = getDepartment(order)
  const totalQty = getTotalQty(order)

  return (
    <>
      <style>{`
        @page {
          size: 4in 6in;
          margin: 0;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: white;
          color: black;
        }

        .labelPage {
          width: 4in;
          height: 6in;
          box-sizing: border-box;
          padding: 0.2in;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: white;
        }

        .labelTop {
          text-align: center;
        }

        .brand {
          font-size: 20px;
          font-weight: 800;
        }

        .department {
          font-size: 16px;
          font-weight: 700;
          border: 2px solid black;
          display: inline-block;
          padding: 4px 10px;
          margin-top: 6px;
        }

        .orderNumber {
          font-size: 26px;
          font-weight: 800;
          text-align: center;
          margin: 10px 0;
        }

        .infoBlock {
        font-size: 16px;
        line-height: 1.4;
        margin-top: 12px;
        border-top: 2px solid black;
        padding-top: 10px;
        }

        .bottomSection {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .qrWrap {
          border: 1px solid black;
          padding: 6px;
        }

        .scanText {
          font-size: 12px;
          text-align: center;
          margin-top: 4px;
          font-weight: 600;
        }

        .dueBox {
          border: 2px solid black;
          padding: 8px;
          text-align: center;
          min-width: 120px;
        }

        .dueLabel {
          font-size: 14px;
          font-weight: 700;
        }

        .dueDate {
          font-size: 18px;
          font-weight: 800;
          margin-top: 6px;
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
            z-index: 9999;
            background: white;
          }
        }
      `}</style>

      <div className="labelPage printOnly">
        <div>
          <div className="labelTop">
            <div className="brand">OFCL WORK ORDER</div>
            <div className="department">{department}</div>
          </div>

         <div className="orderNumber">{order.orderNumber}</div>

            <div style={{ textAlign: "center", fontSize: "18px", marginTop: "6px" }}>
            {order.customerName}
            </div>

          <div className="infoBlock">
            <div><strong>Garment:</strong> {order.items?.[0]?.garment}</div>
            <div><strong>Placement:</strong> {order.items?.[0]?.placement}</div>
            <div><strong>Method:</strong> {order.items?.[0]?.method}</div>

            <div style={{ marginTop: "10px" }}>
                <strong>Qty:</strong> {totalQty}
            </div>
            </div>
        </div>

        <div className="bottomSection">
          <div className="qrWrap">
            <QRCodeCanvas value={order.orderNumber} size={100} />
            <div className="scanText">SCAN TO MOVE</div>
          </div>

          <div className="dueBox">
            <div className="dueLabel">DUE DATE</div>
            <div className="dueDate">{order.dueDate}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LabelPrintPage