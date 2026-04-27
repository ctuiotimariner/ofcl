import { useState } from "react"
import * as XLSX from "xlsx"
import { supabase } from "../lib/supabase"

function ImportExcelPage() {
  const [rows, setRows] = useState([])
  const [parsedJobs, setParsedJobs] = useState([])
  const [fileName, setFileName] = useState("")
  const [showLabelPreview, setShowLabelPreview] = useState(false)

  function parseRowsToJobs(rows) {
    return rows
      .map((row, index) => {
        console.log("ROW", index, row)

        const nameKey = Object.keys(row).find((key) =>
          key.toLowerCase().includes("job name")
        )

        const addressKey = Object.keys(row).find((key) =>
          key.toLowerCase().includes("shipping address")
        )

        const sizes = {
          XS: Number(row["XS"] || 0),
          S: Number(row["S"] || row["Small"] || 0),
          M: Number(row["M"] || row["Med"] || 0),
          L: Number(row["L"] || row["Large"] || 0),
          XL: Number(row["XL"] || row["X-Large"] || 0),
          "2XL": Number(row["2XL"] || row["2X"] || 0),
          "3XL": Number(row["3XL"] || row["3X"] || 0),
          "4XL": Number(row["4XL"] || row["4X"] || 0),
          "5XL": Number(row["5XL"] || row["5X"] || 0),
        }

        const totalQty = Object.values(sizes).reduce(
          (sum, val) => sum + Number(val || 0),
          0
        )

        const dropSite = nameKey
          ? String(row[nameKey]).trim()
          : "Unknown Drop Site"

        return {
          id: Date.now() + index,
          customer: "Aldridge",
          dropSite,
          orderGroup: "Aldridge - Safety Week 2026",
          garment: "T-Shirt",
          qty: totalQty,
          sizes,
          shippingAddress: addressKey ? row[addressKey] : "",
          notes: row["NOTES"] || "",
          status: "Waiting for Blanks",
          method: "DTF Printing",
        }
      })
      .filter(
        (job) =>
          job.qty > 0 &&
          !String(job.dropSite || "").toLowerCase().includes("total")
      )
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setFileName(file.name)

    const reader = new FileReader()

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result)
      const workbook = XLSX.read(data, { type: "array" })

      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        range: 1,
      })

      console.log("JSON DATA LENGTH:", jsonData.length)
      console.log("JSON DATA:", jsonData)

      setRows(jsonData)

      console.log("FIRST ROW:", jsonData[0])
      console.log("COLUMN NAMES:", Object.keys(jsonData[0] || {}))

      setParsedJobs(parseRowsToJobs(jsonData))
    }

    reader.readAsArrayBuffer(file)
  }

  async function createAldridgeOrder() {
    if (!parsedJobs.length) return

    const orderGroup = "ALDRIDGE-" + Date.now()

    const { error: orderError } = await supabase.from("orders").insert([
      {
        orderNumber: orderGroup,
        customerName: "Aldridge",
        orderType: "Drop Ship",
        status: "Pending",
        items: parsedJobs,
      },
    ])

    if (orderError) {
      console.error("Order error:", orderError)
      alert("Failed to create order")
      return
    }

    const jobsToInsert = parsedJobs.map((job) => ({
      orderGroup,
      client: job.customer,
      dropSite: job.dropSite,
      garment: job.garment,
      qty: job.qty,
      sizes: job.sizes,
      shippingAddress: job.shippingAddress,
      placement: "Front",
      designName: "Safety Week 2026",
      method: job.method,
      status: "Waiting for Blanks",
      dueDate: null,
      vendor: "S&S Activewear",
      delivered: false,
    }))

    const { error: jobsError } = await supabase
      .from("jobs")
      .insert(jobsToInsert)

    if (jobsError) {
      console.error("Jobs error:", jobsError)
      alert("Jobs failed")
      return
    }

    alert("SUCCESS! Aldridge order created 🔥")
    setShowLabelPreview(true)
  }

  function getImportSummary() {
    const totalJobs = parsedJobs.length

    const totalPieces = parsedJobs.reduce(
      (sum, job) => sum + Number(job.qty || 0),
      0
    )

    const missingAddresses = parsedJobs.filter(
      (job) => !job.shippingAddress
    ).length

    return {
      totalJobs,
      totalPieces,
      missingAddresses,
    }
  }

  const summary = getImportSummary()

async function printAllLabels() {
  const labelHtmlArray = await Promise.all(
    parsedJobs.map(async (job, index) => {
      const scanCode = `${job.orderGroup}-${index + 1}`

      // QR
      const QRCode = (await import("qrcode")).default
      const qrDataUrl = await QRCode.toDataURL(scanCode, {
        width: 90,
        margin: 1,
      })

      // Barcode
      const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      )
      const JsBarcode = (await import("jsbarcode")).default

      JsBarcode(svg, scanCode, {
        format: "CODE128",
        width: 1.4,
        height: 38,
        displayValue: true,
        fontSize: 10,
        margin: 0,
      })

      const barcodeSvg = svg.outerHTML

      const sizesHtml = Object.entries(job.sizes || {})
        .filter(([size, qty]) => Number(qty) > 0)
        .map(([size, qty]) => `<p style="margin:2px 0;">${size}: ${qty}</p>`)
        .join("")

      return `
        <div class="labelPage">
          <h3>OFCL WORK ORDER</h3>

          <p><strong>Order:</strong> ${job.orderGroup}</p>
          <p><strong>Drop Site:</strong> ${job.dropSite}</p>
          <p><strong>Total Qty:</strong> ${job.qty}</p>

          <div>
            <strong>Sizes:</strong>
            ${sizesHtml}
          </div>

          <p style="margin-top:8px;"><strong>Garment:</strong> ${job.garment}</p>

          <p style="margin-top:8px;"><strong>Ship To:</strong></p>
          <p style="white-space:pre-line;">${job.shippingAddress}</p>

          <div style="position:absolute; bottom:0.2in; left:0.2in; right:0.2in; display:flex; justify-content:space-between;">
            <img src="${qrDataUrl}" style="width:0.8in; height:0.8in;" />
            <div>${barcodeSvg}</div>
          </div>
        </div>
      `
    })
  )

  const printWindow = window.open("", "_blank")

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Labels</title>
        <style>
          @page {
            size: 4in 6in;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .labelPage {
            width: 4in;
            height: 6in;
            padding: 0.18in;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            page-break-after: always;
            position: relative;
          }

          p {
            margin: 3px 0;
            font-size: 13px;
          }

          h3 {
            margin: 0 0 6px 0;
          }
        </style>
      </head>

      <body>
        ${labelHtmlArray.join("")}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

  return (
    <div className="sectionCard">
      <h1>Excel Import</h1>
      <p>Upload the Aldridge drop ship spreadsheet.</p>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
      />

      {fileName && (
        <p>
          <strong>File:</strong> {fileName}
        </p>
      )}

      {parsedJobs.length > 0 && (
        <>
          <h2>Parsed Jobs Preview</h2>

          <div className="sectionCard">
            <h3>Import Summary</h3>

            <p>
              <strong>Total Jobs:</strong> {summary.totalJobs}
            </p>

            <p>
              <strong>Total Pieces:</strong> {summary.totalPieces}
            </p>

            <p>
              <strong>Missing Addresses:</strong> {summary.missingAddresses}
            </p>

            {summary.missingAddresses > 0 ? (
              <p style={{ color: "red" }}>⚠️ Missing addresses detected</p>
            ) : (
              <p style={{ color: "#00ff99" }}>✅ All jobs look good</p>
            )}
          </div>

          <div className="tableCard">
            <table>
              <thead>
                <tr>
                  <th>Drop Site</th>
                  <th>Qty</th>
                  <th>Shipping Address</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {parsedJobs.map((job, i) => (
                  <tr key={i}>
                    <td>{job.dropSite}</td>
                    <td>{job.qty}</td>
                    <td>{job.shippingAddress}</td>
                    <td>{job.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={createAldridgeOrder}>
            Create Aldridge Order
          </button>

          <button onClick={() => setShowLabelPreview(true)}>
            Preview Labels
          </button>
        </>
      )}

      {showLabelPreview && (
        <div className="labelModal">
          <div className="labelModalTop noPrint">
            <button onClick={() => setShowLabelPreview(false)}>
              Close Preview
            </button>

            <button onClick={printAllLabels}>
            Print All Labels
            </button>
          </div>

          <div className="labelPreviewArea">
            {parsedJobs.map((job, i) => (
             <div key={i} className="labelPage">
                <h3>OFCL WORK ORDER</h3>

                <p>
                  <strong>Order:</strong> {job.orderGroup}
                </p>

                <p>
                  <strong>Drop Site:</strong> {job.dropSite}
                </p>

                <p>
                  <strong>Total Qty:</strong> {job.qty}
                </p>

                <div>
                  <strong>Sizes:</strong>
                  {Object.entries(job.sizes || {})
                    .filter(([size, qty]) => Number(qty) > 0)
                    .map(([size, qty]) => (
                      <p key={size} style={{ margin: "2px 0" }}>
                        {size}: {qty}
                      </p>
                    ))}
                </div>

                <p style={{ marginTop: "8px" }}>
                  <strong>Garment:</strong> {job.garment}
                </p>

                <p style={{ marginTop: "8px" }}>
                  <strong>Ship To:</strong>
                </p>

                <p style={{ whiteSpace: "pre-line" }}>
                  {job.shippingAddress}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImportExcelPage