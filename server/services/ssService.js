async function getSSPrice({ vendor, style, color, qty }) {
  const mockPrice = 2.45

  return {
    vendor: vendor || "S&S Activewear",
    product: style || "Gildan 5000",
    color: color || "Black",
    sizes: ["S", "M", "L", "XL"],
    price: mockPrice,
    qty: qty || 0,
    total: qty ? Number(qty) * mockPrice : mockPrice
  }
}

module.exports = { getSSPrice }