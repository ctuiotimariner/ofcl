export const JOB_STATUSES = [
  "Email Received",
  "Waiting for Blanks",
  "Printing",
  "Completed",
  "Will Call",
  "Picked Up",
  "Shipped"
]

export function getOrderStatusFromJobs(jobs, orderNumber) {
  const orderJobs = jobs.filter((job) => job.orderGroup === orderNumber)

  if (orderJobs.length === 0) return "No Jobs"

  const allPickedUp = orderJobs.every(
    (job) => job.status === "Picked Up"
  )

  const allWillCall = orderJobs.every(
    (job) => job.status === "Will Call"
  )

  const allShipped = orderJobs.every(
    (job) => job.status === "Shipped"
  )

  const allCompleted = orderJobs.every(
    (job) =>
      job.status === "Completed" || job.status === "Shipped"
  )

  const printing = orderJobs.some(
    (job) => job.status === "Printing"
  )

  const waiting = orderJobs.some(
    (job) => job.status === "Waiting for Blanks"
  )

  if (allPickedUp) return "Picked Up"
  if (allWillCall) return "Will Call"
  if (allShipped) return "Shipped"
  if (allCompleted) return "Completed"
  if (printing) return "Printing"
  if (waiting) return "Waiting for Blanks"

  return "Email Received"
}