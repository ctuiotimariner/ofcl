import { useState, useEffect } from 'react'
import './App.css'

function App() {

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("inventory")
    return saved ? JSON.parse(saved) : [
      { name: "Black Hoodie", size: "Large", qty: 10 },
      { name: "White Tee", size: "Medium", qty: 25 },
      { name: "Red Hat", size: "One Size", qty: 5 }
    ]
  })

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory))
  }, [inventory])

  function handleAddItem() {
    const newItem = { name: "New Item", size: "N/A", qty: 1 }
    setInventory([...inventory, newItem])
  }

  return (
    <div>
      <h1>OFCL Inventory Dashboard</h1>
      <button onClick={handleAddItem}>Add Item</button>

      <ul>
        {inventory.map((item, index) => (
          <li key={index}>
            {item.name} - {item.size} - Qty: {item.qty}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App