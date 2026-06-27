import React from 'react'
import { useAuth } from '../App'
import { supabase } from '../lib/supabase'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '⊞', section: 'Overview' },
  { key: 'clients', label: 'Clients', icon: '👥', section: 'Business' },
  { key: 'quotations', label: 'Quotations', icon: '📄', section: 'Business' },
  { key: 'invoices', label: 'Invoices', icon: '🧾', section: 'Business' },
  { key: 'procurement', label: 'Procurement', icon: '🛒', section: 'Finance' },
  { key: 'bills', label: 'Bills & Expenses', icon: '💸', section: 'Finance' },
  { key: 'rates', label: 'Service Rates', icon: '🏷️', section: 'Setup', adminOnly: true },
  { key: 'settings', label: 'Settings', icon: '⚙️', section: 'Setup', adminOnly: true },
]

export default function Sidebar({ currentPage, onNavigate }) {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const sections = [...new Set(navItems.map(i => i.section))]

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="sidebar">
      <div className="logo-area">
        <div className="logo-wrap">
          <div className="logo-icon">🔥</div>
          <div>
            <div className="logo-name">AgniCore</div>
            <div className="logo-sub">Technologies</div>
          </div>
        </div>
      </div>

      <div className="nav-scroll">
        {sections.map(section => {
          const items = navItems.filter(i => i.section === section && (!i.adminOnly || isAdmin))
          if (!items.length) return null
          return (
            <div className="nav-section" key={section}>
              <div className="nav-label">{section}</div>
              {items.map(item => (
                <div
                  key={item.key}
                  className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
                  onClick={() => onNavigate(item.key)}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className="sidebar-footer">
        <div style={{ fontSize: 12, color: '#888', marginBottom: 6, paddingLeft: 2 }}>
          {profile?.full_name || profile?.email}
        </div>
        <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}
