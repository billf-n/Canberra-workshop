import { useState } from 'react'
import ProgressBar from './ProgressBar'
import StepCounter from './StepCounter'
import EventTypeStep from './steps/EventTypeStep'
import EventDateStep from './steps/EventDateStep'
import GuestCountStep from './steps/GuestCountStep'
import BudgetStep from './steps/BudgetStep'
import EventLocationStep from './steps/EventLocationStep'
import ServicesStep from './steps/ServicesStep'
import AdditionalInfoStep from './steps/AdditionalInfoStep'
import AuthStep from './steps/AuthStep'
import { saveEventToDatabase } from '../services/dynamodb'

const TOTAL_STEPS = 7

function EventForm({ onNavigate, onEventSubmit }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
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

  const [authenticatedUser, setAuthenticatedUser] = useState(null)

  const handleAuthSuccess = async (user) => {
    try {
      // Get user ID and email from Cognito user object
      const userId = user.userId || user.username

      // Fetch user attributes to get email
      const { fetchUserAttributes } = await import('aws-amplify/auth')
      const attributes = await fetchUserAttributes()
      const userEmail = attributes.email
      const userName = attributes.name || ''

      console.log('User authenticated:', { userId, userEmail, userName })

      // Store authenticated user
      setAuthenticatedUser({
        userId,
        email: userEmail,
        name: userName,
        attributes
      })

      // Automatically submit the event
      await handleFinalSubmit({
        userId,
        email: userEmail,
        name: userName
      })
    } catch (error) {
      console.error('Error getting user attributes:', error)
      alert('There was an error processing your authentication. Please try again.')
    }
  }

  const handleFinalSubmit = async (userData) => {
    try {
      // User is authenticated, save event to DynamoDB
      const eventWithUser = {
        ...formData,
        userId: userData.userId,
        userEmail: userData.email,
        userName: userData.name
      }
      
      console.log('Saving event to DynamoDB:', eventWithUser)
      
      // Save to DynamoDB
      const result = await saveEventToDatabase(formData, userData.userId)
      
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
        services: [],
        additionalInfo: ''
      })
      setCurrentStep(1)
      setSubmitError('')
      setAuthenticatedUser(null)
      onNavigate('landing')
    } catch (error) {
      console.error('Error saving event:', error)
      setSubmitError(`Failed to save event: ${error.message}`)
      alert(`There was an error saving your event: ${error.message}. Please try again.`)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <AuthStep
            onSuccess={handleAuthSuccess}
            nextStep={nextStep}
          />
        )
      case 1:
        return (
          <EventTypeStep
            eventType={formData.eventType}
            eventTypeDetails={formData.eventTypeDetails}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            isFirstStep={true}
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
            guestEstimate={formData.guestEstimate}
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

  return (
    <div className="container">
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      <div className="form-header">
        <button className="btn-back-home" onClick={() => onNavigate('landing')}>
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
