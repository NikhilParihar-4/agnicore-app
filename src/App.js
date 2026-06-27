import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Quotations from './pages/Quotations'
import Invoices from './pages/Invoices'
import Procurement from './pages/Procurement'
import Bills from './pages/Bills'
import ServiceRates from './pages/ServiceRates'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import './App.css'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 40, height: 40, background: '#E85D04', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontSize: 22 }}>🔥</span>
      </div>
      <div style={{ color: '#E85D04', fontWeight: 500 }}>Loading AgniCore...</div>
    </div>
  )

  if (!session) return <LoginPage />

  const pages = {
    dashboard: <Dashboard />,
    clients: <Clients />,
    quotations: <Quotations />,
    invoices: <Invoices />,
    procurement: <Procurement />,
    bills: <Bills />,
    rates: <ServiceRates />,
    settings: <Settings />,
  }

  return (
    <AuthContext.Provider value={{ session, profile }}>
      <div className="app-layout">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="app-main">
          <div className="orange-bar" />
          <Topbar currentPage={currentPage} profile={profile} />
          <div className="app-content">
            {pages[currentPage] || <Dashboard />}
          </div>
        </div>
      </div>
    </AuthContext.Provider>
  )
}
