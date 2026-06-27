import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ client_id: '', description: '', base_amount: '', include_gst: true, payment_terms_days: 30 })

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: inv }, { data: cl }] = await Promise.all([
      supabase.from('invoices').select('*, clients(company_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name').eq('status', 'Active')
    ])
    setInvoices(inv || [])
    setClients(cl || [])
    setLoading(false)
  }

  async function save() {
    setSaving(true)
    const num = 'INV-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4)
    const base = parseFloat(form.base_amount) || 0
    const gst = form.include_gst ? base * 0.18 : 0
    const due = new Date()
    due.setDate(due.getDate() + parseInt(form.payment_terms_days || 30))
    await supabase.from('invoices').insert([{
      invoice_number: num, client_id: form.client_id, description: form.description,
      base_amount: base, gst_amount: gst, total_amount: base + gst,
      include_gst: form.include_gst, payment_terms_days: form.payment_terms_days,
      due_date: due.toISOString().split('T')[0], status: 'Unpaid'
    }])
    setShowModal(false)
    load()
    setSaving(false)
  }

  async function markPaid(id) {
    await supabase.from('invoices').update({ status: 'Paid' }).eq('id', id)
    load()
  }

  function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN') }
  function statusBadge(s) {
    const map = { Unpaid: 'badge-amber', Paid: 'badge-green', Overdue: 'badge-red', Cancelled: 'badge-gray' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  const total = invoices.reduce((s, i) => s + (i.total_amount || 0), 0)
  const paid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + (i.total_amount || 0), 0)
  const outstanding = total - paid

  return (
    <div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card accent"><div className="stat-label">Total invoiced</div><div className="stat-value">{fmt(total)}</div></div>
        <div className="stat-card"><div className="stat-label">Collected</div><div className="stat-value">{fmt(paid)}</div><div className="stat-sub stat-up">{invoices.filter(i => i.status === 'Paid').length} paid</div></div>
        <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value">{fmt(outstanding)}</div><div className="stat-sub stat-down">{invoices.filter(i => i.status !== 'Paid').length} unpaid</div></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New invoice</button>
      </div>

      {loading ? <div style={{ color: '#888', padding: 20 }}>Loading...</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>GST</th><th>Total</th><th>Due date</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {invoices.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#888', padding: 30 }}>No invoices yet.</td></tr>
                : invoices.map(i => (
                  <tr key={i.id}>
                    <td className="id-cell">{i.invoice_number}</td>
                    <td>{i.clients?.company_name}</td>
                    <td>{fmt(i.base_amount)}</td>
                    <td>{i.include_gst ? fmt(i.gst_amount) : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(i.total_amount)}</td>
                    <td style={{ fontSize: 12, color: '#888' }}>{i.due_date}</td>
                    <td>{i.include_gst ? <span className="badge badge-orange">GST</span> : <span className="badge badge-gray">Simple</span>}</td>
                    <td>{statusBadge(i.status)}</td>
                    <td>{i.status === 'Unpaid' && <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => markPaid(i.id)}>Mark paid</button>}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New invoice <button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Client *</label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">Select client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Invoice type</label>
                <select value={form.include_gst} onChange={e => setForm({ ...form, include_gst: e.target.value === 'true' })}>
                  <option value="true">GST Invoice (18%)</option>
                  <option value="false">Simple Invoice</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Description of work *</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Work covered in this invoice" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Base amount (₹) *</label><input type="number" value={form.base_amount} onChange={e => setForm({ ...form, base_amount: e.target.value })} placeholder="0.00" /></div>
              <div className="form-group"><label className="form-label">Payment terms (days)</label><input type="number" value={form.payment_terms_days} onChange={e => setForm({ ...form, payment_terms_days: e.target.value })} /></div>
            </div>
            {form.base_amount && <div style={{ background: '#FFF0E6', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
              GST: ₹{(parseFloat(form.base_amount || 0) * (form.include_gst ? 0.18 : 0)).toLocaleString('en-IN')} &nbsp;|&nbsp;
              <strong>Total: ₹{(parseFloat(form.base_amount || 0) * (form.include_gst ? 1.18 : 1)).toLocaleString('en-IN')}</strong>
            </div>}
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.client_id || !form.base_amount}>{saving ? 'Saving...' : 'Create invoice'}</button>
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
