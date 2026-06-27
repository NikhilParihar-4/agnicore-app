// Procurement.js
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function Procurement() {
  const [items, setItems] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ vendor_name: '', item_description: '', quantity: '', unit_price: '', project_name: '', client_id: '', order_date: new Date().toISOString().split('T')[0] })

  useEffect(() => { load() }, [])
  async function load() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('procurement').select('*, clients(company_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name')
    ])
    setItems(p || [])
    setClients(c || [])
    setLoading(false)
  }
  async function save() {
    setSaving(true)
    const num = 'PO-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4)
    const total = (parseFloat(form.quantity) || 0) * (parseFloat(form.unit_price) || 0)
    await supabase.from('procurement').insert([{ ...form, po_number: num, total_amount: total, status: 'Ordered' }])
    setShowModal(false); load(); setSaving(false)
  }
  function statusBadge(s) {
    const map = { Ordered: 'badge-orange', Delivered: 'badge-green', Cancelled: 'badge-red' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }
  async function markDelivered(id) {
    await supabase.from('procurement').update({ status: 'Delivered' }).eq('id', id)
    load()
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New PO</button>
      </div>
      {loading ? <div style={{ color: '#888', padding: 20 }}>Loading...</div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>PO #</th><th>Vendor</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Project</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={10} style={{ textAlign: 'center', color: '#888', padding: 30 }}>No purchase orders yet.</td></tr>
              : items.map(p => (
                <tr key={p.id}>
                  <td className="id-cell">{p.po_number}</td>
                  <td>{p.vendor_name}</td>
                  <td>{p.item_description}</td>
                  <td>{p.quantity}</td>
                  <td>₹{Number(p.unit_price || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(p.total_amount || 0).toLocaleString('en-IN')}</td>
                  <td>{p.project_name}</td>
                  <td style={{ fontSize: 12, color: '#888' }}>{p.order_date}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td>{p.status === 'Ordered' && <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => markDelivered(p.id)}>Delivered</button>}</td>
                </tr>
              ))}
          </tbody>
        </table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">New Purchase Order <button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Vendor name *</label><input value={form.vendor_name} onChange={e => setForm({ ...form, vendor_name: e.target.value })} placeholder="Vendor / supplier" /></div>
              <div className="form-group"><label className="form-label">Client / Project</label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">Select client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Item description *</label><input value={form.item_description} onChange={e => setForm({ ...form, item_description: e.target.value })} placeholder="What is being ordered" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" /></div>
              <div className="form-group"><label className="form-label">Unit price (₹)</label><input type="number" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" /></div>
            </div>
            {form.quantity && form.unit_price && <div style={{ background: '#FFF0E6', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
              <strong>Total: ₹{((parseFloat(form.quantity) || 0) * (parseFloat(form.unit_price) || 0)).toLocaleString('en-IN')}</strong>
            </div>}
            <div className="form-row">
              <div className="form-group"><label className="form-label">Project name</label><input value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} placeholder="Site name" /></div>
              <div className="form-group"><label className="form-label">Order date</label><input type="date" value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.vendor_name}>{saving ? 'Saving...' : 'Create PO'}</button>
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Procurement
