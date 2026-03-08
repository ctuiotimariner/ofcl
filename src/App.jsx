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

  // Inventory form inputs
  const [name, setName] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(0)
  const [sku, setSku] = useState('')

  // Inventory search
  const [search, setSearch] = useState('')

  // App navigation / role
  const [role, setRole] = useState('')
  const [currentPage, setCurrentPage] = useState('inventory')

  // Jobs data
  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem('jobs')
    return savedJobs ? JSON.parse(savedJobs) : []
  })

  // Job search
  const [jobSearch, setJobSearch] = useState('')

  // Job form inputs
  const [client, setClient] = useState('')
  const [garment, setGarment] = useState('')
  const [jobQty, setJobQty] = useState(0)
  const [sizes, setSizes] = useState('')
  const [placement, setPlacement] = useState('')
  const [method, setMethod] = useState('')
  const [status, setStatus] = useState('Email Received')
  const [dueDate, setDueDate] = useState('')

  // ===== REFS =====
  const skuInputRef = useRef(null)

  // ===== DERIVED VALUES =====

  // Inventory search
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  )

  // Jobs search
  const filteredJobs = jobs.filter((job) =>
    Object.values(job)
      .join(' ')
      .toLowerCase()
      .includes(jobSearch.toLowerCase())
  )

  // Inventory stats
  const totalSkus = inventory.length
  const totalUnits = inventory.reduce((sum, item) => sum + item.qty, 0)
  const lowStockCount = inventory.filter((item) => item.qty <= 5).length

  // Jobs production counters
  const emailCount = jobs.filter((job) => job.status === 'Email Received').length
  const blanksCount = jobs.filter((job) => job.status === 'Waiting for Blanks').length
  const printingCount = jobs.filter((job) => job.status === 'Printing').length
  const completedCount = jobs.filter((job) => job.status === 'Completed').length
  const shippedCount = jobs.filter((job) => job.status === 'Shipped').length

  // ===== EFFECTS =====

  // Save inventory whenever it changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory))
  }, [inventory])

  // Save jobs whenever they change
  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs))
  }, [jobs])

  // ===== INVENTORY ACTIONS =====

  function handleAddItem() {
    const qtyNumber = Number(qty)

    if (!sku || !name || !size || qtyNumber <= 0) return

    const existingIndex = inventory.findIndex((item) => item.sku === sku)

    if (existingIndex !== -1) {
      setInventory(
        inventory.map((item, index) => {
          if (index !== existingIndex) return item
          return { ...item, qty: item.qty + qtyNumber }
        })
      )
    } else {
      const newItem = {
        sku,
        name,
        size,
        qty: qtyNumber,
      }

      setInventory([...inventory, newItem])
    }

    // Reset form
    setSku('')
    setName('')
    setSize('')
    setQty(0)

    // Return cursor to SKU field
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

  // ===== JOB ACTIONS =====

  function handleAddJob(e) {
    e.preventDefault()

    if (!client || !garment || Number(jobQty) <= 0) return

    const newJob = {
      id: Date.now(),
      client,
      garment,
      qty: Number(jobQty),
      sizes,
      placement,
      method,
      status,
      dueDate,
    }

    setJobs([...jobs, newJob])

    // Reset form
    setClient('')
    setGarment('')
    setJobQty(0)
    setSizes('')
    setPlacement('')
    setMethod('')
    setStatus('Email Received')
    setDueDate('')
  }

  function handleStatusChange(indexToUpdate, newStatus) {
    setJobs(
      jobs.map((job, index) => {
        if (index !== indexToUpdate) return job
        return { ...job, status: newStatus }
      })
    )
  }

  function handleDeleteJob(indexToDelete) {
    const confirmed = window.confirm('Delete this job?')

    if (!confirmed) return

    setJobs(jobs.filter((_, index) => index !== indexToDelete))
  }

  // ===== JOB STYLE HELPERS =====

  function getJobStatusClass(status) {
    switch (status) {
      case 'Email Received':
        return 'job-email'
      case 'Waiting for Blanks':
        return 'job-blanks'
      case 'Printing':
        return 'job-printing'
      case 'Completed':
        return 'job-completed'
      case 'Shipped':
        return 'job-shipped'
      default:
        return ''
    }
  }

  function getDueDateClass(job) {
    if (!job.dueDate) return ''

    // Ignore due-date warnings once job is completed or shipped
    if (job.status === 'Completed' || job.status === 'Shipped') {
      return ''
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(job.dueDate)
    due.setHours(0, 0, 0, 0)

    const diffTime = due - today
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays < 0) return 'job-overdue'
    if (diffDays <= 2) return 'job-due-soon'

    return ''
  }

  // ===== ROLE SCREEN =====

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

        <button
          type="button"
          className={currentPage === 'inventory' ? 'activeTab' : ''}
          onClick={() => setCurrentPage('inventory')}
        >
          Inventory
        </button>

        <button
          type="button"
          className={currentPage === 'jobs' ? 'activeTab' : ''}
          onClick={() => setCurrentPage('jobs')}
        >
          Jobs
        </button>

        <button
          type="button"
          className={currentPage === 'vendors' ? 'activeTab' : ''}
          onClick={() => setCurrentPage('vendors')}
        >
          Vendors
        </button>

        <button
          type="button"
          className={currentPage === 'settings' ? 'activeTab' : ''}
          onClick={() => setCurrentPage('settings')}
        >
          Settings
        </button>

        <button type="button" onClick={() => setRole('')}>
          Logout
        </button>
      </aside>

      <main className="mainContent">
        <h1>OFCL Operations Dashboard</h1>
        <p>Role: {role}</p>

        {/* ===== INVENTORY PAGE ===== */}
        {currentPage === 'inventory' && (
          <>
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
                    <tr key={index} className={item.qty <= 5 ? 'low-stock' : ''}>
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

        {/* ===== JOBS PAGE ===== */}
        {currentPage === 'jobs' && (
          <>
            <h2>Jobs</h2>

            <div className="productionBoard">
              <div className="stageCard email">
                <div className="stageTitle">Email Received</div>
                <div className="stageCount">{emailCount}</div>
              </div>

              <div className="stageCard blanks">
                <div className="stageTitle">Waiting for Blanks</div>
                <div className="stageCount">{blanksCount}</div>
              </div>

              <div className="stageCard printing">
                <div className="stageTitle">Printing</div>
                <div className="stageCount">{printingCount}</div>
              </div>

              <div className="stageCard completed">
                <div className="stageTitle">Completed</div>
                <div className="stageCount">{completedCount}</div>
              </div>

              <div className="stageCard shipped">
                <div className="stageTitle">Shipped</div>
                <div className="stageCount">{shippedCount}</div>
              </div>
            </div>

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
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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

            <input
              placeholder="Search jobs..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
            />

            <div className="tableCard">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Garment</th>
                    <th>Qty</th>
                    <th>Due</th>
                    <th>Sizes</th>
                    <th>Placement</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredJobs.map((job, index) => (
                    <tr
                      key={index}
                      className={`${getJobStatusClass(job.status)} ${getDueDateClass(job)}`}
                    >
                      <td>#{String(job.id).slice(-4)}</td>
                      <td>{job.client}</td>
                      <td>{job.garment}</td>
                      <td>{job.qty}</td>
                      <td>{job.dueDate}</td>
                      <td>{job.sizes}</td>
                      <td>{job.placement}</td>
                      <td>{job.method}</td>
                      <td>
                        <select
                          value={job.status}
                          onChange={(e) =>
                            handleStatusChange(index, e.target.value)
                          }
                        >
                          <option>Email Received</option>
                          <option>Waiting for Blanks</option>
                          <option>Printing</option>
                          <option>Completed</option>
                          <option>Shipped</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(index)}
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

        {currentPage === 'vendors' && <h2>Vendors page coming later</h2>}
        {currentPage === 'settings' && <h2>Settings page coming later</h2>}
      </main>
    </div>
  )
}

export default App