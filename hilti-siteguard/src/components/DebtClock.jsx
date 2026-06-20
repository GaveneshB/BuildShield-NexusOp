import { useEffect, useState, useRef } from 'react'

export default function DebtClock({ lightsOutActive, chaosResolved, expanded = false }) {
  const [carbon, setCarbon] = useState(1200)
  const [financial, setFinancial] = useState(3450)
  const [tickRate, setTickRate] = useState(0.5)
  const [finRate, setFinRate] = useState(2.1)
  const rafRef = useRef(null)
  const lastRef = useRef(performance.now())

  useEffect(() => {
    let rate = tickRate
    if (lightsOutActive) rate *= 0.1
    if (chaosResolved) rate *= 0.1

    function tick(now) {
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      setCarbon(p => p + rate * dt)
      setFinancial(p => p + finRate * (rate / tickRate) * dt)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tickRate, finRate, lightsOutActive, chaosResolved])

  if (!expanded) {
    return (
      <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 text-white">
        <p className="text-xs text-slate-400 mb-3">Live Debt Accumulation</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-3">
            <p className="text-xs text-red-300 font-medium mb-1">CARBON DEBT</p>
            <p className="text-2xl font-mono font-bold text-red-300">{carbon.toFixed(1)}</p>
            <p className="text-xs text-red-300">kg CO2</p>
          </div>
          <div className="bg-orange-500 bg-opacity-20 border border-orange-500 rounded p-3">
            <p className="text-xs text-orange-300 font-medium mb-1">FINANCIAL WASTE</p>
            <p className="text-2xl font-mono font-bold text-orange-300">${financial.toFixed(2)}</p>
            <p className="text-xs text-orange-300">USD</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 text-white">
      <p className="text-xs text-slate-400 mb-3">Live debt accumulation from unoptimized workloads.</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-3">
          <p className="text-xs text-red-300 font-medium mb-1">CARBON DEBT</p>
          <p className="text-2xl font-mono font-bold text-red-300">{carbon.toFixed(1)}</p>
          <p className="text-xs text-red-300">kg CO2</p>
        </div>
        <div className="bg-orange-500 bg-opacity-20 border border-orange-500 rounded p-3">
          <p className="text-xs text-orange-300 font-medium mb-1">FINANCIAL WASTE</p>
          <p className="text-2xl font-mono font-bold text-orange-300">${financial.toFixed(2)}</p>
          <p className="text-xs text-orange-300">USD</p>
        </div>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs">
          <span className="text-slate-300 w-24">CO2 Rate:</span>
          <input type="range" min="0" max="5" step="0.1" value={tickRate}
            onChange={(e) => setTickRate(Number(e.target.value))} className="flex-1" />
          <span className="text-slate-300 w-12">{tickRate.toFixed(1)}/s</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <span className="text-slate-300 w-24">$ Rate:</span>
          <input type="range" min="0" max="10" step="0.1" value={finRate}
            onChange={(e) => setFinRate(Number(e.target.value))} className="flex-1" />
          <span className="text-slate-300 w-12">${finRate.toFixed(1)}/s</span>
        </label>
      </div>
    </div>
  )
}
