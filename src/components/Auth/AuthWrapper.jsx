import { useState, useEffect } from 'react'
import { getCurrentUser, signOut } from 'aws-amplify/auth'
import SignIn from './SignIn'
import SignUp from './SignUp'

function AuthWrapper({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authView, setAuthView] = useState('signIn') // 'signIn' or 'signUp'

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSignInSuccess = () => {
    checkUser()
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="auth-container">
        {authView === 'signIn' ? (
          <SignIn 
            onSuccess={handleSignInSuccess}
            onSwitchToSignUp={() => setAuthView('signUp')}
          />
        ) : (
          <SignUp 
            onSuccess={() => setAuthView('signIn')}
            onSwitchToSignIn={() => setAuthView('signIn')}
          />
        )}
      </div>
    )
  }

  return (
    <>
      {children}
      <button className="btn-sign-out" onClick={handleSignOut}>
        Sign Out
      </button>
    </>
  )
}

export default AuthWrapper
