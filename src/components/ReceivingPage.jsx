import { supabase } from "../lib/supabase"

function ReceivingPage({ jobs, setJobs }) {
  const waitingJobs = jobs.filter(
    (job) => job.status === "Waiting for Blanks"
  )

  async function markDelivered(jobId) {
    const { data, error } = await supabase
      .from("jobs")
      .update({
        delivered: true,
        status: "Printing"
      })
      .eq("id", jobId)
      .select()

    if (error) {
      console.error("MARK DELIVERED ERROR:", error)
      alert(`Failed to update job: ${error.message}`)
      return
    }

    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? { ...job, delivered: true, status: "Printing" }
          : job
      )
    )

    console.log("Updated job:", data)
  }

  return (
    <>
      <h2>Receiving</h2>

      <div className="tableCard">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Client</th>
              <th>Garment</th>
              <th>Vendor</th>
              <th>PO</th>
              <th>Qty</th>
              <th>Delivered</th>
            </tr>
          </thead>

          <tbody>
            {waitingJobs.map((job) => (
              <tr key={job.id}>
                <td>{job.orderGroup}</td>
                <td>{job.client}</td>
                <td>{job.garment}</td>
                <td>{job.vendor}</td>
                <td>{job.poNumber}</td>
                <td>{job.qty}</td>

                <td>
                  {job.delivered ? (
                    "✔ Delivered"
                  ) : (
                    <button onClick={() => markDelivered(job.id)}>
                      Mark Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default ReceivingPage