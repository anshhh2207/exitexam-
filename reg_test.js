const data = {
  name: 'Test User',
  email: `testuser_${Date.now()}@example.com`,
  password: 'secret123',
  confirmPassword: 'secret123'
}

;(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    console.log('status', res.status)
    const json = await res.text()
    console.log('body:', json)
  } catch (err) {
    console.error('request error', err)
  }
})()
