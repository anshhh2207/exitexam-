const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()

const User = require('../models/User')
const Task = require('../models/Task')

function requireAuth(req, res, next) {
	if (req.session && req.session.userId) return next()
	return res.status(401).json({ error: 'Unauthorized' })
}

router.post('/register', async (req, res) => {
	try {
		console.log('Register payload:', req.body)
		const { name, email, password, confirmPassword } = req.body
		if (!name || !email || !password || !confirmPassword)
			return res.status(400).json({ error: 'All fields are required' })
		if (password !== confirmPassword)
			return res.status(400).json({ error: 'Passwords do not match' })

		const existing = await User.findOne({ email })
		if (existing) return res.status(409).json({ error: 'Email already registered' })

		if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
		const hash = await bcrypt.hash(password, 10)
		let user
		try {
			user = await User.create({ name, email, password: hash })
		} catch (e) {
			if (e.code === 11000) return res.status(409).json({ error: 'Email already registered' })
			throw e
		}

		// create session
		req.session.userId = user._id
		res.json({ message: 'Registered successfully', user: { id: user._id, name: user.name, email: user.email } })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
})

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

		const user = await User.findOne({ email })
		if (!user) return res.status(400).json({ error: 'Invalid email or password' })

		const ok = await bcrypt.compare(password, user.password)
		if (!ok) return res.status(400).json({ error: 'Invalid email or password' })

		req.session.userId = user._id
		res.json({ message: 'Logged in', user: { id: user._id, name: user.name, email: user.email } })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Server error' })
	}
})

router.post('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) return res.status(500).json({ error: 'Failed to logout' })
		res.clearCookie('connect.sid')
		res.json({ message: 'Logged out' })
	})
})

router.get('/me', requireAuth, async (req, res) => {
	try {
		const user = await User.findById(req.session.userId).select('-password')
		res.json({ user })
	} catch (err) {
		res.status(500).json({ error: 'Server error' })
	}
})

// Tasks CRUD (protected)
router.get('/tasks', requireAuth, async (req, res) => {
	try {
		const tasks = await Task.find({ owner: req.session.userId }).sort({ createdAt: -1 })
		res.json({ tasks })
	} catch (err) {
		res.status(500).json({ error: 'Server error' })
	}
})

router.post('/tasks', requireAuth, async (req, res) => {
	try {
		const { title, description, dueDate, priority, status } = req.body
		if (!title) return res.status(400).json({ error: 'Title is required' })
		if (priority && !['Low', 'Medium', 'High'].includes(priority)) return res.status(400).json({ error: 'Invalid priority' })
		if (status && !['Pending', 'In Progress', 'Completed'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
		const taskData = { title, description, owner: req.session.userId }
		if (dueDate) taskData.dueDate = new Date(dueDate)
		if (priority) taskData.priority = priority
		if (status) taskData.status = status
		const task = await Task.create(taskData)
		res.status(201).json({ task })
	} catch (err) {
		res.status(500).json({ error: 'Server error' })
	}
})

router.get('/tasks/:id', requireAuth, async (req, res) => {
	try {
		const task = await Task.findOne({ _id: req.params.id, owner: req.session.userId })
		if (!task) return res.status(404).json({ error: 'Not found' })
		res.json({ task })
	} catch (err) {
		res.status(500).json({ error: 'Server error' })
	}
})

router.put('/tasks/:id', requireAuth, async (req, res) => {
	try {
		const updates = req.body
		if (updates.priority && !['Low', 'Medium', 'High'].includes(updates.priority)) return res.status(400).json({ error: 'Invalid priority' })
		if (updates.status && !['Pending', 'In Progress', 'Completed'].includes(updates.status)) return res.status(400).json({ error: 'Invalid status' })
		if (updates.dueDate) updates.dueDate = new Date(updates.dueDate)
		const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.session.userId }, updates, { new: true })
		if (!task) return res.status(404).json({ error: 'Not found' })
		res.json({ task })
	} catch (err) {
		res.status(500).json({ error: 'Server error' })
	}
})

router.delete('/tasks/:id', requireAuth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.session.userId })
		if (!task) return res.status(404).json({ error: 'Not found' })
		res.json({ message: 'Deleted' })
	} catch (err) {
		res.status(500).json({ error: 'Server error' })
	}
})

module.exports = router

