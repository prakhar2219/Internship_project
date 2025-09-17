import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await api('/api/auth/login', { method: 'POST', body: { email, password } })
      localStorage.setItem('token', res.token)
      navigate('/notes')
    } catch (err) {
      setError(err.error || 'Login failed')
    }
  }

  return (
    <div className="center-screen">
      <div className="card">
        <h1>Notes — Login</h1>
        <form onSubmit={submit} className="stack">
          <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button>Sign in</button>
          {error && <div className="error">{error}</div>}
        </form>

        <div className="info">
          <p>Test accounts (password: <strong>password</strong>):</p>
          <ul>
            <li>admin@acme.test (Admin, tenant: acme)</li>
            <li>user@acme.test (Member, tenant: acme)</li>
            <li>admin@globex.test (Admin, tenant: globex)</li>
            <li>user@globex.test (Member, tenant: globex)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
