import { useState, useEffect } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'

function ExistingEvents({ onNavigate }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Mock data - replace with actual data from API/state management
  const events = [
    {
      id: 1,
      name: 'Summer Wedding',
      type: 'wedding',
      date: '2026-07-15',
      status: 'confirmed'
    },
    {
      id: 2,
      name: 'Corporate Retreat',
      type: 'corporate',
      date: '2026-05-20',
      status: 'pending'
    }
  ]

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
      // Redirect to signin if not authenticated
      navigate('/signin', { state: { from: '/existing-events' } })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="existing-events-container">
        <div className="events-header">
          <button className="btn-back-home" onClick={() => onNavigate('')}>
            ← Back to Home
          </button>
        </div>
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <div className="existing-events-container">
      <div className="events-header">
        <button className="btn-back-home" onClick={() => onNavigate('')}>
          ← Back to Home
        </button>
        <h1 className="events-title">Your Events</h1>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No events found</p>
            <button className="btn-primary" onClick={() => onNavigate('new-event')}>
              Plan Your First Event
            </button>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <h3>{event.name}</h3>
                <span className={`event-status ${event.status}`}>
                  {event.status}
                </span>
              </div>
              <div className="event-card-body">
                <p><strong>Type:</strong> {event.type}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ExistingEvents
