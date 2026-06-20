import { useState } from 'react'
import './App.css'
import TrustScore from './components/TrustScore'
import DebtClock from './components/DebtClock'
import ShiftScheduler from './components/ShiftScheduler'
import PhantomReaper from './components/PhantomReaper'
import ChaosCure from './components/ChaosCure'

function App() {
  const [selectedProject, setSelectedProject] = useState('Riverside Tower')

  return (
    <div className="dashboard-root">
      <header className="topbar">
        <h1>Hilti SiteGuard — Energy & Security Dashboard</h1>
        <div className="project-select">Project: {selectedProject}</div>
      </header>

      <main className="grid">
        <section className="panel">
          <h2>Dynamic Subcontractor Trust Scoring</h2>
          <TrustScore />
        </section>

        <section className="panel">
          <h2>Carbon & Security Debt Clock</h2>
          <DebtClock />
        </section>

        <section className="panel">
          <h2>Jobsite "Lights Out" Scheduler</h2>
          <ShiftScheduler />
        </section>

        <section className="panel wide">
          <h2>Phantom Infrastructure Auto-Reaper</h2>
          <PhantomReaper />
        </section>

        <section className="panel wide">
          <h2>Chaos & Cure Demo Engine</h2>
          <ChaosCure />
        </section>
      </main>

      <footer className="footer">Panel simulation only — integrates with cloud APIs in backend.</footer>
    </div>
  )
}

export default App
