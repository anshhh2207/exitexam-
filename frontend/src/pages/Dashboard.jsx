import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const navigate = useNavigate()

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks')
      setTasks(res.data.tasks)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const { logout } = useAuth()
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!title) return
    try {
      const res = await API.post('/tasks', { title, description })
      setTasks([res.data.task, ...tasks])
      setTitle('')
      setDescription('')
    } catch (err) {
      console.error('Failed to add task', err)
    }
  }

  const toggle = async (t) => {
    const res = await API.put(`/tasks/${t._id}`, { completed: !t.completed })
    setTasks(tasks.map(x => x._id === t._id ? res.data.task : x))
  }

  const del = async (t) => {
    await API.delete(`/tasks/${t._id}`)
    setTasks(tasks.filter(x => x._id !== t._id))
  }

  return (
    <div className="dashboard">
      <header>
        <h2>Tasks</h2>
        <div>
          {user && <span>Hi, {user.name}</span>}
          <button onClick={handleLogout}>Logout</button>
          <button style={{ marginLeft: 8 }} onClick={() => navigate('/tasks/new')}>Add Task</button>
        </div>
      </header>

      <form onSubmit={addTask} className="task-form">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
        <button type="submit">Add</button>
      </form>

      <ul className="tasks">
        {tasks.map(t => (
          <li key={t._id} className={t.completed ? 'done' : ''}>
            <div>
              <label>
                <input type="checkbox" checked={t.completed || t.status === 'Completed'} onChange={() => toggle(t)} />
                <strong style={{ marginLeft: 8 }}>{t.title}</strong>
              </label>
              {t.description && <div style={{ color: '#666', marginTop: 6 }}>{t.description}</div>}
              <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>
                {t.dueDate && <span>Due: {new Date(t.dueDate).toLocaleDateString()} </span>}
                <span>Priority: {t.priority || 'Low'} </span>
                <span>Status: {t.status || 'Pending'}</span>
              </div>
            </div>
            <button onClick={() => del(t)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
