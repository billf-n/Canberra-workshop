const express = require('express')
const cors = require('cors')
const { CognitoJwtVerifier } = require('aws-jwt-verify')

const app = express()
const PORT = process.env.PORT || 3001

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// Create Cognito JWT Verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_USER_POOL_ID,
  tokenUse: 'access',
  clientId: process.env.AWS_USER_POOL_WEB_CLIENT_ID
})

// Middleware to verify Cognito token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const payload = await verifier.verify(token)
    req.user = payload
    next()
  } catch (error) {
    console.error('Token verification failed:', error)
    return res.status(403).json({ error: 'Invalid token' })
  }
}

// Public endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Protected endpoint example
app.get('/api/user/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Protected data',
    user: req.user
  })
})

// Event endpoints
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const eventData = req.body
    const userId = req.user.sub
    
    // TODO: Save to database
    console.log('Creating event for user:', userId, eventData)
    
    res.json({
      success: true,
      message: 'Event created successfully',
      eventId: Date.now() // Replace with actual DB ID
    })
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub
    
    // TODO: Fetch from database
    console.log('Fetching events for user:', userId)
    
    res.json({
      events: [
        {
          id: 1,
          name: 'Sample Event',
          type: 'wedding',
          date: '2026-07-15',
          status: 'confirmed'
        }
      ]
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
