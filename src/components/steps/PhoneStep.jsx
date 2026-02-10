function PhoneStep({ phone, updateFormData, handleSubmit, prevStep }) {
  const handleChange = (e) => {
    updateFormData('phone', e.target.value)
  }

  return (
    <div className="form-card active">
      <h2 className="question">What's your phone number?</h2>
      <input
        type="tel"
        value={phone}
        onChange={handleChange}
        placeholder="(555) 123-4567"
      />
      <div className="button-group">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
        <button type="submit" className="btn-submit" onClick={handleSubmit}>
          Submit Request
        </button>
      </div>
    </div>
  )
}

export default PhoneStep
