const axios = require("axios")

async function getSSPrice({ vendor, style, color, qty }) {
  const {
    SS_API_KEY,
    SS_ACCOUNT_NUMBER,
    SS_USERNAME,
    SS_PASSWORD,
    SS_BASE_URL,
  } = process.env

  const hasRealCredentials =
    SS_API_KEY || SS_ACCOUNT_NUMBER || SS_USERNAME || SS_PASSWORD || SS_BASE_URL

  if (!hasRealCredentials) {
    const mockPrice = 2.45

    const safeQty = Number(qty) || 0

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
    // 🔒 Placeholder for real S&S API request
    // Once you get real docs/credentials, we replace this block
    // with the actual endpoint + auth + response parsing.

    const response = await axios.get(`${SS_BASE_URL}`, {
      headers: {
        Authorization: `Bearer ${SS_API_KEY}`,
      },
      params: {
        account: SS_ACCOUNT_NUMBER,
        style,
        color,
        qty,
      },
      auth:
        SS_USERNAME && SS_PASSWORD
          ? {
              username: SS_USERNAME,
              password: SS_PASSWORD,
            }
          : undefined,
    })

    // ⚠️ This is placeholder parsing.
    // We will update it once we know the real S&S response shape.
    return {
      vendor: vendor || "S&S Activewear",
      product: style,
      color,
      sizes: ["S", "M", "L", "XL"],
      price: response.data?.price || 0,
      qty: qty || 0,
      total: (response.data?.price || 0) * Number(qty || 0),
      source: "live",
      raw: response.data,
    }
  } catch (error) {
    console.error("S&S API error:", error.message)

    throw new Error("Failed to fetch live S&S pricing")
  }
}

module.exports = { getSSPrice }