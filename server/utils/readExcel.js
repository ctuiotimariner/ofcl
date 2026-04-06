const fs = require("fs")

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

  console.log("ROWS FOUND:", data.length)
  console.log("FIRST ROW:", data[0])

  return data
}

module.exports = { readProductsFile }