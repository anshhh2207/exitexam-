import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register, setUser } = useAuth()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await register(form)
      setUser(res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="auth">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handle} />
        <input name="email" placeholder="Email" value={form.email} onChange={handle} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handle} />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
