import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function ShiftScheduler({ onLightsOutChange, expanded = false }) {
  const [shiftStart, setShiftStart] = useState(7)
  const [shiftEnd, setShiftEnd] = useState(17)
  const [synced, setSynced] = useState(false)

  const activeHours = shiftEnd - shiftStart
  const energySavedKwh = (24 - activeHours) * 22
  const co2SavedKg = energySavedKwh * 2.9
  const attackSurfaceReduction = ((24 - activeHours) / 24) * 100

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    active: i >= shiftStart && i < shiftEnd ? 1 : 0,
    label: `${String(i).padStart(2, '0')}:00`
  }))

  function handleSyncCalendar() {
    setSynced(true)
    onLightsOutChange?.(true)
    try {
      if (typeof db !== 'undefined') {
        // Firebase call here
      }
    } catch (err) {
      console.log('Firebase sync skipped:', err)
    }
    setTimeout(() => setSynced(false), 2000)
  }

  const formatTime = (hour) => `${String(hour).padStart(2, '0')}:00`

  if (!expanded) {
    return (
      <div className="p-4 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600 mb-3">Jobsite "Lights Out" Protocol</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
            <p className="text-emerald-700 font-medium">Energy Saved</p>
            <p className="text-lg font-bold text-emerald-600">{energySavedKwh.toFixed(0)} kWh</p>
            <p className="text-xs text-emerald-600">{co2SavedKg.toFixed(1)} kg CO2</p>
          </div>
          <div className="bg-sky-50 p-3 rounded border border-sky-200">
            <p className="text-sky-700 font-medium">Shift Hours</p>
            <p className="text-lg font-bold text-sky-600">{activeHours}h</p>
            <p className="text-xs text-sky-600">{shiftStart}:00 - {shiftEnd}:00</p>
          </div>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-blue-700 font-medium">Attack Surface</p>
            <p className="text-lg font-bold text-blue-600">{attackSurfaceReduction.toFixed(0)}%</p>
            <p className="text-xs text-blue-600">Reduction</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <p className="text-xs text-slate-600 mb-3">Define physical working hours to pause non-critical cloud syncs off-hours.</p>
      
      <div className="flex gap-3 mb-4">
        <label className="flex flex-col text-sm">
          <span className="text-slate-700 font-medium mb-1">Shift Start</span>
          <select 
            value={shiftStart} 
            onChange={(e) => setShiftStart(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded bg-white"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{formatTime(i)}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm">
          <span className="text-slate-700 font-medium mb-1">Shift End</span>
          <select 
            value={shiftEnd} 
            onChange={(e) => setShiftEnd(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded bg-white"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{formatTime(i)}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button 
            onClick={handleSyncCalendar}
            className={`px-4 py-2 rounded font-medium transition ${
              synced ? 'bg-emerald-500 text-white' : 'bg-sky-500 text-white hover:bg-sky-600'
            }`}
          >
            {synced ? '✓ Synced' : 'Sync Calendar'}
          </button>
        </div>
      </div>

      <div className="mb-4 bg-slate-50 p-3 rounded">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="0" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff' }}
              formatter={(value) => value ? 'Active' : 'Off-hours'} />
            <Bar dataKey="active" fill="#0ea5e9" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.active ? '#0ea5e9' : '#cbd5e1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
          <p className="text-emerald-700 font-medium">Energy Saved</p>
          <p className="text-lg font-bold text-emerald-600">{energySavedKwh.toFixed(0)} kWh</p>
          <p className="text-xs text-emerald-600">{co2SavedKg.toFixed(1)} kg CO2</p>
        </div>
        <div className="bg-sky-50 p-2 rounded border border-sky-200">
          <p className="text-sky-700 font-medium">Attack Surface</p>
          <p className="text-lg font-bold text-sky-600">{attackSurfaceReduction.toFixed(0)}%</p>
          <p className="text-xs text-sky-600">Reduction</p>
        </div>
      </div>
    </div>
  )
}
