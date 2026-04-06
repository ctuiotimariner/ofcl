const express = require("express")
const router = express.Router()
const path = require("path")
const { readProductsFile } = require("../utils/readExcel")

router.get("/products", (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/products.csv")
    console.log("READING FILE:", filePath)

    const data = readProductsFile(filePath)

    res.json(data)
  } catch (error) {
    console.error("PRODUCT ERROR FULL:", error)
    res.status(500).json({
      error: "Failed to load products",
      details: error.message,
    })
  }
})

module.exports = router