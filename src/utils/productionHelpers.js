export function getDueStatus(job) {
  if (!job.dueDate) return ""

  const today = new Date()
  today.setHours(0,0,0,0)

  const due = new Date(job.dueDate)
  due.setHours(0,0,0,0)

  const diffDays = (due - today) / (1000 * 60 * 60 * 24)

  if (diffDays < 0) return "overdue"
  if (diffDays <= 2) return "dueSoon"

  return ""
}

export function sortJobsByPriority(jobs) {
  const today = new Date()
  today.setHours(0,0,0,0)

  return [...jobs].sort((a,b) => {

    const aDue = a.dueDate ? new Date(a.dueDate) : null
    const bDue = b.dueDate ? new Date(b.dueDate) : null

    if (aDue) aDue.setHours(0,0,0,0)
    if (bDue) bDue.setHours(0,0,0,0)

    const aOverdue = aDue && aDue < today
    const bOverdue = bDue && bDue < today

    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1

    const aDueSoon =
      aDue && (aDue - today) / (1000 * 60 * 60 * 24) <= 2

    const bDueSoon =
      bDue && (bDue - today) / (1000 * 60 * 60 * 24) <= 2

    if (aDueSoon && !bDueSoon) return -1
    if (!aDueSoon && bDueSoon) return 1

    return 0
  })
}

export function getPriorityLabel(job) {
  if (!job.dueDate) return ""

  const today = new Date()
  today.setHours(0,0,0,0)

  const due = new Date(job.dueDate)
  due.setHours(0,0,0,0)

  const diffDays = (due - today) / (1000 * 60 * 60 * 24)

  if (diffDays < 0) return "OVERDUE"
  if (diffDays <= 2) return "DUE SOON"

  return ""
}