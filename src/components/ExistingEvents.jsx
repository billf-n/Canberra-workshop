import { useState, useEffect } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getEventsByUserId, updateVendorSelection } from '../services/dynamodb'

function ExistingEvents({ onNavigate }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedService, setSelectedService] = useState('all')
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [aiRecommendationModalOpen, setAiRecommendationModalOpen] = useState(false)
  const [aiRecommendation, setAiRecommendation] = useState('')
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [vendorToConfirm, setVendorToConfirm] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  useEffect(() => {
    // Restore selected event from URL parameter
    const eventId = searchParams.get('event')
    if (eventId && events.length > 0) {
      const event = events.find(e => e.id === eventId)
      if (event) {
        setSelectedEvent(event)
      }
    }
  }, [events, searchParams])

  useEffect(() => {
    // Find the selected vendor from the event quotes
    if (selectedEvent && selectedEvent.quotes) {
      const selected = selectedEvent.quotes.find(q => q.selected === true)
      if (selected) {
        setSelectedVendor(selected.id)
      }
    }
  }, [selectedEvent])

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

  const fetchEvents = async () => {
    setEventsLoading(true)
    setError(null)
    try {
      const result = await getEventsByUserId(user.signInDetails.loginId);
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
    setEmailSubject(`Re: ${selectedEvent.name.replace(/_/g, ' ')} - ${quote.serviceCategory}`)
    setEmailBody(`Hi ${quote.vendorName},\n\nThank you for your quote regarding ${selectedEvent.name.replace(/_/g, ' ')}.\n\n`)
    setReplyModalOpen(true)
  }

  const closeReplyModal = () => {
    setReplyModalOpen(false)
    setSelectedQuote(null)
    setEmailSubject('')
    setEmailBody('')
  }

  const getAiRecommendation = async (doneQuotes) => {
    setLoadingRecommendation(true)
    setAiRecommendationModalOpen(true)
    
    try {
      // Prepare data for AI analysis
      const quotesData = doneQuotes.map(quote => ({
        vendorName: quote.vendorName,
        serviceCategory: quote.serviceCategory,
        quotedPrice: quote.quotedPrice,
        qualityScore: quote.qualityScore,
        serviceDetails: quote.serviceDetails,
        statusExtra: quote.statusExtra
      }))

      // TODO: Make API call to your LLM service
      const response = await fetch('/api/ai-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: selectedEvent.name,
          quotes: quotesData
        })
      })
      const data = await response.json()
      
      setAiRecommendation(data.recommendation)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock recommendation
      const mockRecommendation = `Based on the analysis of ${done.length} completed quotes for ${selectedEvent.name.replace(/_/g, ' ')}:\n\n` +
        `🏆 Top Recommendation: ${done[0]?.vendorName || 'N/A'}\n\n` +
        `Reasons:\n` +
        `• Highest quality score: ${done[0]?.qualityScore || 'N/A'}/10\n` +
        `• Competitive pricing: $${done[0]?.quotedPrice || 'N/A'}\n` +
        `• ${done[0]?.serviceCategory || 'Service'} expertise\n\n` +
        `Alternative Options:\n` +
        done.slice(1, 3).map((q, i) => 
          `${i + 2}. ${q.vendorName} - $${q.quotedPrice} (Score: ${q.qualityScore}/10)`
        ).join('\n') +
        `\n\nConsider factors like availability, dietary requirements, and guest preferences when making your final decision.`
      
      setAiRecommendation(mockRecommendation)
    } catch (error) {
      console.error('Failed to get AI recommendation:', error)
      setAiRecommendation('Failed to generate recommendation. Please try again.')
    } finally {
      setLoadingRecommendation(false)
    }
  }

  const closeAiRecommendationModal = () => {
    setAiRecommendationModalOpen(false)
    setAiRecommendation('')
  }

  const handlePickVendor = (quote) => {
    setVendorToConfirm(quote)
    setConfirmModalOpen(true)
  }

  const confirmVendorSelection = async () => {
    try {
      // Update DynamoDB - set selected to true for this vendor
      await updateVendorSelection(user.signInDetails.loginId, vendorToConfirm.id, true)
      
      // If there was a previously selected vendor, unselect it
      if (selectedVendor) {
        const previousVendor = selectedEvent.quotes.find(q => q.id === selectedVendor)
        if (previousVendor) {
          await updateVendorSelection(user.signInDetails.loginId, previousVendor.id, false)
        }
      }
      
      setSelectedVendor(vendorToConfirm.id)
      setConfirmModalOpen(false)
      setVendorToConfirm(null)
      
      // Refresh events to get updated data
      await fetchEvents()
    } catch (error) {
      console.error('Failed to update vendor selection:', error)
      alert('Failed to select vendor. Please try again.')
    }
  }

  const cancelVendorSelection = () => {
    setConfirmModalOpen(false)
    setVendorToConfirm(null)
  }

  const handleUnselectVendor = async () => {
    if (!selectedVendor) return
    
    try {
      // Update DynamoDB - set selected to false
      await updateVendorSelection(user.signInDetails.loginId, selectedVendor, false)
      
      setSelectedVendor(null)
      
      // Refresh events to get updated data
      await fetchEvents()
    } catch (error) {
      console.error('Failed to unselect vendor:', error)
      alert('Failed to unselect vendor. Please try again.')
    }
  }

  if (selectedEvent) {
    const { needsAction, pending, done, rejected } = categorizeQuotes(selectedEvent.quotes || [])
    const services = getUniqueServices(selectedEvent.quotes || [])

    return (
      <div className="existing-events-container kanban-view">
        <div className="events-header">
          <button className="btn-back-home" onClick={() => {
            setSelectedEvent(null)
            setSelectedService('all')
            setSearchParams({}) // Clear URL parameters
          }}>
            ← Back to Events
          </button>
          <h1 className="events-title">{selectedEvent.name.replace(/_/g, ' ')}</h1>
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
                <div 
                  key={quote.id} 
                  className={`quote-card ${selectedVendor && selectedVendor !== quote.id ? 'greyed-out' : ''} ${selectedVendor === quote.id ? 'selected-vendor' : ''}`}
                >
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
                  {!selectedVendor && (
                    <button 
                      className="btn-reply"
                      onClick={() => openReplyModal(quote)}
                    >
                      📧 Reply to Vendor
                    </button>
                  )}
                  {selectedVendor === quote.id && (
                    <button 
                      className="btn-reply"
                      onClick={() => openReplyModal(quote)}
                    >
                      📧 Reply to Vendor
                    </button>
                  )}
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
                <div 
                  key={quote.id} 
                  className={`quote-card ${selectedVendor && selectedVendor !== quote.id ? 'greyed-out' : ''} ${selectedVendor === quote.id ? 'selected-vendor' : ''}`}
                >
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
            <h2 className="kanban-header" style={{ backgroundColor: '#28a745', color: 'white', padding: '1rem', margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <span>DONE ({done.length})</span>
              {done.length > 0 && (
                <button 
                  className="btn-ai-recommendation"
                  onClick={() => getAiRecommendation(done)}
                  title="Get AI-powered recommendation to help you choose the best option"
                  disabled
                  style={{ position: 'absolute', right: '1rem' }}
                >
                  <svg 
                    className="ai-sparkle"
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M12 3L13.5 9.5L20 11L13.5 12.5L12 19L10.5 12.5L4 11L10.5 9.5L12 3Z"/>
                    <path d="M18 2L18.7 4.3L21 5L18.7 5.7L18 8L17.3 5.7L15 5L17.3 4.3L18 2Z"/>
                    <path d="M5 16L5.5 17.5L7 18L5.5 18.5L5 20L4.5 18.5L3 18L4.5 17.5L5 16Z"/>
                  </svg>
                </button>
              )}
            </h2>
            <div className="kanban-cards">
              {done.map(quote => (
                <div 
                  key={quote.id} 
                  className={`quote-card ${selectedVendor && selectedVendor !== quote.id ? 'greyed-out' : ''} ${selectedVendor === quote.id ? 'selected-vendor' : ''}`}
                >
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
                  {!selectedVendor && (
                    <button 
                      className="btn-pick-vendor"
                      onClick={() => handlePickVendor(quote)}
                    >
                      ✓ Pick this vendor
                    </button>
                  )}
                  {selectedVendor === quote.id && (
                    <>
                      <button 
                        className="btn-reply"
                        onClick={() => openReplyModal(quote)}
                      >
                        📧 Reply to Vendor
                      </button>
                      <button 
                        className="btn-unselect"
                        onClick={handleUnselectVendor}
                      >
                        ✕ Unselect Vendor
                      </button>
                    </>
                  )}
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
                <div 
                  key={quote.id} 
                  className={`quote-card ${selectedVendor && selectedVendor !== quote.id ? 'greyed-out' : ''} ${selectedVendor === quote.id ? 'selected-vendor' : ''}`}
                >
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

        {confirmModalOpen && vendorToConfirm && (
          <div className="modal-overlay" onClick={cancelVendorSelection}>
            <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Confirm Vendor Selection</h2>
                <button className="modal-close" onClick={cancelVendorSelection}>✕</button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: '16px', marginBottom: '1rem' }}>
                  Are you sure you want to select <strong>{vendorToConfirm.vendorName}</strong> as your vendor?
                </p>
                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p><strong>Service:</strong> {vendorToConfirm.serviceCategory}</p>
                  <p><strong>Price:</strong> ${vendorToConfirm.quotedPrice}</p>
                  <p><strong>Quality Score:</strong> {vendorToConfirm.qualityScore}/10</p>
                </div>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  This will grey out all other vendors and allow you to proceed with this selection.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={cancelVendorSelection}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={confirmVendorSelection}>
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {aiRecommendationModalOpen && (
          <div className="modal-overlay" onClick={closeAiRecommendationModal}>
            <div className="modal-content ai-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✨ AI Recommendation</h2>
                <button className="modal-close" onClick={closeAiRecommendationModal}>✕</button>
              </div>
              <div className="modal-body">
                {loadingRecommendation ? (
                  <div className="ai-loading">
                    <div className="loading-spinner"></div>
                    <p>Analyzing quotes and generating recommendation...</p>
                  </div>
                ) : (
                  <div className="ai-recommendation-content">
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {aiRecommendation}
                    </pre>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeAiRecommendationModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {replyModalOpen && selectedQuote && (
          <div className="modal-overlay" onClick={closeReplyModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Reply to {selectedQuote.vendorName}</h2>
                <button className="modal-close" onClick={closeReplyModal}>✕</button>
              </div>
              <div className="modal-body">
                {selectedQuote.latestReply && (
                  <div className="latest-reply-section">
                    <h3>Last Received Email:</h3>
                    <div 
                      className="latest-reply-content"
                      dangerouslySetInnerHTML={{ __html: selectedQuote.latestReply }}
                    />
                  </div>
                )}
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
                onClick={() => {
                  setSelectedEvent(event)
                  setSearchParams({ event: event.id }) // Add event ID to URL
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="event-card-header">
                  <div>
                    <h3>{event.name.replace(/_/g, ' ')}</h3>
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
