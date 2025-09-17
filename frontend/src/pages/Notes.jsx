import { useEffect, useState } from 'react'
import { api } from '../api'

function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return null }
}

export default function Notes() {
  const [notes, setNotes] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [session, setSession] = useState(null)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if (!token) { location.href = '/' }
    const payload = decodeToken(token)
    setSession(payload)
    fetchNotes()
  }, [])

  async function fetchNotes() {
    try {
      const data = await api('/api/notes')
      setNotes(data)
    } catch (err) {
      alert(err.error || 'Failed to load')
    }
  }

  async function createNote(e) {
    e.preventDefault()
    try {
      await api('/api/notes', { method: 'POST', body: { title, content } })
      setTitle('')
      setContent('')
      fetchNotes()
    } catch (err) { alert(err.error || 'Create failed') }
  }

  async function del(id) {
    if (!confirm('Delete?')) return
    try {
      await api('/api/notes/' + id, { method: 'DELETE' })
      fetchNotes()
    } catch (err) { alert(err.error || 'Delete failed') }
  }

  async function upgrade() {
    if (!session?.tenantSlug) return alert('Missing tenant info')
    try {
      await api('/api/tenants/' + session.tenantSlug + '/upgrade', { method: 'POST' })
      alert('Upgraded to Pro')
      fetchNotes()
    } catch (err) { alert(err.error || 'Upgrade failed') }
  }

  function logout() { localStorage.removeItem('token'); location.href = '/' }

  if (!notes) return <div className="p-6">Loading...</div>

  const tenantPlan = session?.plan || 'FREE'
  const freeLimitReached = tenantPlan === 'FREE' && notes.length >= 3

  return (
    <div className="container">
      <header className="header">
        <h1>Notes</h1>
        <div>
          <span className="muted">{session?.tenantSlug} • {tenantPlan}</span>
          <button onClick={logout} className="small">Logout</button>
        </div>
      </header>

      <form onSubmit={createNote} className="stack card">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content" />
        <div className="row">
          <button disabled={freeLimitReached}>Create</button>
          {freeLimitReached && <button type="button" onClick={upgrade} className="upgrade">Upgrade to Pro</button>}
        </div>
      </form>

      <div className="grid">
        {notes.map(n => (
          <div className="note card" key={n._id}>
            <div className="row">
              <div>
                <h3>{n.title}</h3>
                <div className="muted">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="row gap">
                <button onClick={()=>del(n._id)} className="danger small">Delete</button>
              </div>
            </div>
            <p className="content">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
