import { useState } from 'react'
import LandingPage from './components/LandingPage'
import EventForm from './components/EventForm'
import ExistingEvents from './components/ExistingEvents'

function App() {
  const [currentView, setCurrentView] = useState('landing')

  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  return (
    <>
      {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {currentView === 'new-event' && <EventForm onNavigate={handleNavigate} />}
      {currentView === 'existing-events' && <ExistingEvents onNavigate={handleNavigate} />}
    </>
  )
}

export default App
