function StepCounter({ currentStep, totalSteps }) {
  return (
    <div className="step-counter">
      <span id="currentStep">{currentStep}</span> / <span id="totalSteps">{totalSteps}</span>
    </div>
  )
}

export default StepCounter
