import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("inventory")
    return saved ? JSON.parse(saved) : [
  { sku: "HD-BLK-L", name: "Black Hoodie", size: "Large", qty: 10 },
  { sku: "TEE-WHT-M", name: "White Tee", size: "Medium", qty: 25 },
  { sku: "HAT-RED-OS", name: "Red Hat", size: "One Size", qty: 5 }
]
  })

  const [name, setName] = useState("")
  const [size, setSize] = useState("")
  const [qty, setQty] = useState(0)
  const [sku, setSku] = useState("")
  const [search, setSearch] = useState("")

  const skuInputRef = useRef(null)
  
  const filteredInventory = inventory.filter((item) =>
  item.name.toLowerCase().includes(search.toLowerCase()) ||
  item.sku.toLowerCase().includes(search.toLowerCase())
)


  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory))
  }, [inventory])

  function handleAddItem() {
  const qtyNumber = Number(qty)

  // ✅ Validation
  if (!sku || !name || !size || qtyNumber <= 0) return

  // ✅ If SKU already exists, update qty instead of adding a new row
  const existingIndex = inventory.findIndex((item) => item.sku === sku)

  if (existingIndex !== -1) {
    setInventory(
      inventory.map((item, index) => {
        if (index !== existingIndex) return item
        return { ...item, qty: item.qty + qtyNumber }
      })
    )
  } else {
    const newItem = { sku, name, size, qty: qtyNumber }
    setInventory([...inventory, newItem])
  }

  // ✅ Reset form
  setSku("")
  setName("")
  setSize("")
  setQty(0)

  setTimeout(() => {
  skuInputRef.current?.focus()
}, 0)
}

  function handleDeleteItem(indexToDelete) {
  setInventory(inventory.filter((_, index) => index !== indexToDelete))
  }

  function handleChangeQty(indexToUpdate, delta) {
  setInventory(
    inventory.map((item, index) => {
      if (index !== indexToUpdate) return item
      const nextQty = Math.max(0, item.qty + delta)
      return { ...item, qty: nextQty }
    })
  )
  }

  return (
    <div>
      <h1>OFCL Inventory Dashboard</h1>

      <form
      onSubmit={(e) => {
        e.preventDefault()
        handleAddItem()
      }}
    >
      <input
        ref={skuInputRef}
        placeholder="SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
      />

      <input
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Size"
        value={size}
        onChange={(e) => setSize(e.target.value)}
      />

      <input
        type="number"
        placeholder="Qty"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
      />

      <button type="submit">Add Item</button>
    </form>

      <input
  placeholder="Search inventory..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

      <table>
  <thead>
    <tr>
      <th>SKU</th>
      <th>Item</th>
      <th>Size</th>
      <th>Qty</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {filteredInventory.map((item, index) => (
      <tr key={index}>
        <td>{item.sku}</td>
        <td>{item.name}</td>
        <td>{item.size}</td>
        <td>{item.qty}</td>
        <td>
          <button type="button" onClick={() => handleChangeQty(index, -1)}>-</button>
          <button type="button" onClick={() => handleChangeQty(index, 1)}>+</button>
          <button type="button" onClick={() => handleDeleteItem(index)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  )
}

export default App