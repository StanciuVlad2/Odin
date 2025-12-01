import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './VerifyEmail.css'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const hasVerified = useRef(false)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    // Prevent duplicate verification calls
    if (hasVerified.current) {
      return
    }
    hasVerified.current = true

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/verify-email?token=${token}`)
      
      if (response.ok) {
        const message = await response.text()
        setStatus('success')
        setMessage(message)
        toast.success('Email verified successfully!')
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        const error = await response.text()
        setStatus('error')
        setMessage(error)
        toast.error(error)
      }
    } catch (err) {
      setStatus('error')
      setMessage('Failed to verify email. Please try again.')
      toast.error('Verification failed')
    }
  }

  return (
    <div className="verify-email-page">
      <div className="verify-container">
        {status === 'loading' && (
          <div className="verify-card loading">
            <div className="spinner"></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we confirm your email address</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-card success">
            <div className="icon-circle success-icon">
              <span>✓</span>
            </div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p className="redirect-message">Redirecting you to homepage...</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Homepage
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-card error">
            <div className="icon-circle error-icon">
              <span>✗</span>
            </div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Return to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
