import { useState } from 'react'

function EventNameStep({ eventName, updateFormData, nextStep }) {
  const [name, setName] = useState(eventName || '')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const value = e.target.value
    setName(value)
    setError('')
  }

  const handleContinue = () => {
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      setError('Please enter a name for your event')
      return
    }

    const wordCount = trimmedName.split(/\s+/).length
    if (wordCount > 3) {
      setError('Event name must be 3 words or less')
      return
    }

    updateFormData('eventName', trimmedName)
    nextStep()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleContinue()
    }
  }

  const wordCount = name.trim() ? name.trim().split(/\s+/).length : 0

  return (
    <div className="form-card active">
      <h2 className="question">What would you like to call your event?</h2>
      <p className="subtext">Give your event a short name (max 3 words)</p>
      <input
        type="text"
        className="form-answer"
        value={name}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="e.g., Summer Wedding, Annual Gala"
        maxLength={50}
      />
      <div style={{ marginTop: '8px', fontSize: '14px', color: wordCount > 3 ? '#e74c3c' : '#666' }}>
        {wordCount} / 3 words
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="button-group">
        <button type="button" className="btn-next" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default EventNameStep
