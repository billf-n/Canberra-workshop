import { useEffect, useState } from 'react'

function LoadingPage({ onNavigate }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Set timer to redirect after 5 seconds
    const timer = setTimeout(() => {
      onNavigate('landing')
    }, 10000)

    // Animate progress bar every 50ms
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1 // 100 / 5000 * 50 = 1% every 50ms
      })
    }, 50)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [onNavigate])

  return (
    <div style={{ textAlign: 'center', marginTop: '100px', padding: '0 20px' }}>
      <h2>Processing your event...</h2>
      <p>The agent is analyzing your event data.</p>
      <p>We will first jump back to the Home Page while waiting</p>

      <div style={{
        marginTop: '40px',
        width: '100%',
        maxWidth: '400px',
        height: '20px',
        backgroundColor: '#e0e0e0',
        borderRadius: '10px',
        margin: '40px auto 0'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#4caf50',
          borderRadius: '10px',
          transition: 'width 0.05s linear'
        }}></div>
      </div>
      <p>{progress}%</p>
    </div>
  )
}

export default LoadingPage