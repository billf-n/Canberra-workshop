import { useState } from 'react'

function BudgetStep({ budget, updateFormData, nextStep, prevStep }) {
  const [budgetRange, setBudgetRange] = useState(budget || '')

  const budgetRanges = [
    { value: 'under-5k', label: 'Under $5,000', icon: '💵' },
    { value: '5k-10k', label: '$5,000 - $10,000', icon: '💰' },
    { value: '10k-25k', label: '$10,000 - $25,000', icon: '💸' },
    { value: '25k-50k', label: '$25,000 - $50,000', icon: '💎' },
    { value: '50k+', label: '$50,000+', icon: '🏆' }
  ]

  const handleBudgetChange = (value) => {
    setBudgetRange(value)
    updateFormData('budget', value)
  }

  const handleContinue = () => {
    if (!budgetRange) {
      return
    }
    nextStep()
  }

  return (
    <div className="form-card active">
      <h2 className="question">What's your estimated budget?</h2>
      <div className="options-grid">
        {budgetRanges.map(range => (
          <label key={range.value} className="option-card">
            <input
              type="radio"
              name="budgetRange"
              value={range.value}
              checked={budgetRange === range.value}
              onChange={() => handleBudgetChange(range.value)}
            />
            <span className="option-content">
              <span className="option-icon">{range.icon}</span>
              <span className="option-text">{range.label}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="button-group">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn-next" onClick={handleContinue} disabled={!budgetRange}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default BudgetStep
