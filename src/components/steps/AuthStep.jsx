import { useState, useEffect } from 'react'
import { signIn, signUp, confirmSignUp, getCurrentUser } from 'aws-amplify/auth'

function AuthStep({ onSuccess, prevStep }) {
  const [authView, setAuthView] = useState('check') // 'check', 'signIn', 'signUp', 'verify'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkExistingUser()
  }, [])

  const checkExistingUser = async () => {
    try {
      const user = await getCurrentUser()
      // User is already signed in, automatically complete
      console.log('User already authenticated:', user)
      onSuccess(user)
    } catch (error) {
      // User not signed in, show auth options
      console.log('User not authenticated, showing sign in')
      setAuthView('signIn')
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn({
        username: email,
        password: password
      })
      const user = await getCurrentUser()
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
      const user = await getCurrentUser()
      onSuccess(user)
    } catch (err) {
      console.error('Verification error:', err)
      setError(err.message || 'Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  if (authView === 'check') {
    return (
      <div className="form-card active">
        <h2 className="question">Checking authentication...</h2>
        <div className="auth-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (authView === 'verify') {
    return (
      <div className="form-card active">
        <h2 className="question">Verify Your Email</h2>
        <p className="subtext">We sent a verification code to {email}</p>

        <form onSubmit={handleVerification}>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            required
          />

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button type="button" className="btn-back" onClick={() => setAuthView('signUp')}>
              Back
            </button>
            <button type="submit" className="btn-next" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Complete'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (authView === 'signUp') {
    return (
      <div className="form-card active">
        <h2 className="question">Create Your Account</h2>
        <p className="subtext">Sign up to save your event</p>

        <form onSubmit={handleSignUp}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            required
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button type="button" className="btn-back" onClick={prevStep}>
              Back
            </button>
            <button type="submit" className="btn-next" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="auth-switch-inline">
          Already have an account?{' '}
          <button type="button" className="btn-link" onClick={() => setAuthView('signIn')}>
            Sign in
          </button>
        </div>
      </div>
    )
  }

  // Default: Sign In view
  return (
    <div className="form-card active">
      <h2 className="question">Sign In to Continue</h2>
      <p className="subtext">Sign in to save your event</p>

      <form onSubmit={handleSignIn}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button type="button" className="btn-back" onClick={prevStep}>
            Back
          </button>
          <button type="submit" className="btn-next" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In & Complete'}
          </button>
        </div>
      </form>

      <div className="auth-switch-inline">
        Don't have an account?{' '}
        <button type="button" className="btn-link" onClick={() => setAuthView('signUp')}>
          Create account
        </button>
      </div>
    </div>
  )
}

export default AuthStep
