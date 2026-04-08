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

  const match = products.find(p =>
    p.styleName?.toLowerCase().includes(style?.toLowerCase()) &&
    p.colorName?.toLowerCase().includes(color?.toLowerCase())
  )

  console.log("MATCH FOUND:", match)

  const price = match ? Number(match.piecePrice) : 0
console.log("FINAL PRICE:", price)
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
