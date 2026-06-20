import { useEffect, useState, useRef } from 'react'

export default function DebtClock() {
  const [debt, setDebt] = useState(0)
  const [wasteRate, setWasteRate] = useState(0.5) // kg CO2 / second (simulated)
  const [repayment, setRepayment] = useState(null)
  const raf = useRef(null)

  useEffect(() => {
    let last = performance.now()
    function tick(now) {
      const dt = (now - last) / 1000
      last = now
      setDebt((d) => d + wasteRate * dt)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [wasteRate])

  function repaySmall() {
    setDebt((d) => Math.max(0, d - 50))
    setRepayment('Archived 3 idle DBs and patched Node B (-50 kg CO2)')
  }

  return (
    <div className="debt-root">
      <div className="debt-display">
        <div className="debt-value">{debt.toFixed(1)} kg CO2</div>
        <div className="debt-rate">Waste rate: {wasteRate.toFixed(2)} kg/sec</div>
      </div>

      <div className="controls">
        <label>
          Waste rate:{' '}
          <input
            type="range"
            min="0"
            max="5"
            step="0.01"
            value={wasteRate}
            onChange={(e) => setWasteRate(Number(e.target.value))}
          />
        </label>
        <button className="btn" onClick={repaySmall}>Auto-generate Debt Repayment Plan</button>
      </div>

      {repayment && <div className="repayment">{repayment}</div>}
    </div>
  )
}
