const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

const { getSSPrice } = require("./services/ssService")
const productRoutes = require("./routes/products")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.use("/api", productRoutes)

app.get("/", (req, res) => {
  res.send("OFCL backend server is running")
})

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working"
  })
})

app.post("/api/vendor/ss", async (req, res) => {
  try {
    const { vendor, style, color, qty } = req.body

    const data = await getSSPrice({
      vendor,
      style,
      color,
      qty,
    })

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vendor data",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})