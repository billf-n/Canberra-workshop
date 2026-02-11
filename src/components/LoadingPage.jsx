import { useEffect, useState } from 'react'

function LoadingPage({ onNavigate }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Set timer to redirect after 10 seconds
    const timer = setTimeout(() => {
      onNavigate('existing-events')
    }, 10000)

    // Animate progress bar every 50ms
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [onNavigate])

  return (
    <div className="loading-page-container">
      <div className="loading-page-content">
        <div className="loading-icon-wrapper">
          <div className="loading-pulse"></div>
          <svg className="loading-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
        </div>
        
        <h2 className="loading-title">Processing Your Event</h2>
        <p className="loading-subtitle">Our AI agent is analyzing your event details and finding the best vendors for you.</p>
        
        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div 
              className="loading-progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="loading-percentage">{progress}%</p>
        </div>
        
        <p className="loading-note">You'll be redirected to your events page shortly...</p>
      </div>
    </div>
  )
}

export default LoadingPage