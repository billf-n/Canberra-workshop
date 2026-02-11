import { useState } from 'react'
import { signIn, signUp, confirmSignUp, fetchUserAttributes } from 'aws-amplify/auth'

function AuthPage({ onSuccess, onBack }) {
  const [authView, setAuthView] = useState('signIn') // 'signIn', 'signUp', 'verify'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn({
        username: email,
        password: password
      })
      
      // Get user attributes
      const attributes = await fetchUserAttributes()
      const user = {
        userId: attributes.sub,
        email: attributes.email,
        name: attributes.name || ''
      }
      
      onSuccess(user)
    } catch (err) {
      console.error('Sign in error:', err)
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)

    try {
      await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            name: name
          }
        }
      })
      setAuthView('verify')
    } catch (err) {
      console.error('Sign up error:', err)
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode
      })
      
      // Auto sign in after verification
      await signIn({
        username: email,
        password: password
      })
      
      // Get user attributes
      const attributes = await fetchUserAttributes()
      const user = {
        userId: attributes.sub,
        email: attributes.email,
        name: attributes.name || ''
      }
      
      onSuccess(user)
    } catch (err) {
      console.error('Verification error:', err)
      setError(err.message || 'Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  if (authView === 'verify') {
    return (
      <div className="auth-page">
        <div className="auth-page-card">
          <button className="btn-back-link" onClick={onBack}>
            ← Back to Home
          </button>
          
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">
            We sent a verification code to {email}
          </p>

          <form onSubmit={handleVerification} className="auth-form">
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn-auth-primary"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="auth-switch">
            <button 
              type="button"
              className="btn-link" 
              onClick={() => setAuthView('signUp')}
            >
              Back to sign up
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (authView === 'signUp') {
    return (
      <div className="auth-page">
        <div className="auth-page-card">
          <button className="btn-back-link" onClick={onBack}>
            ← Back to Home
          </button>
          
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Sign up to start planning your event</p>

          <form onSubmit={handleSignUp} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
              />
              <small className="form-hint">
                Must contain uppercase, lowercase, number, and special character
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn-auth-primary"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Already have an account?{' '}
              <button 
                type="button"
                className="btn-link" 
                onClick={() => setAuthView('signIn')}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Default: Sign In view
  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <button className="btn-back-link" onClick={onBack}>
          ← Back to Home
        </button>
        
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue planning your event</p>

        <form onSubmit={handleSignIn} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="btn-auth-primary"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Don't have an account?{' '}
            <button 
              type="button"
              className="btn-link" 
              onClick={() => setAuthView('signUp')}
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
