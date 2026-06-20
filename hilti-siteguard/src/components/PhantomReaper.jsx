import { useState } from 'react'

const projects = [
  { id: 'p1', name: 'Riverside Tower', resources: ['staging-db', 'iot-dashboard'], reaped: false },
  { id: 'p2', name: 'Harbor Offices', resources: ['test-api', 'old-logger'], reaped: false },
]

export default function PhantomReaper() {
  const [list, setList] = useState(projects)

  function reap(id) {
    setList((s) => s.map((p) => (p.id === id ? { ...p, reaped: true } : p)))
  }

  return (
    <div className="reaper-root">
      <p className="muted">Automatically find and shut down cloud resources tied to finished projects.</p>
      <ul className="project-list">
        {list.map((p) => (
          <li key={p.id} className={p.reaped ? 'reaped' : ''}>
            <div className="left">
              <strong>{p.name}</strong>
              <div className="meta">Resources: {p.resources.join(', ')}</div>
            </div>
            <div className="right">
              <button className="btn" onClick={() => reap(p.id)} disabled={p.reaped}>
                {p.reaped ? 'Reaped' : 'Reap Resources'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
