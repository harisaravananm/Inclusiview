import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import Reports from './pages/Reports'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'map' && <MapView />}
        {activeTab === 'reports' && <Reports />}
      </main>
    </div>
  )
}
