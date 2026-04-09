const express = require("express")
const router = express.Router()
const path = require("path")
const { readProductsFile } = require("../utils/readExcel")

const filePath = path.join(__dirname, "../data/products.csv")

router.get("/products", (req, res) => {
  try {
    const data = readProductsFile(filePath)
    res.json(data)
  } catch (error) {
    console.error("PRODUCT ERROR:", error)
    res.status(500).json({ error: "Failed to load products" })
  }
})

router.get("/products/search", (req, res) => {
  try {
    const { style, color } = req.query

    const data = readProductsFile(filePath)

    let filtered = data

    if (style) {
      filtered = filtered.filter(
        (item) => String(item.styleName).toLowerCase() === String(style).toLowerCase()
      )
    }

    if (color) {
      filtered = filtered.filter(
        (item) => String(item.colorName).toLowerCase().includes(String(color).toLowerCase())
      )
    }

    res.json(filtered.slice(0, 200))
  } catch (error) {
    console.error("PRODUCT SEARCH ERROR:", error)
    res.status(500).json({ error: "Failed to search products" })
  }
})

module.exports = router