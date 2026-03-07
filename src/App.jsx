import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  // ===== STATE =====
  // Inventory data
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('inventory')

    return saved
      ? JSON.parse(saved)
      : [
          { sku: 'HD-BLK-L', name: 'Black Hoodie', size: 'Large', qty: 10 },
          { sku: 'TEE-WHT-M', name: 'White Tee', size: 'Medium', qty: 25 },
          { sku: 'HAT-RED-OS', name: 'Red Hat', size: 'One Size', qty: 5 },
        ]
  })

  // Form inputs
  const [name, setName] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(0)
  const [sku, setSku] = useState('')

  // Search input
  const [search, setSearch] = useState('')

  // Role selection
  const [role, setRole] = useState('')
  const [currentPage, setCurrentPage] = useState("inventory")

  // Jobs data
  const [jobs, setJobs] = useState([])

  const [client, setClient] = useState("")
  const [garment, setGarment] = useState("")
  const [jobQty, setJobQty] = useState(0)
  const [sizes, setSizes] = useState("")
  const [placement, setPlacement] = useState("")
  const [method, setMethod] = useState("")
  const [status, setStatus] = useState("Email Received")

  // ===== REFS =====
  // Used to move the cursor back to the SKU input after adding an item
  const skuInputRef = useRef(null)

  // ===== DERIVED VALUES =====
  // Search filter
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  )

  // Dashboard stats
  const totalSkus = inventory.length
  const totalUnits = inventory.reduce((sum, item) => sum + item.qty, 0)
  const lowStockCount = inventory.filter((item) => item.qty <= 5).length

  // ===== EFFECTS =====
  // Save inventory to localStorage whenever inventory changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory))
  }, [inventory])

  // ===== HANDLERS / ACTIONS =====
  function handleAddItem() {
    const qtyNumber = Number(qty)

    // Stop if required fields are missing or quantity is invalid
    if (!sku || !name || !size || qtyNumber <= 0) return

    // Check if this SKU already exists
    const existingIndex = inventory.findIndex((item) => item.sku === sku)

    if (existingIndex !== -1) {
      // If SKU exists, increase quantity instead of creating a duplicate row
      setInventory(
        inventory.map((item, index) => {
          if (index !== existingIndex) return item
          return { ...item, qty: item.qty + qtyNumber }
        })
      )
    } else {
      // If SKU does not exist, create a new inventory item
      const newItem = { sku, name, size, qty: qtyNumber }
      setInventory([...inventory, newItem])
    }

    // Reset form fields
    setSku('')
    setName('')
    setSize('')
    setQty(0)

    // Move cursor back to SKU field
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

  function handleAddJob(e) {
  e.preventDefault()

  if (!client || !garment || jobQty <= 0) return

  const newJob = {
    client,
    garment,
    qty: jobQty,
    sizes,
    placement,
    method,
    status
  }

  setJobs([...jobs, newJob])

  // reset form
  setClient("")
  setGarment("")
  setJobQty(0)
  setSizes("")
  setPlacement("")
  setMethod("")
  setStatus("Email Received")
}

  // ===== ROLE SCREEN =====
  // If no role is selected yet, show the entry screen
  if (!role) {
    return (
      <div className="roleScreen">
        <div className="roleCard">
          <h1>Welcome to OFCL PRNT</h1>
          <p>Select your role to enter the dashboard</p>

          <div className="roleButtons">
            <button onClick={() => setRole('admin')}>Admin</button>
            <button onClick={() => setRole('employee')}>Employee</button>
          </div>
        </div>
      </div>
    )
  }

   // ===== MAIN DASHBOARD UI =====
  return (
    <div className="appLayout">
      <aside className="sidebar">
        <h2>OFCL</h2>

        <button type="button" className={currentPage === "inventory" ? "activeTab" : ""} onClick={() => setCurrentPage("inventory")}>
          Inventory
        </button>

        <button type="button" className={currentPage === "jobs" ? "activeTab" : ""} onClick={() => setCurrentPage("jobs")}>
          Jobs
        </button>

        <button type="button" className={currentPage === "vendors" ? "activeTab" : ""} onClick={() => setCurrentPage("vendors")}>
          Vendors
        </button>

        <button type="button" className={currentPage === "settings" ? "activeTab" : ""} onClick={() => setCurrentPage("settings")}>
          Settings
        </button>

        <button type="button" onClick={() => setRole('')}>
          Logout
        </button>
      </aside>

      <main className="mainContent">
        <h1>OFCL Operations Dashboard</h1>
        <p>Role: {role}</p>

        {currentPage === 'inventory' && (
          <>
            {/* Dashboard stats */}
            <div className="stats">
              <div className="card">
                <div className="label">Total SKUs</div>
                <div className="value">{totalSkus}</div>
              </div>

              <div className="card">
                <div className="label">Total Units</div>
                <div className="value">{totalUnits}</div>
              </div>

              <div className="card">
                <div className="label">Low Stock</div>
                <div className="value">{lowStockCount}</div>
              </div>
            </div>

            {/* Add inventory form */}
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

            {/* Search inventory */}
            <input
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Inventory table */}
            <div className="tableCard">
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
                    <tr
                      key={index}
                      className={item.qty <= 5 ? 'low-stock' : ''}
                    >
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.size}</td>
                      <td>{item.qty}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleChangeQty(index, -1)}
                        >
                          -
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeQty(index, 1)}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {currentPage === "jobs" && (
  <>
    <h2>Jobs</h2>

    <form onSubmit={handleAddJob}>

      <input
        placeholder="Client"
        value={client}
        onChange={(e) => setClient(e.target.value)}
      />

      <input
        placeholder="Garment"
        value={garment}
        onChange={(e) => setGarment(e.target.value)}
      />

      <input
        type="number"
        placeholder="Qty"
        value={jobQty}
        onChange={(e) => setJobQty(e.target.value)}
      />

      <input
        placeholder="Sizes / Notes"
        value={sizes}
        onChange={(e) => setSizes(e.target.value)}
      />

      <input
        placeholder="Placement"
        value={placement}
        onChange={(e) => setPlacement(e.target.value)}
      />

      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        <option value="">Print Method</option>
        <option>Embroidery</option>
        <option>Heat Transfer</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option>Email Received</option>
        <option>Waiting for Blanks</option>
        <option>Printing</option>
        <option>Completed</option>
        <option>Shipped</option>
      </select>

      <button type="submit">Add Job</button>

    </form>

    <div className="tableCard">
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Garment</th>
            <th>Qty</th>
            <th>Sizes</th>
            <th>Placement</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job, index) => (
            <tr key={index}>
              <td>{job.client}</td>
              <td>{job.garment}</td>
              <td>{job.qty}</td>
              <td>{job.sizes}</td>
              <td>{job.placement}</td>
              <td>{job.method}</td>
              <td>{job.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)}
        {currentPage === 'vendors' && <h2>Vendors page coming later</h2>}
        {currentPage === 'settings' && <h2>Settings page coming later</h2>}
      </main>
    </div>
  )
}

export default App