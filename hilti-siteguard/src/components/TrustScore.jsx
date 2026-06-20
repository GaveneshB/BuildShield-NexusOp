import { useState } from 'react'

export default function TrustScore({ expanded = false }) {
  const [subs, setSubs] = useState([
    { id: 1, name: 'Apex Plumbing', phase: 'Active', downloads: 24, hours: 2.4 },
    { id: 2, name: 'Bright Electric', phase: 'Active', downloads: 120, hours: 12.1 },
    { id: 3, name: 'Eagle HVAC', phase: 'Completed', downloads: 3, hours: 0.2 }
  ])

  const getScore = (d, h) => Math.round((0.6 * Math.max(0, 1 - d / 200) + 0.4 * Math.max(0, 1 - h / 50)) * 100)
  const getColor = (s) => s > 80 ? 'bg-emerald-500' : s >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  const getStatus = (p) => p === 'Completed' ? 'Revoked' : 'Granted'
  const getStatusColor = (s) => s === 'Granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'

  if (!expanded) {
    const avgScore = Math.round(subs.reduce((sum, s) => sum + getScore(s.downloads, s.hours), 0) / subs.length)
    const grantedCount = subs.filter(s => s.phase === 'Active').length

    return (
      <div className="p-4 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600 mb-3">Subcontractor Trust Summary</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-purple-50 p-3 rounded border border-purple-200">
            <p className="text-purple-700 font-medium">Total Subs</p>
            <p className="text-lg font-bold text-purple-600">{subs.length}</p>
            <p className="text-xs text-purple-600">{grantedCount} active</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-yellow-700 font-medium">Avg Trust Score</p>
            <p className="text-lg font-bold text-yellow-600">{avgScore}%</p>
            <p className="text-xs text-yellow-600">Network wide</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
            <p className="text-emerald-700 font-medium">High Trust (80%+)</p>
            <p className="text-lg font-bold text-emerald-600">{subs.filter(s => getScore(s.downloads, s.hours) > 80).length}</p>
            <p className="text-xs text-emerald-600">Subs</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <p className="text-xs text-slate-600 mb-3">Live trust scoring based on activity and project phase.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2 font-bold text-slate-700">Subcontractor</th>
              <th className="text-left py-2 px-2 font-bold text-slate-700">Phase</th>
              <th className="text-left py-2 px-2 font-bold text-slate-700">Score</th>
              <th className="text-left py-2 px-2 font-bold text-slate-700">Access</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(sub => {
              const score = getScore(sub.downloads, sub.hours)
              const status = getStatus(sub.phase)
              return (
                <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-2">
                    <p className="font-medium">{sub.name}</p>
                    <p className="text-xs text-slate-500">{sub.downloads} dl · {sub.hours}h</p>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded ${sub.phase === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {sub.phase}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-slate-200 rounded-full">
                        <div className={`h-full ${getColor(score)}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className="font-bold">{score}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}>{status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
