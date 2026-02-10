function LandingPage({ onNavigate }) {
  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1 className="hero-title">Event Planning Made Simple</h1>
        <p className="hero-subtitle">Plan your perfect event with ease</p>
      </div>

      <div className="landing-options">
        <div className="landing-card" onClick={() => onNavigate('new-event')}>
          <div className="landing-card-icon">🎉</div>
          <h2 className="landing-card-title">Plan New Event</h2>
          <p className="landing-card-description">
            Start planning your next event with our step-by-step guide
          </p>
          <button className="landing-card-button">Get Started</button>
        </div>

        <div className="landing-card" onClick={() => onNavigate('existing-events')}>
          <div className="landing-card-icon">📋</div>
          <h2 className="landing-card-title">View Events</h2>
          <p className="landing-card-description">
            Check the status and details of your existing events
          </p>
          <button className="landing-card-button">View Events</button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
