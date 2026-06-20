import { useState } from 'react'

export default function PhantomReaper({ expanded = false }) {
  const [projects, setProjects] = useState([
    {
      id: 'p1',
      name: 'Riverside Tower Phase 1',
      resources: ['1x RDS Database', '2x EC2', '1x Lambda'],
      cost: 245.50,
      co2: 18.7,
      reaped: false
    },
    {
      id: 'p2',
      name: 'Harbor Offices Renovation',
      resources: ['1x DynamoDB', '3x ECS Tasks'],
      cost: 156.20,
      co2: 11.2,
      reaped: false
    }
  ])

  function handleTerminate(id) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, reaped: true } : p))
    try {
      if (typeof db !== 'undefined') {
        // Firebase call
      }
    } catch (err) {
      console.log('Firebase update skipped:', err)
    }
  }

  if (!expanded) {
    const totalCost = projects.reduce((sum, p) => sum + (p.reaped ? 0 : p.cost), 0)
    const totalCo2 = projects.reduce((sum, p) => sum + (p.reaped ? 0 : p.co2), 0)
    const reapedCount = projects.filter(p => p.reaped).length

    return (
      <div className="p-4 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600 mb-3">Auto-Reaper Summary</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <p className="text-red-700 font-medium">Phantom Projects</p>
            <p className="text-lg font-bold text-red-600">{projects.length}</p>
            <p className="text-xs text-red-600">{reapedCount} reaped</p>
          </div>
          <div className="bg-orange-50 p-3 rounded border border-orange-200">
            <p className="text-orange-700 font-medium">Daily Cost</p>
            <p className="text-lg font-bold text-orange-600">${totalCost.toFixed(2)}</p>
            <p className="text-xs text-orange-600">At risk</p>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <p className="text-red-700 font-medium">Carbon Leak</p>
            <p className="text-lg font-bold text-red-600">{totalCo2.toFixed(1)}</p>
            <p className="text-xs text-red-600">kg CO2/day</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <p className="text-xs text-slate-600 mb-3">Automatically find and shut down cloud resources tied to finished projects.</p>
      <div className="space-y-3">
        {projects.map(project => (
          <div key={project.id} className={`p-3 border rounded-lg transition ${
            project.reaped ? 'bg-emerald-50 border-emerald-300 opacity-60' : 'bg-red-50 border-red-300'
          }`}>
            <div className="mb-2">
              <p className="font-bold text-sm text-slate-900">{project.name}</p>
              <p className="text-xs text-slate-600 mt-1">Resources: {project.resources.join(', ')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="bg-white p-2 rounded border border-red-200">
                <p className="text-red-700 font-medium">Daily Cost</p>
                <p className="text-red-600 font-bold">${project.cost.toFixed(2)}</p>
              </div>
              <div className="bg-white p-2 rounded border border-red-200">
                <p className="text-red-700 font-medium">Carbon</p>
                <p className="text-red-600 font-bold">{project.co2} kg CO2</p>
              </div>
            </div>
            {project.reaped ? (
              <div className="bg-emerald-100 border border-emerald-400 rounded p-2 text-emerald-700 text-xs font-medium text-center">
                ✓ Resources Reclaimed. Carbon leak sealed.
              </div>
            ) : (
              <button onClick={() => handleTerminate(project.id)}
                className="w-full bg-red-600 text-white font-bold py-2 px-3 rounded hover:bg-red-700 text-sm transition">
                TERMINATE & RECLAIM
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
