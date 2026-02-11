import { useState, useEffect } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import SignIn from './Auth/SignIn'
import SignUp from './Auth/SignUp'
import { getEventsByUserId } from '../services/dynamodb'

function ExistingEvents({ onNavigate }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authView, setAuthView] = useState('signIn') // 'signIn' or 'signUp'
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedService, setSelectedService] = useState('all')
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    setEventsLoading(true)
    setError(null)
    try {
      const result = await getEventsByUserId(user.userId)
      setEvents(result.events)
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setError('Failed to load events. Please try again.')
    } finally {
      setEventsLoading(false)
    }
  }

  const handleSignInSuccess = () => {
    checkUser()
  }

  const categorizeQuotes = (quotes) => {
    // Filter by selected service
    const filteredQuotes = selectedService === 'all' 
      ? quotes 
      : quotes.filter(q => q.serviceCategory === selectedService)

    const needsAction = []
    const pending = []
    const done = []
    const rejected = []

    filteredQuotes.forEach(quote => {
      const status = quote.status?.toUpperCase()
      
      if (status === 'ESCALATED') {
        needsAction.push(quote)
      } else if (status === 'DONE' || status === 'QUOTE') {
        done.push(quote)
      } else if (status === 'REJECTED') {
        rejected.push(quote)
      } else if (status === 'PENDING' || quote.statusExtra?.includes('pending')) {
        pending.push(quote)
      } else {
        pending.push(quote)
      }
    })

    return { needsAction, pending, done, rejected }
  }

  const getUniqueServices = (quotes) => {
    const services = new Set()
    quotes.forEach(quote => {
      if (quote.serviceCategory) {
        services.add(quote.serviceCategory)
      }
    })
    return Array.from(services)
  }

  const openReplyModal = (quote) => {
    setSelectedQuote(quote)
    setEmailSubject(`Re: ${selectedEvent.name} - ${quote.serviceCategory}`)
    setEmailBody(`Hi ${quote.vendorName},\n\nThank you for your quote regarding ${selectedEvent.name}.\n\n`)
    setReplyModalOpen(true)
  }

  const closeReplyModal = () => {
    setReplyModalOpen(false)
    setSelectedQuote(null)
    setEmailSubject('')
    setEmailBody('')
  }

  if (selectedEvent) {
    const { needsAction, pending, done, rejected } = categorizeQuotes(selectedEvent.quotes || [])
    const services = getUniqueServices(selectedEvent.quotes || [])

    return (
      <div className="existing-events-container">
        <div className="events-header">
          <button className="btn-back-home" onClick={() => {
            setSelectedEvent(null)
            setSelectedService('all')
          }}>
            ← Back to Events
          </button>
          <h1 className="events-title">{selectedEvent.name}</h1>
          {selectedEvent.date && (
            <p className="event-date-subtitle">
              Event Date: {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>

        {services.length > 0 && (
          <div className="service-filter">
            <button 
              className={`service-filter-btn ${selectedService === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedService('all')}
            >
              All Services ({selectedEvent.quotes?.length || 0})
            </button>
            {services.map(service => {
              const count = selectedEvent.quotes.filter(q => q.serviceCategory === service).length
              return (
                <button 
                  key={service}
                  className={`service-filter-btn ${selectedService === service ? 'active' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  {service} ({count})
                </button>
              )
            })}
          </div>
        )}

        <div className="kanban-board">
          <div className="kanban-column needs-action">
            <h2 className="kanban-header" style={{ backgroundColor: '#dc3545', color: 'white', padding: '1rem', margin: 0 }}>
              NEEDS ACTION ({needsAction.length})
            </h2>
            <div className="kanban-cards">
              {needsAction.map(quote => (
                <div key={quote.id} className="quote-card">
                  <h3>{quote.vendorName}</h3>
                  <p><strong>Service:</strong> {quote.serviceCategory}</p>
                  <p><strong>Price:</strong> ${quote.quotedPrice}</p>
                  <p><strong>Quality Score:</strong> {quote.qualityScore}/10</p>
                  <p><strong>Start Date:</strong> {quote.startDate}</p>
                  <details>
                    <summary>Details</summary>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{quote.serviceDetails}</p>
                    {quote.statusExtra && (
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                        <strong>Status:</strong> {quote.statusExtra}
                      </p>
                    )}
                  </details>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Contact: {quote.vendorEmail}
                  </p>
                  <button 
                    className="btn-reply"
                    onClick={() => openReplyModal(quote)}
                  >
                    📧 Reply to Vendor
                  </button>
                </div>
              ))}
              {needsAction.length === 0 && (
                <p style={{ padding: '1rem', color: '#666' }}>No quotes need action</p>
              )}
            </div>
          </div>

          <div className="kanban-column pending">
            <h2 className="kanban-header" style={{ backgroundColor: '#fd7e14', color: 'white', padding: '1rem', margin: 0 }}>
              PENDING ({pending.length})
            </h2>
            <div className="kanban-cards">
              {pending.map(quote => (
                <div key={quote.id} className="quote-card">
                  <h3>{quote.vendorName}</h3>
                  <p><strong>Service:</strong> {quote.serviceCategory}</p>
                  <p><strong>Price:</strong> ${quote.quotedPrice}</p>
                  <p><strong>Quality Score:</strong> {quote.qualityScore}/10</p>
                  <p><strong>Start Date:</strong> {quote.startDate}</p>
                  <details>
                    <summary>Details</summary>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{quote.serviceDetails}</p>
                    {quote.statusExtra && (
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                        <strong>Status:</strong> {quote.statusExtra}
                      </p>
                    )}
                  </details>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Contact: {quote.vendorEmail}
                  </p>
                </div>
              ))}
              {pending.length === 0 && (
                <p style={{ padding: '1rem', color: '#666' }}>No pending quotes</p>
              )}
            </div>
          </div>

          <div className="kanban-column done">
            <h2 className="kanban-header" style={{ backgroundColor: '#28a745', color: 'white', padding: '1rem', margin: 0 }}>
              DONE ({done.length})
            </h2>
            <div className="kanban-cards">
              {done.map(quote => (
                <div key={quote.id} className="quote-card">
                  <h3>{quote.vendorName}</h3>
                  <p><strong>Service:</strong> {quote.serviceCategory}</p>
                  <p><strong>Price:</strong> ${quote.quotedPrice}</p>
                  <p><strong>Quality Score:</strong> {quote.qualityScore}/10</p>
                  <p><strong>Start Date:</strong> {quote.startDate}</p>
                  <details>
                    <summary>Details</summary>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{quote.serviceDetails}</p>
                    {quote.statusExtra && (
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                        <strong>Status:</strong> {quote.statusExtra}
                      </p>
                    )}
                  </details>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Contact: {quote.vendorEmail}
                  </p>
                </div>
              ))}
              {done.length === 0 && (
                <p style={{ padding: '1rem', color: '#666' }}>No completed quotes</p>
              )}
            </div>
          </div>

          <div className="kanban-column rejected">
            <h2 className="kanban-header" style={{ backgroundColor: '#6c757d', color: 'white', padding: '1rem', margin: 0 }}>
              ✕ REJECTED ({rejected.length})
            </h2>
            <div className="kanban-cards">
              {rejected.map(quote => (
                <div key={quote.id} className="quote-card">
                  <h3>{quote.vendorName}</h3>
                  <p><strong>Service:</strong> {quote.serviceCategory}</p>
                  <p><strong>Price:</strong> ${quote.quotedPrice}</p>
                  <p><strong>Quality Score:</strong> {quote.qualityScore}/10</p>
                  <p><strong>Start Date:</strong> {quote.startDate}</p>
                  <details>
                    <summary>Details</summary>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{quote.serviceDetails}</p>
                    {quote.statusExtra && (
                      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                        <strong>Status:</strong> {quote.statusExtra}
                      </p>
                    )}
                  </details>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Contact: {quote.vendorEmail}
                  </p>
                </div>
              ))}
              {rejected.length === 0 && (
                <p style={{ padding: '1rem', color: '#666' }}>No rejected quotes</p>
              )}
            </div>
          </div>
        </div>

        {replyModalOpen && selectedQuote && (
          <div className="modal-overlay" onClick={closeReplyModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reply to {selectedQuote.vendorName}</h2>
                <button className="modal-close" onClick={closeReplyModal}>✕</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>To:</label>
                  <input 
                    type="email" 
                    value={selectedQuote.vendorEmail} 
                    disabled 
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </div>
                <div className="form-group">
                  <label>Subject:</label>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Message:</label>
                  <textarea 
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows="10"
                    style={{ minHeight: '200px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeReplyModal}>
                  Cancel
                </button>
                <button 
                  className="btn-send" 
                  disabled
                >
                  Send Email (Coming Soon...)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="existing-events-container">
        <div className="events-header">
          <button className="btn-back-home" onClick={() => onNavigate('landing')}>
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
    return (
      <div className="existing-events-container">
        <div className="events-header">
          <button className="btn-back-home" onClick={() => onNavigate('landing')}>
            ← Back to Home
          </button>
          <h1 className="events-title">Sign In to View Your Events</h1>
        </div>
        <div className="auth-container">
          {authView === 'signIn' ? (
            <SignIn 
              onSuccess={handleSignInSuccess}
              onSwitchToSignUp={() => setAuthView('signUp')}
            />
          ) : (
            <SignUp 
              onSuccess={() => setAuthView('signIn')}
              onSwitchToSignIn={() => setAuthView('signIn')}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="existing-events-container">
      <div className="events-header">
        <button className="btn-back-home" onClick={() => onNavigate('landing')}>
          ← Back to Home
        </button>
        <h1 className="events-title">Your Events</h1>
      </div>

      {error && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          margin: '1rem 0', 
          backgroundColor: '#fee', 
          color: '#c33',
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      {eventsLoading ? (
        <div className="auth-loading" style={{ minHeight: '200px' }}>
          <div className="loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      ) : (
        <div className="events-list" style={{ minHeight: '200px' }}>
          {events.length === 0 ? (
            <div className="no-events">
              <p>No events found</p>
              <button className="btn-primary" onClick={() => onNavigate('new-event')}>
                Plan Your First Event
              </button>
            </div>
          ) : (
            events.map(event => (
              <div 
                key={event.id} 
                className="event-card" 
                onClick={() => setSelectedEvent(event)}
                style={{ cursor: 'pointer' }}
              >
                <div className="event-card-header">
                  <div>
                    <h3>{event.name}</h3>
                    {event.date && (
                      <p className="event-card-date">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                  <span className="event-badge">
                    {event.quotes?.length || 0} quotes
                  </span>
                </div>
                <div className="event-card-body">
                  <p><strong>Date:</strong> {event.quotes?.[0]?.startDate || 'No date available'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ExistingEvents
