import { useState } from 'react'

function BudgetStep({ budget, updateFormData, nextStep, prevStep }) {
  const [budgetRange, setBudgetRange] = useState(budget || '')

  const budgetRanges = [
    { value: '<500', label: 'Under $500', icon: '💵' },
    { value: '500-1000', label: '$500 - $1,000', icon: '💸' },
    { value: '1000-5000', label: '$1,000 - $5,000', icon: '💎' },
    { value: '5000-20000', label: '$5,000 - $20,000', icon: '🏆' },
    { value: '>20000', label: '$20,000+', icon: '🏆' }
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
              {/* <span className="option-icon">{range.icon}</span> */}
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
