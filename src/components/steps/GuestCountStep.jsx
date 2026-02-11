import { useState } from 'react'

function GuestCountStep({ guests, guestEstimate, updateFormData, nextStep, prevStep }) {
  const [guestRange, setGuestRange] = useState(guests || '')
  const [estimate, setEstimate] = useState(guestEstimate || '')

  const guestRanges = [
    { value: '1-20', label: '1-20 guests', icon: '👥' },
    { value: '21-50', label: '21-50 guests', icon: '👨‍👩‍👧‍👦' },
    { value: '51-150', label: '51-150 guests', icon: '👪' },
    { value: '150+', label: '150+ guests', icon: '🎪' }
  ]

  const handleRangeChange = (value) => {
    setGuestRange(value)
    updateFormData('guests', value)
  }

  const handleEstimateChange = (e) => {
    const value = e.target.value
    setEstimate(value)
    updateFormData('guestEstimate', value)
  }

  const handleContinue = () => {
    if (!guestRange) {
      return
    }
    nextStep()
  }

  return (
    <div className="form-card active">
      <h2 className="question">How many guests are you expecting?</h2>
      <div className="options-grid">
        {guestRanges.map(range => (
          <label key={range.value} className="option-card">
            <input
              type="radio"
              name="guestRange"
              value={range.value}
              checked={guestRange === range.value}
              onChange={() => handleRangeChange(range.value)}
            />
            <span className="option-content">
              <span className="option-icon">{range.icon}</span>
              <span className="option-text">{range.label}</span>
            </span>
          </label>
        ))}
      </div>
      {guestRange && (
        <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            value={estimate}
            onChange={handleEstimateChange}
            placeholder="Enter your estimate (optional)"
            style={{ width: '100%' }}
          />
        </div>
      )}
      <div className="button-group">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn-next" onClick={handleContinue} disabled={!guestRange}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default GuestCountStep
