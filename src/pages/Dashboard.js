import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, openQuotes: 0, unpaidInvoices: 0, unpaidValue: 0 })
  const [recentQuotes, setRecentQuotes] = useState([])
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ count: clientCount }, { data: quotes }, { data: invoices }] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('quotations').select('*, clients(company_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('invoices').select('*, clients(company_name)').order('created_at', { ascending: false }).limit(5),
      ])
      const unpaid = (invoices || []).filter(i => i.status !== 'Paid')
      const unpaidVal = unpaid.reduce((s, i) => s + (i.total_amount || 0), 0)
      const openQ = (quotes || []).filter(q => q.status === 'Draft' || q.status === 'Sent').length
      setStats({ clients: clientCount || 0, openQuotes: openQ, unpaidInvoices: unpaid.length, unpaidValue: unpaidVal })
      setRecentQuotes(quotes || [])
      setRecentInvoices(invoices || [])
      setLoading(false)
    }
    load()
  }, [])

  function statusBadge(s) {
    const map = { Active: 'badge-green', Approved: 'badge-green', Paid: 'badge-green', Delivered: 'badge-green', Sent: 'badge-orange', Ordered: 'badge-orange', Draft: 'badge-gray', Inactive: 'badge-gray', Pending: 'badge-amber', Unpaid: 'badge-amber', Rejected: 'badge-red', Overdue: 'badge-red', Cancelled: 'badge-red' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN') }

  if (loading) return <div style={{ padding: 40, color: '#888', textAlign: 'center' }}>Loading dashboard...</div>

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-label">Active clients</div>
          <div className="stat-value">{stats.clients}</div>
          <div className="stat-sub">Total accounts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Open quotations</div>
          <div className="stat-value">{stats.openQuotes}</div>
          <div className="stat-sub">Draft + Sent</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unpaid invoices</div>
          <div className="stat-value">{stats.unpaidInvoices}</div>
          <div className="stat-sub stat-down">{fmt(stats.unpaidValue)} outstanding</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This month</div>
          <div className="stat-value">Jun 2026</div>
          <div className="stat-sub">Bengaluru, IN</div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <div className="section-header">
            <span className="section-title">Recent quotations</span>
          </div>
          {recentQuotes.length === 0
            ? <div className="card" style={{ color: '#888', fontSize: 13 }}>No quotations yet. Create your first one!</div>
            : <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentQuotes.slice(0, 4).map(q => (
                      <tr key={q.id}>
                        <td className="id-cell" style={{ fontSize: 11 }}>{q.quotation_number || '—'}</td>
                        <td>{q.clients?.company_name || '—'}</td>
                        <td>{fmt(q.total_amount)}</td>
                        <td>{statusBadge(q.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
        <div>
          <div className="section-header">
            <span className="section-title">Recent invoices</span>
          </div>
          {recentInvoices.length === 0
            ? <div className="card" style={{ color: '#888', fontSize: 13 }}>No invoices yet.</div>
            : <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Client</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentInvoices.slice(0, 4).map(i => (
                      <tr key={i.id}>
                        <td className="id-cell" style={{ fontSize: 11 }}>{i.invoice_number || '—'}</td>
                        <td>{i.clients?.company_name || '—'}</td>
                        <td>{fmt(i.total_amount)}</td>
                        <td>{statusBadge(i.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>
    </div>
  )
}
