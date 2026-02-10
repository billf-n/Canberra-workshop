import { useState } from 'react'

function NameStep({ name, updateFormData, nextStep, prevStep }) {
  const [error, setError] = useState('')

  const handleChange = (e) => {
    updateFormData('name', e.target.value)
    setError('')
  }

  const handleContinue = () => {
    if (!name.trim()) {
      setError('Please enter your name')
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
      <h2 className="question">What's your name?</h2>
      <input
        type="text"
        value={name}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter your full name"
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

export default NameStep
