// small helper to call API
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = options.headers || {}
  if (token) headers.Authorization = 'Bearer ' + token
  if (!headers['Content-Type'] && options.body) headers['Content-Type'] = 'application/json'
  const res = await fetch(API_BASE + path, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined })
  const text = await res.text()
  let json
  try { json = text ? JSON.parse(text) : {} } catch(e) { json = { text } }
  if (!res.ok) throw json
  return json
}
