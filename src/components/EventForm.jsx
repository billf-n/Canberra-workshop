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
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleFinalSubmit = async () => {
    if (!user) {
      navigate('/signin', { state: { from: '/new-event' } })
      return
    }

    try {
      // Get user attributes
      const attributes = await fetchUserAttributes()
      const userId = attributes.sub
      const userEmail = attributes.email
      const userName = attributes.name || ''
      
      const eventWithUser = {
        ...formData,
        userId,
        userEmail,
        userName
      }
      
      console.log('Saving event to DynamoDB:', eventWithUser)
      
      // Save to DynamoDB
      const result = await saveEventToDatabase(formData, userId)
      
      console.log('Event saved successfully to DynamoDB:', result)

      if (onEventSubmit) {
        await onEventSubmit({ ...eventWithUser, eventId: result.eventId })
      }

      alert(`Thank you! Your event has been created successfully. Event ID: ${result.eventId}`)

      // Reset form and navigate back to landing
      setFormData({
        eventType: '',
        eventTypeDetails: '',
        eventDate: '',
        guests: '',
        budget: '',
        eventLocation: '',
        services: [],
        additionalInfo: ''
      })
      setCurrentStep(1)
      setSubmitError('')
      onNavigate('')
    } catch (error) {
      console.error('Error saving event:', error)
      setSubmitError(`Failed to save event: ${error.message}`)
      alert(`There was an error saving your event: ${error.message}. Please try again.`)
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
      <input name="userId" style="display: none">{user.userId}</input>
      <input name="userEmail" style="display: none">{user.signInDetails.loginId}</input>
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      <div className="form-header">
        <button className="btn-back-home" onClick={() => onNavigate('')}>
          ← Back to Home
        </button>
        <StepCounter currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {renderStep()}
      </form>
    </div>
  )
}

export default EventForm
