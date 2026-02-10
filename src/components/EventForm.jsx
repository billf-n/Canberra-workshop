import { useState } from 'react'
import ProgressBar from './ProgressBar'
import StepCounter from './StepCounter'
import EventTypeStep from './steps/EventTypeStep'
import EventDateStep from './steps/EventDateStep'
import GuestCountStep from './steps/GuestCountStep'
import ServicesStep from './steps/ServicesStep'
import AdditionalInfoStep from './steps/AdditionalInfoStep'
import NameStep from './steps/NameStep'
import EmailStep from './steps/EmailStep'
import PhoneStep from './steps/PhoneStep'

const TOTAL_STEPS = 8

function EventForm({ onNavigate }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    eventType: '',
    eventTypeDetails: '',
    eventDate: '',
    guests: '',
    services: [],
    additionalInfo: '',
    name: '',
    email: '',
    phone: ''
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

  const handleSubmit = (e) => {
    e.preventDefault()

    if (formData.services.length === 0) {
      setSubmitError('Please select at least one service')
      setCurrentStep(4)
      return
    }

    console.log('Form submitted:', formData)
    alert('Thank you! Your event services request has been submitted.')

    // Reset form and navigate back to landing
    setFormData({
      eventType: '',
      eventTypeDetails: '',
      eventDate: '',
      guests: '',
      services: [],
      additionalInfo: '',
      name: '',
      email: '',
      phone: ''
    })
    setCurrentStep(1)
    setSubmitError('')
    onNavigate('landing')
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
          <ServicesStep
            services={formData.services}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            error={submitError}
            setError={setSubmitError}
          />
        )
      case 5:
        return (
          <AdditionalInfoStep
            additionalInfo={formData.additionalInfo}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 6:
        return (
          <NameStep
            name={formData.name}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 7:
        return (
          <EmailStep
            email={formData.email}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 8:
        return (
          <PhoneStep
            phone={formData.phone}
            updateFormData={updateFormData}
            handleSubmit={handleSubmit}
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
      <form onSubmit={handleSubmit}>
        {renderStep()}
      </form>
    </div>
  )
}

export default EventForm
