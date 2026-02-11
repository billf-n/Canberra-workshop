import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from 'aws-amplify/auth'
import LandingPage from './components/LandingPage'
import SignIn from './components/Auth/SignIn'
import SignUp from './components/Auth/SignUp'
import EventForm from './components/EventForm'
import ExistingEvents from './components/ExistingEvents'
import LoadingPage from './components/LoadingPage'


function App() {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const currentUser = await getCurrentUser()
      console.log(currentUser)
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleAuthSuccess = () => {
    checkAuthentication()
    // Get the redirect path from location state, default to /new-event
    const from = location.state?.from || '/new-event'
    navigate(from)
  }

  const handleEventSubmit = (eventData) => {
    console.log('Event submitted:', eventData)
  }

  const handleSignOut = () => {
    setUser(null)
    navigate('/')
  }

  if (checkingAuth) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <LandingPage 
            onNavigate={(view) => navigate(`/${view}`)}
            user={user}
            onSignOut={handleSignOut}
          />
        } 
      />
      <Route 
        path="/signin" 
        element={
          <SignIn 
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={(state) => navigate('/signup', { state })}
            onBack={() => navigate('/')}
          />
        } 
      />
      <Route 
        path="/signup" 
        element={
          <SignUp 
            onSuccess={() => navigate('/signin', { state: location.state })}
            onSwitchToSignIn={(state) => navigate('/signin', { state })}
            onBack={() => navigate('/')}
          />
        } 
      />
      <Route 
        path="/new-event" 
        element={
          <EventForm 
            onNavigate={(view) => navigate(`/${view}`)}
            onEventSubmit={handleEventSubmit}
            user={user}
          />
        } 
      />
      <Route 
        path="/existing-events" 
        element={
          <ExistingEvents 
            onNavigate={(view) => navigate(`/${view}`)}
            user={user}
          />
        } 
      />
      <Route 
        path="/loading" 
        element={
          <LoadingPage 
            onNavigate={(view) => navigate(`/${view}`)}
          />
        } 
      />
    </Routes>
  )
}

export default App
