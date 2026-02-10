import { useState } from 'react'

function GuestCountStep({ guests, updateFormData, nextStep, prevStep }) {
  const [guestRange, setGuestRange] = useState(guests && guests.includes('+') ? '150+' : guests)
  const [customCount, setCustomCount] = useState('')

  const guestRanges = [
    { value: '1-20', label: '1-20 guests', icon: '👥' },
    { value: '21-50', label: '21-50 guests', icon: '👨‍👩‍👧‍👦' },
    { value: '51-150', label: '51-150 guests', icon: '👪' },
    { value: '150+', label: '150+ guests', icon: '🎪' }
  ]

  const handleRangeChange = (value) => {
    setGuestRange(value)
    if (value !== '150+') {
      updateFormData('guests', value)
      setCustomCount('')
    }
  }

  const handleCustomCountChange = (e) => {
    const value = e.target.value
    setCustomCount(value)
    if (value) {
      updateFormData('guests', `${value}+`)
    }
  }

  const handleContinue = () => {
    if (guestRange === '150+' && !customCount) {
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
      {guestRange === '150+' && (
        <input
          type="number"
          value={customCount}
          onChange={handleCustomCountChange}
          placeholder="Enter estimated number of guests"
          min="150"
        />
      )}
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

export default GuestCountStep
