import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Bills() {
  const [items, setItems] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ category: 'Labour', description: '', amount: '', project_name: '', client_id: '', expense_date: new Date().toISOString().split('T')[0] })

  useEffect(() => { load() }, [])
  async function load() {
    const [{ data: e }, { data: c }] = await Promise.all([
      supabase.from('expenses').select('*, clients(company_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name')
    ])
    setItems(e || [])
    setClients(c || [])
    setLoading(false)
  }
  async function save() {
    setSaving(true)
    const code = 'EXP-' + String(Date.now()).slice(-4)
    await supabase.from('expenses').insert([{ ...form, expense_code: code, amount: parseFloat(form.amount) || 0, status: 'Pending' }])
    setShowModal(false); load(); setSaving(false)
  }
  async function markPaid(id) {
    await supabase.from('expenses').update({ status: 'Paid' }).eq('id', id)
    load()
  }
  function statusBadge(s) {
    return <span className={`badge ${s === 'Paid' ? 'badge-green' : 'badge-amber'}`}>{s}</span>
  }
  const total = items.reduce((s, i) => s + (i.amount || 0), 0)
  const paid = items.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.amount || 0), 0)

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card accent"><div className="stat-label">Total expenses</div><div className="stat-value">₹{Number(total).toLocaleString('en-IN')}</div></div>
        <div className="stat-card"><div className="stat-label">Paid</div><div className="stat-value">₹{Number(paid).toLocaleString('en-IN')}</div></div>
        <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value">₹{Number(total - paid).toLocaleString('en-IN')}</div><div className="stat-sub stat-down">{items.filter(i => i.status === 'Pending').length} items</div></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add expense</button>
      </div>
      {loading ? <div style={{ color: '#888', padding: 20 }}>Loading...</div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Code</th><th>Category</th><th>Description</th><th>Amount</th><th>Project</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 30 }}>No expenses yet.</td></tr>
              : items.map(e => (
                <tr key={e.id}>
                  <td className="id-cell">{e.expense_code}</td>
                  <td><span className="badge badge-orange">{e.category}</span></td>
                  <td>{e.description}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(e.amount || 0).toLocaleString('en-IN')}</td>
                  <td>{e.project_name || e.clients?.company_name || '—'}</td>
                  <td style={{ fontSize: 12, color: '#888' }}>{e.expense_date}</td>
                  <td>{statusBadge(e.status)}</td>
                  <td>{e.status === 'Pending' && <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => markPaid(e.id)}>Mark paid</button>}</td>
                </tr>
              ))}
          </tbody>
        </table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Add expense <button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['Labour','Transport','Tools','Materials','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Amount (₹) *</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
            </div>
            <div className="form-group"><label className="form-label">Description *</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this expense for?" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Project name</label><input value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} placeholder="Site" /></div>
              <div className="form-group"><label className="form-label">Date</label><input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.description || !form.amount}>{saving ? 'Saving...' : 'Add expense'}</button>
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
