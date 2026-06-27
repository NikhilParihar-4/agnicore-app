import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ServiceRates() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ service_name: '', unit: '', rate: '', gst_rate: 18, category: 'HVAC' })

  useEffect(() => { load() }, [])
  async function load() {
    const { data } = await supabase.from('service_rates').select('*').order('category')
    setRates(data || [])
    setLoading(false)
  }
  async function save() {
    setSaving(true)
    await supabase.from('service_rates').insert([{ ...form, rate: parseFloat(form.rate), gst_rate: parseFloat(form.gst_rate) }])
    setShowModal(false); load(); setSaving(false)
  }
  async function toggleActive(id, val) {
    await supabase.from('service_rates').update({ is_active: !val }).eq('id', id)
    load()
  }

  return (
    <div>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 13 }}>These rates are used when generating quotations. Update them as your pricing changes.</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add rate</button>
      </div>
      {loading ? <div style={{ color: '#888', padding: 20 }}>Loading...</div> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Service</th><th>Category</th><th>Unit</th><th>Rate (₹)</th><th>GST</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.service_name}</td>
                <td><span className="badge badge-orange">{r.category}</span></td>
                <td><span className="badge badge-gray">{r.unit}</span></td>
                <td style={{ fontWeight: 600 }}>₹{Number(r.rate).toLocaleString('en-IN')}</td>
                <td>{r.gst_rate}%</td>
                <td><span className={`badge ${r.is_active ? 'badge-green' : 'badge-gray'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td>
                <td><button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => toggleActive(r.id, r.is_active)}>{r.is_active ? 'Deactivate' : 'Activate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Add service rate <button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="form-group"><label className="form-label">Service name *</label><input value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} placeholder="e.g. HVAC — Copper piping" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['HVAC','Fire & Safety','Electrical','Interior','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Unit</label><input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="ft / mtr / unit / sqft" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Rate (₹) *</label><input type="number" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="0.00" /></div>
              <div className="form-group"><label className="form-label">GST rate (%)</label><select value={form.gst_rate} onChange={e => setForm({ ...form, gst_rate: e.target.value })}><option value={18}>18%</option><option value={12}>12%</option><option value={5}>5%</option><option value={0}>0%</option></select></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.service_name || !form.rate}>{saving ? 'Saving...' : 'Add rate'}</button>
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
