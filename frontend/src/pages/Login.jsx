import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, setUser } = useAuth()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await login(form)
      setUser(res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="auth">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handle} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
