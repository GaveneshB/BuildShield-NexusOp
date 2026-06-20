import { useState } from 'react'

const initial = [
  { id: 1, name: 'Alpha Plumbing', downloads: 24, computeHours: 2.4, active: true },
  { id: 2, name: 'Bright Electric', downloads: 120, computeHours: 12.1, active: true },
  { id: 3, name: 'Eagle HVAC', downloads: 3, computeHours: 0.2, active: true },
]

function computeScore(item) {
  // lower downloads and compute => higher trust
  const downloadFactor = Math.max(0, 1 - item.downloads / 200)
  const computeFactor = Math.max(0, 1 - item.computeHours / 50)
  return Math.round((0.6 * downloadFactor + 0.4 * computeFactor) * 100)
}

export default function TrustScore() {
  const [items, setItems] = useState(initial)

  function revoke(id) {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, active: false } : it)))
  }

  return (
    <div className="trust-root">
      <p className="muted">Live trust scoring based on downloads and compute usage.</p>
      <ul className="trust-list">
        {items.map((it) => (
          <li key={it.id} className={it.active ? 'trust-item' : 'trust-item revoked'}>
            <div className="left">
              <strong>{it.name}</strong>
              <div className="meta">Downloads: {it.downloads} · Compute: {it.computeHours}h</div>
            </div>
            <div className="right">
              <div className="score">{computeScore(it)}%</div>
              <button onClick={() => revoke(it.id)} disabled={!it.active} className="btn small">
                {it.active ? 'Revoke' : 'Revoked'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
