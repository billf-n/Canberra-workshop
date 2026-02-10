import { useState } from 'react'

function ServicesStep({ services, updateFormData, nextStep, prevStep, error, setError }) {
  const [customService, setCustomService] = useState('')

  const serviceOptions = [
    { value: 'catering', icon: '🍽️', label: 'Catering' },
    { value: 'photography', icon: '📸', label: 'Photography' },
    { value: 'videography', icon: '🎥', label: 'Videography' },
    { value: 'music', icon: '🎵', label: 'Music/DJ' },
    { value: 'decoration', icon: '🎨', label: 'Decoration' },
    { value: 'venue', icon: '🏛️', label: 'Venue' },
    { value: 'entertainment', icon: '🎭', label: 'Entertainment' },
    { value: 'transportation', icon: '🚗', label: 'Transportation' }
  ]

  const handleServiceToggle = (value) => {
    const newServices = services.includes(value)
      ? services.filter(s => s !== value)
      : [...services, value]
    updateFormData('services', newServices)
    if (newServices.length > 0) {
      setError('')
    }
  }

  const handleAddCustomService = () => {
    if (customService.trim()) {
      const newServices = [...services, customService.trim()]
      updateFormData('services', newServices)
      setCustomService('')
      if (newServices.length > 0) {
        setError('')
      }
    }
  }

  const handleRemoveService = (service) => {
    const newServices = services.filter(s => s !== service)
    updateFormData('services', newServices)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomService()
    }
  }

  const isPresetService = (service) => {
    return serviceOptions.some(option => option.value === service)
  }

  return (
    <div className="form-card active">
      <h2 className="question">Which services do you need?</h2>
      <p className="subtext">Select all that apply</p>
      <div className="checkbox-grid">
        {serviceOptions.map(service => (
          <label key={service.value} className="checkbox-card">
            <input
              type="checkbox"
              name="services"
              value={service.value}
              checked={services.includes(service.value)}
              onChange={() => handleServiceToggle(service.value)}
            />
            <span className="checkbox-content">
              <span className="checkbox-icon">{service.icon}</span>
              <span className="checkbox-text">{service.label}</span>
            </span>
          </label>
        ))}
      </div>
      
      <div className="custom-service-input">
        <input
          type="text"
          value={customService}
          onChange={(e) => setCustomService(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a custom service to search for..."
        />
        <button 
          type="button" 
          className="btn-add-service"
          onClick={handleAddCustomService}
        >
          Add
        </button>
      </div>

      {services.filter(s => !isPresetService(s)).length > 0 && (
        <div className="custom-services-list">
          <p className="subtext">Custom services:</p>
          <div className="service-tags">
            {services.filter(s => !isPresetService(s)).map((service, index) => (
              <div key={index} className="service-tag">
                <span>{service}</span>
                <button 
                  type="button" 
                  className="btn-remove-service"
                  onClick={() => handleRemoveService(service)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      <div className="button-group">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn-next" onClick={nextStep}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default ServicesStep
