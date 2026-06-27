import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { loadEmployees() }, [])

  async function loadEmployees() {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setEmployees(data || [])
    setLoading(false)
  }

  async function inviteEmployee() {
    if (!inviteEmail) return
    setInviting(true)
    setMsg('')
    const { error } = await supabase.auth.admin?.inviteUserByEmail
      ? await supabase.auth.admin.inviteUserByEmail(inviteEmail)
      : { error: null }
    if (error) setMsg('Error: ' + error.message)
    else setMsg(`Invite sent to ${inviteEmail}! They will receive an email to set their password.`)
    setInviteEmail('')
    setInviteName('')
    setInviting(false)
  }

  async function changeRole(id, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    loadEmployees()
  }

  return (
    <div>
      <div className="two-col">
        <div>
          <div className="section-title" style={{ marginBottom: 14 }}>Company details</div>
          <div className="card">
            <div className="form-group"><label className="form-label">Company name</label><input defaultValue="AgniCore Technologies" /></div>
            <div className="form-group"><label className="form-label">GST number</label><input defaultValue="29ABCDE1234F1Z5" /></div>
            <div className="form-group"><label className="form-label">Admin email</label><input defaultValue="contact@agnicoretechnologies.com" disabled style={{ background: '#F8F8F8', color: '#888' }} /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Phone 1</label><input defaultValue="+91 77606 09318" /></div>
              <div className="form-group"><label className="form-label">Phone 2</label><input defaultValue="+91 87627 11930" /></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><textarea rows={2} defaultValue="Bengaluru, Karnataka, India" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Default GST rate</label><select defaultValue="18"><option value="18">18%</option><option value="12">12%</option><option value="5">5%</option></select></div>
              <div className="form-group"><label className="form-label">Payment terms (days)</label><input type="number" defaultValue={30} /></div>
            </div>
            <button className="btn btn-primary">Save changes</button>
          </div>
        </div>

        <div>
          <div className="section-title" style={{ marginBottom: 14 }}>Team members</div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Invite employee</div>
            {msg && <div style={{ background: msg.startsWith('Error') ? '#FFEBEE' : '#E8F5E9', color: msg.startsWith('Error') ? '#C62828' : '#2E7D32', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 10 }}>{msg}</div>}
            <div className="form-group"><label className="form-label">Full name</label><input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Employee name" /></div>
            <div className="form-group"><label className="form-label">Email address</label><input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="employee@email.com" /></div>
            <button className="btn btn-primary" onClick={inviteEmployee} disabled={inviting || !inviteEmail} style={{ width: '100%', justifyContent: 'center' }}>
              {inviting ? 'Sending invite...' : 'Send invite email'}
            </button>
            <div style={{ fontSize: 11, color: '#AAA', marginTop: 8, textAlign: 'center' }}>They'll get an email to set their password and log in</div>
          </div>

          <div className="section-title" style={{ marginBottom: 10 }}>Current team</div>
          {loading ? <div style={{ color: '#888', fontSize: 13 }}>Loading...</div> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Name / Email</th><th>Role</th><th></th></tr></thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{e.full_name || '—'}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{e.email}</div>
                    </td>
                    <td><span className={`badge ${e.role === 'admin' ? 'badge-orange' : 'badge-gray'}`}>{e.role}</span></td>
                    <td>
                      {e.email !== 'contact@agnicoretechnologies.com' && (
                        <button className="btn btn-sm" style={{ fontSize: 11 }}
                          onClick={() => changeRole(e.id, e.role === 'admin' ? 'employee' : 'admin')}>
                          {e.role === 'admin' ? 'Make employee' : 'Make admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>
    </div>
  )
}
