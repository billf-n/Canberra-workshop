import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchUserAttributes } from 'aws-amplify/auth'
import ProgressBar from './ProgressBar'
import StepCounter from './StepCounter'
import EventTypeStep from './steps/EventTypeStep'
import EventDateStep from './steps/EventDateStep'
import GuestCountStep from './steps/GuestCountStep'
import BudgetStep from './steps/BudgetStep'
import EventLocationStep from './steps/EventLocationStep'
import ServicesStep from './steps/ServicesStep'
import AdditionalInfoStep from './steps/AdditionalInfoStep'
import { saveEventToDatabase } from '../services/dynamodb'

const TOTAL_STEPS = 7

function EventForm({ onNavigate, onEventSubmit, user }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    eventType: '',
    eventTypeDetails: '',
    eventDate: '',
    guests: '',
    budget: '',
    eventLocation: '',
    services: [],
    additionalInfo: ''
  })

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (!user) {
      navigate('/signin', { state: { from: '/new-event' } })
    }
  }, [user, navigate])

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  // 🔹 Handle final submit directly to n8n
  const handleFinalSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')

    try {
      if (!user) {
        navigate('/signin', { state: { from: '/new-event' } })
        return
      }

      const response = await fetch('https://selinaaaaa.app.n8n.cloud/webhook-test/d6866489-aad7-4cd0-9f11-d04af7edffad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await response.json().catch(() => { })
      console.log('Event submitted successfully, agent analyzing...')
      setCurrentView('loading')
      await new Promise(resolve => setTimeout(resolve, 5000))


      // Reset form
      setFormData({
        eventType: '',
        eventTypeDetails: '',
        eventDate: '',
        guests: '',
        guestEstimate: '',
        budget: '',
        eventLocation: '',
        services: [],
        additionalInfo: ''
      })
      setCurrentStep(1)
      setSubmitError('')
      onNavigate('')
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError(`Failed to submit event: ${error.message}`)
      alert(`There was an error submitting your event: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EventTypeStep
            eventType={formData.eventType}
            eventTypeDetails={formData.eventTypeDetails}
            updateFormData={updateFormData}
            nextStep={nextStep}
          />
        )
      case 2:
        return (
          <EventDateStep
            eventDate={formData.eventDate}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 3:
        return (
          <GuestCountStep
            guests={formData.guests}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 4:
        return (
          <BudgetStep
            budget={formData.budget}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 5:
        return (
          <EventLocationStep
            eventLocation={formData.eventLocation}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 6:
        return (
          <ServicesStep
            services={formData.services}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            error={submitError}
            setError={setSubmitError}
          />
        )
      case 7:
        return (
          <AdditionalInfoStep
            additionalInfo={formData.additionalInfo}
            updateFormData={updateFormData}
            nextStep={handleFinalSubmit}
            prevStep={prevStep}
          />
        )
      default:
        return null
    }
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return (
    <div className="container">
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      <div className="form-header">
        <button className="btn-back-home" onClick={() => onNavigate('')}>
          ← Back to Home
        </button>
        <StepCounter currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <input name="userId" className="form-hidden-input" value={user.userId}></input>
        <input name="userEmail" className="form-hidden-input" value={user.signInDetails.loginId}></input>
        {renderStep()}
      </form>
    </div>
  )
}

export default EventForm
