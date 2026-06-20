import { useState } from 'react'

export default function ChaosCure() {
  const [alerts, setAlerts] = useState([])
  const [running, setRunning] = useState(false)

  function startChaos() {
    setRunning(true)
    setAlerts([{ id: 1, type: 'data-leak', message: 'Simulated data leak on server A' }])
  }

  function runCure() {
    setAlerts([])
    setRunning(false)
    alert('Cure applied: isolated servers and applied simulated patch')
  }

  return (
    <div className="chaos-root">
      <p className="muted">Demo engine: simulate attacks and auto-heal using AI agents.</p>
      <div className="chaos-controls">
        <button className="btn danger" onClick={startChaos} disabled={running}>Start Chaos</button>
        <button className="btn" onClick={runCure} disabled={!running}>Run Cure</button>
      </div>

      <div className="alerts">
        {alerts.length === 0 ? <div className="none">No active alerts.</div> : (
          <ul>
            {alerts.map(a => (
              <li key={a.id} className="alert">{a.message} — <strong>{a.type}</strong></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
