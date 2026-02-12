function AdditionalInfoStep({ additionalInfo, updateFormData, nextStep, prevStep, submitting, hasSubmitted }) {
  const handleChange = (e) => {
    updateFormData('additionalInfo', e.target.value)
  }

  return (
    <div className="form-card active">
      <h2 className="question">Anything else we should know?</h2>
      <p className="subtext">Tell us more about your event (optional). This could be notes on what style of services you want.</p>
      <textarea
        value={additionalInfo}
        onChange={handleChange}
        placeholder="Share any special requirements or details..."
        disabled={submitting || hasSubmitted}
      />
      <div className="button-group">
        <button 
          type="button" 
          className="btn-back" 
          onClick={prevStep}
          disabled={submitting || hasSubmitted}
        >
          Back
        </button>
        <button 
          type="button" 
          className="btn-next" 
          onClick={nextStep}
          disabled={submitting || hasSubmitted}
        >
          {submitting ? 'Sending to our agent...' : hasSubmitted ? 'Submitted' : 'Send to our agent'}
        </button>
      </div>
    </div>
  )
}

export default AdditionalInfoStep
