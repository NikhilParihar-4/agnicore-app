import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Quotations() {
  const [quotes, setQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ client_id: '', service: '', scope: '', base_amount: '', include_gst: true, project_name: '', notes: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: q }, { data: c }, { data: r }] = await Promise.all([
      supabase.from('quotations').select('*, clients(company_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name').eq('status', 'Active'),
      supabase.from('service_rates').select('service_name').eq('is_active', true)
    ])
    setQuotes(q || [])
    setClients(c || [])
    setRates(r || [])
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    const num = 'QT-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4)
    const base = parseFloat(form.base_amount) || 0
    const gst = form.include_gst ? base * 0.18 : 0
    const { error } = await supabase.from('quotations').insert([{
      quotation_number: num,
      client_id: form.client_id,
      service: form.service,
      scope: form.scope,
      base_amount: base,
      gst_amount: gst,
      total_amount: base + gst,
      include_gst: form.include_gst,
      project_name: form.project_name,
      notes: form.notes,
      status: 'Draft'
    }])
    if (!error) { setShowModal(false); load() }
    setSaving(false)
  }

  function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN') }
  function statusBadge(s) {
    const map = { Draft: 'badge-gray', Sent: 'badge-orange', Approved: 'badge-green', Rejected: 'badge-red' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  const filtered = tab === 'all' ? quotes : quotes.filter(q => q.status === tab)
  const tabs = ['all', 'Draft', 'Sent', 'Approved', 'Rejected']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New quotation</button>
      </div>
      <div className="tab-row">
        {tabs.map(t => <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t === 'all' ? `All (${quotes.length})` : t}</div>)}
      </div>
      {loading ? <div style={{ color: '#888', padding: 20 }}>Loading...</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Quotation #</th><th>Client</th><th>Service</th><th>Amount</th><th>GST</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 30 }}>No quotations found.</td></tr>
                : filtered.map(q => (
                  <tr key={q.id}>
                    <td className="id-cell">{q.quotation_number}</td>
                    <td>{q.clients?.company_name}</td>
                    <td>{q.service}</td>
                    <td>{fmt(q.base_amount)}</td>
                    <td>{q.include_gst ? fmt(q.gst_amount) : <span className="badge badge-gray">No GST</span>}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(q.total_amount)}</td>
                    <td style={{ fontSize: 12, color: '#888' }}>{new Date(q.created_at).toLocaleDateString('en-IN')}</td>
                    <td>{statusBadge(q.status)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New quotation <button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Client *</label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">Select client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Service *</label>
                <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                  <option value="">Select service</option>
                  {rates.map(r => <option key={r.service_name}>{r.service_name}</option>)}
                  <option>HVAC Execution</option>
                  <option>Fire & Safety Systems</option>
                  <option>Electrical Works</option>
                  <option>Interior Solutions</option>
                  <option>Combined MEP</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Project / site name</label><input value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} placeholder="Site name" /></div>
              <div className="form-group"><label className="form-label">Scope / quantity</label><input value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} placeholder="e.g. 500 sqft" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Base amount (₹) *</label><input type="number" value={form.base_amount} onChange={e => setForm({ ...form, base_amount: e.target.value })} placeholder="0.00" /></div>
              <div className="form-group"><label className="form-label">Invoice type</label>
                <select value={form.include_gst} onChange={e => setForm({ ...form, include_gst: e.target.value === 'true' })}>
                  <option value="true">With GST (18%)</option>
                  <option value="false">Without GST</option>
                </select>
              </div>
            </div>
            {form.base_amount && <div style={{ background: '#FFF0E6', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
              GST: ₹{(parseFloat(form.base_amount || 0) * (form.include_gst ? 0.18 : 0)).toLocaleString('en-IN')} &nbsp;|&nbsp;
              <strong>Total: ₹{(parseFloat(form.base_amount || 0) * (form.include_gst ? 1.18 : 1)).toLocaleString('en-IN')}</strong>
            </div>}
            <div className="form-group"><label className="form-label">Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Special scope or terms" /></div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.client_id || !form.base_amount}>{saving ? 'Saving...' : 'Create quotation'}</button>
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
