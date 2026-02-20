import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function AddTask() {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'Low', status: 'Pending' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await API.post('/tasks', form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task')
    }
  }

  return (
    <div className="auth">
      <h2>Add Task</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <input name="title" placeholder="Task Title" value={form.title} onChange={handle} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handle} />
        <input type="date" name="dueDate" value={form.dueDate} onChange={handle} />
        <select name="priority" value={form.priority} onChange={handle}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select name="status" value={form.status} onChange={handle}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
