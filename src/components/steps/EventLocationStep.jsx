import { useState } from 'react'

function EventLocationStep({ eventLocation, updateFormData, nextStep, prevStep }) {
  const [location, setLocation] = useState(eventLocation || '')

  const handleLocationChange = (e) => {
    const value = e.target.value
    setLocation(value)
    updateFormData('eventLocation', value)
  }

  const handleContinue = () => {
    if (!location.trim()) {
      return
    }
    nextStep()
  }

  return (
    <div className="form-card active">
      <h2 className="question">Where will your event take place?</h2>
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={location}
          onChange={handleLocationChange}
          placeholder="Enter a suburb, eg: Griffith, ACT, 2603"
          style={{ width: '100%', padding: '12px', fontSize: '16px' }}
        />
      </div>
      <div className="button-group">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn-next" onClick={handleContinue} disabled={!location.trim()}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default EventLocationStep
