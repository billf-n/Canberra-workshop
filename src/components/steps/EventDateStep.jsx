import { useState } from 'react'

function EventDateStep({ eventDate, updateFormData, nextStep, prevStep }) {
  const [error, setError] = useState('')

  const handleChange = (e) => {
    updateFormData('eventDate', e.target.value)
    setError('')
  }

  const handleContinue = () => {
    if (!eventDate) {
      setError('Please select an event date')
      return
    }
    nextStep()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleContinue()
    }
  }

  return (
    <div className="form-card active">
      <h2 className="question">When is your event?</h2>
      <input
        type="date"
        value={eventDate}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        required
      />
      {error && <div className="error-message">{error}</div>}
      <div className="button-group">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn-next" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default EventDateStep
