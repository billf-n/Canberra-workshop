import { useState } from 'react'

function EmailStep({ email, updateFormData, nextStep, prevStep }) {
  const [error, setError] = useState('')

  const handleChange = (e) => {
    updateFormData('email', e.target.value)
    setError('')
  }

  const handleContinue = () => {
    if (!email.trim()) {
      setError('Please enter your email')
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
      <h2 className="question">What's your email address?</h2>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="your@email.com"
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

export default EmailStep
