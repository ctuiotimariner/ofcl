import { useState, useEffect, useRef } from 'react'
import './App.css'
import RoleScreen from './components/RoleScreen'
import Sidebar from './components/Sidebar'
import InventoryPage from './components/InventoryPage'
import JobsPage from './components/JobsPage'
import OrdersPage from './components/OrdersPage'
import JobTicketPage from './components/JobTicketPage'
import ReceivingPage from './components/ReceivingPage'
import ProductionBoard from './components/ProductionBoard'
import ScanStation from './components/ScanStation'
import DashboardMain from "./components/DashboardMain"
import { supabase } from './lib/supabase'








function App() {

  // Inventory
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

  const [name, setName] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(0)
  const [sku, setSku] = useState('')
  const [search, setSearch] = useState('')

  // App navigation / role
  const [role, setRole] = useState(() => {
  return localStorage.getItem('role') || ''
})
  const [currentPage, setCurrentPage] = useState(() => {
  return localStorage.getItem('currentPage') || 'dashboard'
})

const adminPages = [
  "dashboard",
  "orders",
  "jobs",
  "tickets",
  "receiving",
  "production",
  "scan",
  "inventory",
  "vendors",
  "settings"
]

const employeePages = [
  "dashboard",
  "jobs",
  "tickets",
  "receiving",
  "production",
  "scan"
]

const allowedPages = role === "admin" ? adminPages : employeePages


function handleSelectRole(selectedRole) {
  setRole(selectedRole)
  localStorage.setItem("role", selectedRole)
  setCurrentPage("dashboard")
}



  // Jobs / Orders
  const [jobs, setJobs] = useState([])

  const waitingForBlanksCount = jobs.filter(
  (job) => job.status === "Waiting for Blanks"
).length

        const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Overdue jobs (past due date)
      const overdueCount = jobs.filter((job) => {
        if (!job.dueDate) return false

        const due = new Date(job.dueDate)
        due.setHours(0, 0, 0, 0)

        return due < today
      }).length

      // Jobs due today
      const dueTodayJobs = jobs.filter((job) => {
        if (!job.dueDate) return false

        const due = new Date(job.dueDate)
        due.setHours(0, 0, 0, 0)

        return due.getTime() === today.getTime()
      })

      const dueTodayCount = dueTodayJobs.length

  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders')
    return savedOrders ? JSON.parse(savedOrders) : []
  })

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [jobSearch, setJobSearch] = useState('')

  // ===== REFS =====
  const skuInputRef = useRef(null)

  // ===== DERIVED VALUES =====

  // Inventory search
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  )

  // Job counts

  const blanksCount = jobs.filter(
    (job) => job.status === 'Waiting for Blanks'
  ).length

  const printingCount = jobs.filter(
    (job) => job.status === 'Printing'
  ).length

  const completedCount = jobs.filter(
    (job) => job.status === 'Completed'
  ).length

  const shippedCount = jobs.filter(
    (job) => job.status === 'Shipped'
  ).length

  // Filter + sort jobs
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

      if (aDone && !bDone) return 1
      if (!aDone && bDone) return -1

      const aOverdue = aDue && aDue < today && !aDone
      const bOverdue = bDue && bDue < today && !bDone

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

      if (aDueSoon && !bDueSoon) return -1
      if (!aDueSoon && bDueSoon) return 1

      if (a.orderGroup && b.orderGroup) {
        const groupCompare = a.orderGroup.localeCompare(b.orderGroup)
        if (groupCompare !== 0) return groupCompare
      }

      return 0
    })

  // Group jobs
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

  // Order progress
  const orderProgress = {}

  jobs.forEach((job) => {
    const group = job.orderGroup || 'No Group'

    if (!orderProgress[group]) {
      orderProgress[group] = { total: 0, completed: 0 }
    }

    orderProgress[group].total++

    if (job.status === 'Completed' || job.status === 'Shipped') {
      orderProgress[group].completed++
    }
  })

  // ===== EFFECTS =====
  async function fetchJobs() {
  const { data, error } = await supabase.from("jobs").select("*")

  if (error) {
    console.error("FETCH JOBS ERROR:", error)
    return
  }

  setJobs(data || [])
}

useEffect(() => {
  fetchJobs()
}, [])

useEffect(() => {
  const channel = supabase
    .channel("jobs-live-app")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "jobs"
      },
      () => {
        fetchJobs()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
  localStorage.setItem('role', role)
}, [role])

useEffect(() => {
  localStorage.setItem('currentPage', currentPage)
}, [currentPage])

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

    setSku('')
    setName('')
    setSize('')
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

  // ===== JOB ACTIONS =====

  async function handleStatusChange(jobId, newStatus) {
  const { data, error } = await supabase
    .from("jobs")
    .update({ status: newStatus })
    .eq("id", jobId)
    .select()

  if (error) {
    console.error("STATUS UPDATE ERROR:", error)
    alert(`Failed to update status: ${error.message}`)
    return
  }

  setJobs(
    jobs.map((job) => {
      if (job.id !== jobId) return job
      return { ...job, status: newStatus }
    })
  )

  console.log("Status updated:", data)
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
  return <RoleScreen onSelectRole={handleSelectRole} />
}

  // ===== MAIN UI =====

return (
    <div className="appLayout">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setRole={setRole}
        allowedPages={allowedPages}
      />

      <main className="mainContent">
        <h1>OFCL Operations Dashboard</h1>
        <p>Role: {role}</p>

        {currentPage === 'dashboard' && (
          <DashboardMain
            jobs={jobs}
            printingCount={printingCount}
            lowStockCount={lowStockCount}
            overdueCount={overdueCount}
            dueTodayCount={dueTodayCount}
            dueTodayJobs={dueTodayJobs}
            waitingForBlanksCount={waitingForBlanksCount}
          />
        )}

        {currentPage === 'orders' && (
         <OrdersPage
            orders={orders}
            jobs={jobs}
            setJobs={setJobs}
            setOrders={setOrders}
            setCurrentPage={setCurrentPage}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {currentPage === 'tickets' && (
          <JobTicketPage
            orders={orders}
            setOrders={setOrders}
            jobs={jobs}
            selectedOrder={selectedOrder}
          />
        )}

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

        {currentPage === 'jobs' && (
          <JobsPage
            blanksCount={blanksCount}
            printingCount={printingCount}
            completedCount={completedCount}
            shippedCount={shippedCount}
            jobSearch={jobSearch}
            setJobSearch={setJobSearch}
            groupedJobs={groupedJobs}
            handleStatusChange={handleStatusChange}
            handleDeleteJob={handleDeleteJob}
            getJobStatusClass={getJobStatusClass}
            getDueDateClass={getDueDateClass}
            orderProgress={orderProgress}
          />
        )}

        {currentPage === 'receiving' && (
          <ReceivingPage
            jobs={jobs}
            setJobs={setJobs}
          />
        )}

        {currentPage === 'scan' && (
          <ScanStation
            orders={orders}
            jobs={jobs}
            setJobs={setJobs}
            setCurrentPage={setCurrentPage}
            setSelectedOrder={setSelectedOrder}
          />
        )}

        {currentPage === 'production' && (
          <ProductionBoard jobs={jobs} />
        )}

        {currentPage === 'vendors' && <h2>Vendors page coming later</h2>}
        {currentPage === 'settings' && <h2>Settings page coming later</h2>}
      </main>
    </div>
  )
}





export default App