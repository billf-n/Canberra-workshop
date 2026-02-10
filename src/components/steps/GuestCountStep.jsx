function GuestCountStep({ guests, updateFormData, nextStep, prevStep }) {
  const handleChange = (e) => {
    updateFormData('guests', e.target.value)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      nextStep()
    }
  }

  return (
    <div className="form-card active">
      <h2 className="question">How many guests are you expecting?</h2>
      <input
        type="number"
        value={guests}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Number of guests"
        min="1"
      />
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

export default GuestCountStep
