import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-icon">🔥</div>
          <div>
            <div className="login-title">AgniCore</div>
            <div className="login-subtitle">Technologies — Business Portal</div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {resetSent && <div className="success-msg">Password reset link sent to {email}</div>}

        {!resetMode ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@agnicoretechnologies.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '14px', marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <span style={{ fontSize: 12, color: '#888', cursor: 'pointer' }} onClick={() => { setResetMode(true); setError('') }}>
                Forgot password?
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@agnicoretechnologies.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '14px' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <span style={{ fontSize: 12, color: '#888', cursor: 'pointer' }} onClick={() => { setResetMode(false); setError(''); setResetSent(false) }}>
                Back to sign in
              </span>
            </div>
          </form>
        )}

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #F0F0F0', fontSize: 11, color: '#BBB', textAlign: 'center' }}>
          Design | Engineer | Deliver — Bengaluru
        </div>
      </div>
    </div>
  )
}
