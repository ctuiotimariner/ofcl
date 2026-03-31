const axios = require("axios")

async function getSSPrice({ vendor, style, color, qty }) {
  const hasRealCredentials =
    process.env.SS_ACCOUNT_NUMBER && process.env.SS_API_KEY

  const safeQty = Number(qty) || 0

  if (!hasRealCredentials) {
    const mockPrice = 2.45

    return {
      vendor: vendor || "S&S Activewear",
      product: style || "Gildan 5000",
      color: color || "Black",
      sizes: ["S", "M", "L", "XL"],
      price: mockPrice,
      qty: safeQty,
      total: safeQty * mockPrice,
      source: "mock",
    }
  }

  try {
    const response = await axios.get(
      `${process.env.SS_BASE_URL}/products`,
      {
        auth: {
          username: process.env.SS_ACCOUNT_NUMBER,
          password: process.env.SS_API_KEY,
        },
      }
    )

    return {
      source: "ss_api",
      data: response.data,
    }
  } catch (error) {
    console.error("S&S API error:", error.message)

    const mockPrice = 2.45

    return {
      vendor: vendor || "S&S Activewear",
      product: style || "Gildan 5000",
      color: color || "Black",
      sizes: ["S", "M", "L", "XL"],
      price: mockPrice,
      qty: safeQty,
      total: safeQty * mockPrice,
      source: "mock",
    }
  }
}

module.exports = { getSSPrice }