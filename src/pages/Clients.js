import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ company_name: '', contact_person: '', phone: '', email: '', client_type: 'Builder', gst_number: '', address: '', status: 'Active' })

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    const code = 'C' + String(Date.now()).slice(-4)
    await supabase.from('clients').insert([{ ...form, client_code: code }])
    setShowModal(false)
    setForm({ company_name: '', contact_person: '', phone: '', email: '', client_type: 'Builder', gst_number: '', address: '', status: 'Active' })
    load()
    setSaving(false)
  }

  const filtered = clients.filter(c => c.company_name?.toLowerCase().includes(search.toLowerCase()) || c.contact_person?.toLowerCase().includes(search.toLowerCase()))

  function statusBadge(s) {
    return <span className={`badge ${s === 'Active' ? 'badge-green' : 'badge-gray'}`}>{s}</span>
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="Search clients..." style={{ maxWidth: 260 }} value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add client</button>
      </div>

      {loading ? <div style={{ color: '#888', padding: 20 }}>Loading...</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Code</th><th>Company</th><th>Contact</th><th>Phone</th><th>Type</th><th>GST</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 30 }}>No clients yet. Add your first client!</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td className="id-cell">{c.client_code}</td>
                  <td><div style={{ fontWeight: 500 }}>{c.company_name}</div><div style={{ fontSize: 11, color: '#888' }}>{c.email}</div></td>
                  <td>{c.contact_person}</td>
                  <td>{c.phone}</td>
                  <td><span className="badge badge-orange">{c.client_type}</span></td>
                  <td style={{ fontSize: 12, color: '#888' }}>{c.gst_number || '—'}</td>
                  <td>{statusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Add new client <button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Company name *</label><input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Prestige Constructions" /></div>
              <div className="form-group"><label className="form-label">Contact person</label><input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="Full name" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Client type</label><select value={form.client_type} onChange={e => setForm({ ...form, client_type: e.target.value })}><option>Builder</option><option>PMC Consultant</option><option>Other</option></select></div>
              <div className="form-group"><label className="form-label">GST number</label><input value={form.gst_number} onChange={e => setForm({ ...form, gst_number: e.target.value })} placeholder="Optional" /></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Office address" /></div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.company_name}>{saving ? 'Saving...' : 'Save client'}</button>
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
