import { useState } from 'react'

export default function ShiftScheduler() {
  const [start, setStart] = useState('07:00')
  const [end, setEnd] = useState('17:00')
  const [active, setActive] = useState(true)

  function applySchedule() {
    // simulation: toggles active
    setActive(true)
    alert(`Lights Out schedule set: ${start} - ${end}. Non-critical services will pause off-hours.`)
  }

  return (
    <div className="shift-root">
      <p className="muted">Define physical working hours to pause non-critical cloud syncs off-hours.</p>
      <div className="shift-controls">
        <label>
          Start
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          End
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button className="btn" onClick={applySchedule}>Apply Schedule</button>
      </div>

      <div className="status">Current schedule active: {active ? 'Yes' : 'No'}</div>
    </div>
  )
}
