import { useState } from 'react'
import './App.css'
import ShiftScheduler from './components/ShiftScheduler'
import PhantomReaper from './components/PhantomReaper'
import TrustScore from './components/TrustScore'
import DebtClock from './components/DebtClock'
import ChaosCure from './components/ChaosCure'

let db = null
try {
  import('firebase/app').catch(err => console.log('Firebase not available:', err))
} catch (err) {
  console.log('Firebase initialization skipped')
}

export default function App() {
  const [lightsOut, setLightsOut] = useState(false)
  const [cureResolved, setCureResolved] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedFeature, setExpandedFeature] = useState(null)

  const features = [
    { id: 'debt-clock', label: 'Carbon & Security Debt Clock', icon: '⏱️', component: DebtClock },
    { id: 'trust-score', label: 'Subcontractor Trust', icon: '👥', component: TrustScore },
    { id: 'lights-out', label: 'Lights Out Protocol', icon: '💡', component: ShiftScheduler },
    { id: 'phantom-reaper', label: 'Phantom Auto-Reaper', icon: '👻', component: PhantomReaper },
    { id: 'chaos-cure', label: 'Chaos & Cure Demo', icon: '⚡', component: ChaosCure },
  ]

  const handleFeatureClick = (id) => {
    setExpandedFeature(id)
    setSidebarOpen(false)
  }

  const handleClose = () => {
    setExpandedFeature(null)
  }

  const expandedFeatureData = features.find(f => f.id === expandedFeature)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 bg-slate-900 text-white w-64 transform transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0 lg:bg-white lg:text-slate-900 lg:border-r lg:border-slate-200 lg:w-56`}>
        <div className="p-6 space-y-2">
          <h2 className="text-lg font-bold mb-6 hidden lg:block">Features</h2>
          {features.map(f => (
            <button key={f.id} onClick={() => handleFeatureClick(f.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                expandedFeature === f.id
                  ? 'lg:bg-sky-100 lg:text-sky-900 bg-sky-600' 
                  : 'lg:hover:bg-slate-100 hover:bg-slate-700'
              }`}>
              <span className="text-lg mr-3">{f.icon}</span>
              <span className="font-medium">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
                <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                    sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                  } />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-slate-900">BuildShield NEXUSOP</h1>
            </div>
            <p className="text-sm text-slate-600 hidden md:block">Energy & Security Dashboard</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 w-full">
          {expandedFeature && expandedFeatureData ? (
            // Expanded View
            <div className="h-full flex flex-col">
              <div className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center">
                <div>
                  <span className="text-2xl mr-3">{expandedFeatureData.icon}</span>
                  <h2 className="text-2xl font-bold text-slate-900 inline">{expandedFeatureData.label}</h2>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto max-w-6xl mx-auto w-full px-4 py-6">
                {expandedFeatureData.id === 'debt-clock' && (
                  <DebtClock lightsOutActive={lightsOut} chaosResolved={cureResolved} expanded={true} />
                )}
                {expandedFeatureData.id === 'trust-score' && (
                  <TrustScore expanded={true} />
                )}
                {expandedFeatureData.id === 'lights-out' && (
                  <ShiftScheduler onLightsOutChange={setLightsOut} expanded={true} />
                )}
                {expandedFeatureData.id === 'phantom-reaper' && (
                  <PhantomReaper expanded={true} />
                )}
                {expandedFeatureData.id === 'chaos-cure' && (
                  <ChaosCure onResolved={setCureResolved} expanded={true} />
                )}
              </div>
            </div>
          ) : (
            // Dashboard View (Summaries)
            <div className="max-w-6xl mx-auto w-full px-4 py-6 overflow-auto">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Dashboard Overview</h2>
                <p className="text-slate-600 text-sm mb-6">Click on any feature to see the detailed expanded view. All metrics update in real-time.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Debt Clock */}
                <div 
                  onClick={() => handleFeatureClick('debt-clock')}
                  className="cursor-pointer hover:shadow-lg transition group"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition">⏱️ Carbon & Security Debt Clock</h3>
                  <DebtClock lightsOutActive={lightsOut} chaosResolved={cureResolved} expanded={false} />
                </div>

                {/* Trust Score */}
                <div 
                  onClick={() => handleFeatureClick('trust-score')}
                  className="cursor-pointer hover:shadow-lg transition group"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition">👥 Subcontractor Trust</h3>
                  <TrustScore expanded={false} />
                </div>

                {/* Lights Out */}
                <div 
                  onClick={() => handleFeatureClick('lights-out')}
                  className="cursor-pointer hover:shadow-lg transition group"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition">💡 Lights Out Protocol</h3>
                  <ShiftScheduler onLightsOutChange={setLightsOut} expanded={false} />
                </div>

                {/* Phantom Reaper */}
                <div 
                  onClick={() => handleFeatureClick('phantom-reaper')}
                  className="cursor-pointer hover:shadow-lg transition group"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition">👻 Phantom Auto-Reaper</h3>
                  <PhantomReaper expanded={false} />
                </div>

                {/* Chaos Cure */}
                <div 
                  onClick={() => handleFeatureClick('chaos-cure')}
                  className="cursor-pointer hover:shadow-lg transition group lg:col-span-2"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition">⚡ Chaos & Cure Demo</h3>
                  <ChaosCure onResolved={setCureResolved} expanded={false} />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-8">
          <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-slate-600">
            {expandedFeature ? (
              <p>Click the X button to return to dashboard overview</p>
            ) : (
              <p>Panel simulation — Click any feature card to expand or use the sidebar to navigate</p>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
