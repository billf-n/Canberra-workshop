import { signOut } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'

function LandingPage({ onNavigate, user, onSignOut }) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      onSignOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleNewEvent = () => {
    if (user) {
      onNavigate('new-event')
    } else {
      navigate('/signin', { state: { from: '/new-event' } })
    }
  }

  const handleViewEvents = () => {
    if (user) {
      onNavigate('existing-events')
    } else {
      navigate('/signin', { state: { from: '/existing-events' } })
    }
  }

  return (
    <div className="landing-container">
      {user && (
        <button className="btn-sign-out-landing" onClick={handleSignOut}>
          Sign Out
        </button>
      )}
      
      <div className="hero-section">
        <h1 className="hero-title">Event Planning Made Simple</h1>
        <p className="hero-subtitle">Plan your perfect event with ease</p>
        {user && (
          <p className="hero-welcome">Welcome back, {user.signInDetails.loginId.split("@")[0]}!</p>
        )}
      </div>

      <div className="landing-options">
        <div className="landing-card" onClick={handleNewEvent}>
          <div className="landing-card-icon">🎉</div>
          <h2 className="landing-card-title">Plan New Event</h2>
          <p className="landing-card-description">
            Start planning your next event with our step-by-step guide
          </p>
          <button className="landing-card-button">Get Started</button>
        </div>

        <div className="landing-card" onClick={handleViewEvents}>
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
