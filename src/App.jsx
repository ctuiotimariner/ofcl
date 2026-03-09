import { useState, useEffect, useRef } from 'react'
import './App.css'
import RoleScreen from "./components/RoleScreen"
import Sidebar from "./components/Sidebar"
import InventoryPage from './components/InventoryPage'
import JobsPage from "./components/JobsPage"

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
  const [designName, setDesignName] = useState('')
  const [jobQty, setJobQty] = useState(0)
  const [sizes, setSizes] = useState('')
  const [placement, setPlacement] = useState('')
  const [method, setMethod] = useState('')
  const [status, setStatus] = useState('Email Received')
  const [dueDate, setDueDate] = useState('')
  const [orderGroup, setOrderGroup] = useState('')

  // ===== REFS =====
  const skuInputRef = useRef(null)

  // ===== DERIVED VALUES =====

  // Inventory search
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  )

  // Jobs search
const filteredJobs = jobs
  .filter((job) =>
    Object.values(job)
      .join(' ')
      .toLowerCase()
      .includes(jobSearch.toLowerCase())
  )
  .sort((a, b) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const aDue = a.dueDate ? new Date(a.dueDate) : null
    const bDue = b.dueDate ? new Date(b.dueDate) : null

    if (aDue) aDue.setHours(0, 0, 0, 0)
    if (bDue) bDue.setHours(0, 0, 0, 0)

    const aDone = a.status === 'Completed' || a.status === 'Shipped'
    const bDone = b.status === 'Completed' || b.status === 'Shipped'

    // Completed / shipped jobs go last
    if (aDone && !bDone) return 1
    if (!aDone && bDone) return -1

    const aOverdue = aDue && aDue < today && !aDone
    const bOverdue = bDue && bDue < today && !bDone

    // Overdue jobs go first
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1

    const aDueSoon =
      aDue &&
      aDue >= today &&
      (aDue - today) / (1000 * 60 * 60 * 24) <= 2 &&
      !aDone

    const bDueSoon =
      bDue &&
      bDue >= today &&
      (bDue - today) / (1000 * 60 * 60 * 24) <= 2 &&
      !bDone

    // Due soon jobs go next
    if (aDueSoon && !bDueSoon) return -1
    if (!aDueSoon && bDueSoon) return 1

    // Then sort by order group
    if (a.orderGroup && b.orderGroup) {
      const groupCompare = a.orderGroup.localeCompare(b.orderGroup)
      if (groupCompare !== 0) return groupCompare
    }

    return 0
  })

const groupedJobs = {}

filteredJobs.forEach((job) => {
  const group = job.orderGroup || 'No Group'

  if (!groupedJobs[group]) {
    groupedJobs[group] = []
  }

  groupedJobs[group].push(job)
})

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

// ===== ORDER PROGRESS =====
  const orderProgress = {}

  jobs.forEach((job) => {
    const group = job.orderGroup || "No Group"

    if (!orderProgress[group]) {
      orderProgress[group] = { total: 0, completed: 0 }
    }

    orderProgress[group].total++

    if (job.status === "Completed" || job.status === "Shipped") {
      orderProgress[group].completed++
    }
  })

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
    orderGroup,
    client,
    garment,
    designName,
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
    setOrderGroup('')
    setDesignName('')
  }

  function handleStatusChange(jobId, newStatus) {
  setJobs(
    jobs.map((job) => {
      if (job.id !== jobId) return job
      return { ...job, status: newStatus }
    })
  )
}

  function handleDeleteJob(jobId) {
  const confirmed = window.confirm('Delete this job?')

  if (!confirmed) return

  setJobs(jobs.filter((job) => job.id !== jobId))
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
  return <RoleScreen setRole={setRole} />
}

  // ===== MAIN DASHBOARD UI =====

  return (

    <div className="appLayout">

      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        setRole={setRole}
      />

      <main className="mainContent">
        <h1>OFCL Operations Dashboard</h1>
        <p>Role: {role}</p>

      {currentPage === 'dashboard' && (
  <>
    <h2>Dashboard</h2>

    <div className="stats">

      <div className="card">
        <div className="label">Active Jobs</div>
        <div className="value">{jobs.length}</div>
      </div>

      <div className="card">
        <div className="label">Printing</div>
        <div className="value">
          {jobs.filter(job => job.status === "Printing").length}
        </div>
      </div>

      <div className="card">
        <div className="label">Low Stock</div>
        <div className="value">{lowStockCount}</div>
      </div>

    </div>

  </>
)}
        
{/* ===== INVENTORY PAGE ===== */}

{currentPage === 'inventory' && (
  <InventoryPage
    totalSkus={totalSkus}
    totalUnits={totalUnits}
    lowStockCount={lowStockCount}
    handleAddItem={handleAddItem}
    skuInputRef={skuInputRef}
    sku={sku}
    setSku={setSku}
    name={name}
    setName={setName}
    size={size}
    setSize={setSize}
    qty={qty}
    setQty={setQty}
    search={search}
    setSearch={setSearch}
    filteredInventory={filteredInventory}
    handleChangeQty={handleChangeQty}
    handleDeleteItem={handleDeleteItem}
  />
)}

{/* ===== JOBS PAGE ===== */}
  
{currentPage === 'jobs' && (
  <JobsPage
    emailCount={emailCount}
    blanksCount={blanksCount}
    printingCount={printingCount}
    completedCount={completedCount}
    shippedCount={shippedCount}
    handleAddJob={handleAddJob}
    orderGroup={orderGroup}
    setOrderGroup={setOrderGroup}
    client={client}
    setClient={setClient}
    garment={garment}
    setGarment={setGarment}
    designName={designName}
    setDesignName={setDesignName}
    jobQty={jobQty}
    setJobQty={setJobQty}
    dueDate={dueDate}
    setDueDate={setDueDate}
    sizes={sizes}
    setSizes={setSizes}
    placement={placement}
    setPlacement={setPlacement}
    method={method}
    setMethod={setMethod}
    status={status}
    setStatus={setStatus}
    jobSearch={jobSearch}
    setJobSearch={setJobSearch}
    filteredJobs={filteredJobs}
    groupedJobs={groupedJobs}
    handleStatusChange={handleStatusChange}
    handleDeleteJob={handleDeleteJob}
    getJobStatusClass={getJobStatusClass}
    getDueDateClass={getDueDateClass}
    orderProgress={orderProgress}
  />
)}

        {currentPage === 'vendors' && <h2>Vendors page coming later</h2>}
        {currentPage === 'settings' && <h2>Settings page coming later</h2>}
      </main>
    </div>
  )
}

export default App