import { useState } from 'react'

export default function ChaosCure({ onResolved, expanded = false }) {
  const [state, setState] = useState('idle')
  const [logs, setLogs] = useState(['[*] System ready.'])
  const [running, setRunning] = useState(false)

  const addLog = (msg) => setLogs(p => [...p, msg])

  const simulate = () => {
    if (running) return
    setRunning(true)
    setLogs(['[*] Starting...'])
    setState('idle')

    setTimeout(() => {
      setState('attack')
      addLog('[!] CPU 98%, Cryptojacking!')
      addLog('[!] Containers spawning...')
      addLog('[!] Data exfiltration!')
    }, 500)

    setTimeout(() => {
      setState('mitigate')
      addLog('[*] AI Agent engaged...')
      addLog('[*] Isolating containers...')
      addLog('[*] Revoking credentials...')
    }, 3000)

    setTimeout(() => {
      setState('secure')
      addLog('[+] Patch deployed.')
      addLog('[+] Threat eliminated.')
      addLog('[+] Incident sealed.')
      onResolved?.(true)
      setRunning(false)
    }, 6000)
  }

  const theme = state === 'attack' ? 'bg-red-950 border-red-700' : 
                state === 'mitigate' ? 'bg-yellow-950 border-yellow-700' :
                state === 'secure' ? 'bg-emerald-950 border-emerald-700' : 'bg-slate-900 border-slate-700'

  if (!expanded) {
    return (
      <div className="p-4 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600 mb-3">Chaos & Cure Engine</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-100 p-3 rounded border border-slate-300">
            <p className="text-slate-700 font-medium">Status</p>
            <p className="text-lg font-bold text-slate-600">{state.toUpperCase()}</p>
            <p className="text-xs text-slate-600">Demo state</p>
          </div>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-blue-700 font-medium">Last Events</p>
            <p className="text-lg font-bold text-blue-600">{logs.length}</p>
            <p className="text-xs text-blue-600">Logged</p>
          </div>
          <div className={`p-3 rounded border ${
            state === 'secure' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-medium ${state === 'secure' ? 'text-emerald-700' : 'text-red-700'}`}>Threat</p>
            <p className={`text-lg font-bold ${state === 'secure' ? 'text-emerald-600' : 'text-red-600'}`}>
              {state === 'secure' ? 'CONTAINED' : 'ACTIVE'}
            </p>
            <p className={`text-xs ${state === 'secure' ? 'text-emerald-600' : 'text-red-600'}`}>Level</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <p className="text-xs text-slate-600 mb-3">AI attack simulation and mitigation demo.</p>
      <button onClick={simulate} disabled={running}
        className={`w-full mb-4 font-bold py-2 px-3 rounded transition ${
          running ? 'bg-slate-400 text-slate-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'
        } ${state === 'attack' ? 'animate-pulse' : ''}`}>
        {running ? 'Demo Running...' : 'SIMULATE ZERO-DAY EXPLOIT'}
      </button>
      <div className={`${theme} text-white border rounded p-3 font-mono text-xs h-48 overflow-y-auto`}>
        {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
      </div>
      <div className="mt-3 flex justify-between text-xs">
        <div className="flex gap-2">
          {['Idle', 'Attack', 'Mitigate', 'Secure'].map(s => (
            <span key={s} className={`px-2 py-1 rounded ${
              state.toUpperCase() === s.toUpperCase() 
                ? s === 'Attack' ? 'bg-red-200 text-red-700' : s === 'Mitigate' ? 'bg-yellow-200 text-yellow-700' : s === 'Secure' ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200'
                : 'bg-slate-100'
            }`}>{s}</span>
          ))}
        </div>
        <p className="text-slate-600">State: {state.toUpperCase()}</p>
      </div>
    </div>
  )
}
