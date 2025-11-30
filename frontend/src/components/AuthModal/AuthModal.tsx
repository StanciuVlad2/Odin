import { useState } from 'react'
import './AuthModal.css'

interface AuthModalProps {
  onClose: () => void
}

function AuthModal({ onClose }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement authentication logic
    console.log('Form submitted:', authMode)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="auth-tabs">
          <button 
            className={authMode === 'login' ? 'active' : ''}
            onClick={() => setAuthMode('login')}
          >
            Login
          </button>
          <button 
            className={authMode === 'register' ? 'active' : ''}
            onClick={() => setAuthMode('register')}
          >
            Register
          </button>
        </div>

        {authMode === 'login' ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Welcome Back</h2>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Create Account</h2>
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <input type="password" placeholder="Confirm Password" required />
            <button type="submit">Register</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AuthModal
