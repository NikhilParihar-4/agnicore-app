import React from 'react'
import { useAuth } from '../App'

const titles = {
  dashboard: 'Dashboard', clients: 'Clients', quotations: 'Quotations',
  invoices: 'Invoices', procurement: 'Procurement', bills: 'Bills & Expenses',
  rates: 'Service Rates', settings: 'Settings'
}

export default function Topbar({ currentPage, profile }) {
  const isAdmin = profile?.role === 'admin'
  return (
    <div className="topbar">
      <div className="page-title">{titles[currentPage] || 'Dashboard'}</div>
      <div className="topbar-right">
        <div className="user-chip">
          <span style={{ fontSize: 13 }}>👤</span>
          <span>{profile?.full_name || profile?.email?.split('@')[0]}</span>
          <span className="role-badge">{isAdmin ? 'Admin' : 'Staff'}</span>
        </div>
      </div>
    </div>
  )
}
