import { useState } from 'react'

function EventTypeStep({ eventType, eventTypeDetails, updateFormData, nextStep }) {
  const [error, setError] = useState('')

  const eventTypes = [
    { value: 'wedding', icon: '💒', label: 'Wedding' },
    { value: 'corporate', icon: '💼', label: 'Corporate' },
    { value: 'birthday', icon: '🎂', label: 'Birthday' },
    { value: 'conference', icon: '🎤', label: 'Conference' },
    { value: 'other', icon: '🎉', label: 'Other' }
  ]

  const handleTypeChange = (value) => {
    updateFormData('eventType', value)
    setError('')
  }

  const handleDetailsChange = (e) => {
    updateFormData('eventTypeDetails', e.target.value)
  }

  const handleContinue = () => {
    if (!eventType) {
      setError('Please select an event type')
      return
    }
    nextStep()
  }

  return (
    <div className="form-card active">
      <h2 className="question">What type of event are you planning?</h2>
      <div className="options-grid">
        {eventTypes.map(type => (
          <label key={type.value} className="option-card-small">
            <input
              type="radio"
              name="eventType"
              value={type.value}
              checked={eventType === type.value}
              onChange={() => handleTypeChange(type.value)}
              required
            />
            <span className="option-content-small">
              <span className="option-icon-small">{type.icon}</span>
              <span className="option-text-small">{type.label}</span>
            </span>
          </label>
        ))}
      </div>
      {error && <div className="error-message">{error}</div>}
      {eventType === 'other' && (
        <input
          type="text"
          className="form-answer"
          value={eventTypeDetails}
          onChange={handleDetailsChange}
          placeholder="Tell us more about your event..."
        />
      )}
      <div className="button-group">
        <button type="button" className="btn-next" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default EventTypeStep
