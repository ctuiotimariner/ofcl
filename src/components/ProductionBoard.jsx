import { useEffect } from "react"

function ProductionBoard({ jobs }) {
  const embroideryJobs = jobs.filter(
    (job) => job.method === 'Embroidery' && job.status === 'Printing'
  )

  const heatTransferJobs = jobs.filter(
    (job) => job.method === 'Heat Transfer' && job.status === 'Printing'
  )

  const waitingEmbroidery = jobs.filter(
    (job) => job.method === 'Embroidery' && job.status === 'Waiting for Blanks'
  )

  const waitingHeatTransfer = jobs.filter(
    (job) => job.method === 'Heat Transfer' && job.status === 'Waiting for Blanks'
  )

  return (
    <>
      <h2 className="productionTitle">PRINT FLOOR</h2>

      <div className="productionScreen">
        <div className="productionSection">
          <h3>EMBROIDERY - PRINTING NOW</h3>

          {embroideryJobs.length === 0 && <p>No active embroidery jobs</p>}

          {embroideryJobs.map((job) => (
            <div key={job.id} className="productionCard activePrint">
              <h4>{job.orderGroup}</h4>
              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
            </div>
          ))}

          <h3 style={{ marginTop: '24px' }}>EMBROIDERY - NEXT UP</h3>

          {waitingEmbroidery.length === 0 && <p>No upcoming embroidery jobs</p>}

          {waitingEmbroidery.map((job) => (
            <div key={job.id} className="productionCard">
              <h4>{job.orderGroup}</h4>
              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
            </div>
          ))}
        </div>

        <div className="productionSection">
          <h3>HEAT TRANSFER - PRINTING NOW</h3>

          {heatTransferJobs.length === 0 && <p>No active heat transfer jobs</p>}

          {heatTransferJobs.map((job) => (
            <div key={job.id} className="productionCard activePrint">
              <h4>{job.orderGroup}</h4>
              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
            </div>
          ))}

          <h3 style={{ marginTop: '24px' }}>HEAT TRANSFER - NEXT UP</h3>

          {waitingHeatTransfer.length === 0 && <p>No upcoming heat transfer jobs</p>}

          {waitingHeatTransfer.map((job) => (
            <div key={job.id} className="productionCard">
              <h4>{job.orderGroup}</h4>
              <p><strong>Garment:</strong> {job.garment}</p>
              <p><strong>Placement:</strong> {job.placement}</p>
              <p><strong>Qty:</strong> {job.qty}</p>
              <p><strong>Design:</strong> {job.designName}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ProductionBoard