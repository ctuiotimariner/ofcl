const axios = require("axios")
const { getPriceFromCSV } = require("../utils/readExcel")

async function getSSPrice({ vendor, style, color, qty }) {
  const hasRealCredentials =
    process.env.SS_ACCOUNT_NUMBER && process.env.SS_API_KEY

  const safeQty = Number(qty) || 0

  // 🔹 NO API → use CSV
  if (!hasRealCredentials) {
    console.log("NO API → USING CSV")

    const csvData = await getPriceFromCSV(style, color, safeQty)

    return {
      ...csvData,
      source: "csv",
    }
  }

  try {
    // 🔹 TRY REAL API
    const response = await axios.get(
      `${process.env.SS_BASE_URL}/products`,
      {
        auth: {
          username: process.env.SS_ACCOUNT_NUMBER,
          password: process.env.SS_API_KEY,
        },
        params: { style, color },
      }
    )

    const price = response.data?.price || 0

    return {
      vendor: vendor || "S&S Activewear",
      product: style,
      color,
      price,
      qty: safeQty,
      total: safeQty * price,
      source: "api",
    }
  } catch (error) {
    console.error("API FAILED → USING CSV:", error.message)

    // 🔻 FALLBACK TO CSV
    const csvData = await getPriceFromCSV(style, color, safeQty)

    return {
      ...csvData,
      source: "csv",
    }
  }
}

module.exports = { getSSPrice }