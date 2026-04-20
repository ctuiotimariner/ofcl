const fs = require("fs")
const path = require("path")

function readProductsFile(filePath) {
  const file = fs.readFileSync(filePath, "utf-8")

  const lines = file.split("\n").filter(line => line.trim() !== "")

  const headers = lines[0].split(",")

  const data = lines.slice(1).map(line => {
    const values = line.split(",")

    const obj = {}
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || ""
    })

    return obj
  })

  return data
}

function getPriceFromCSV(style, color, qty) {
  const filePath = path.join(__dirname, "../data/products.csv")
  const products = readProductsFile(filePath)

  const safeStyle = String(style || "").trim().toLowerCase()
  const safeColor = String(color || "").trim().toLowerCase()

  const exactMatches = products.filter((p) => {
    const rowStyle = String(p.styleName || "").trim().toLowerCase()
    const rowColor = String(p.colorName || "").trim().toLowerCase()

    return rowStyle === safeStyle && rowColor === safeColor
  })

  console.log("EXACT MATCHES FOUND:", exactMatches.length)
  console.log("EXACT MATCH SAMPLE:", exactMatches.slice(0, 5))

  let chosenRow = null

  if (exactMatches.length > 0) {
    chosenRow = exactMatches.find((row) => Number(row.piecePrice) > 0) || null
  } else {
    const fallbackMatches = products.filter((p) => {
      const rowStyle = String(p.styleName || "").trim().toLowerCase()
      const rowColor = String(p.colorName || "").trim().toLowerCase()

      return rowStyle.includes(safeStyle) && rowColor.includes(safeColor)
    })

    console.log("FALLBACK MATCHES FOUND:", fallbackMatches.length)
    console.log("FALLBACK MATCH SAMPLE:", fallbackMatches.slice(0, 5))

    if (fallbackMatches.length > 0) {
      chosenRow =
        fallbackMatches.find((row) => Number(row.piecePrice) > 0) || null
    }
  }

  console.log("CHOSEN CSV ROW:", chosenRow)

  const price = chosenRow ? Number(chosenRow.piecePrice || 0) : 0

  return {
    vendor: "S&S Activewear",
    product: style,
    color,
    price,
    qty,
    total: price * qty,
  }
}

module.exports = {
  readProductsFile,
  getPriceFromCSV,
}
