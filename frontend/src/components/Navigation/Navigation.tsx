import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AuthModal from '../AuthModal'
import { apiService } from '../../services/api'
import type { MeResponse } from '../../services/api'
import './Navigation.css'

function Navigation() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userInfo, setUserInfo] = useState<MeResponse | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const data = await apiService.me()
        setUserInfo(data)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setUserInfo(null)
    }
  }

  const handleTestMe = async () => {
    try {
      const data = await apiService.me()
      console.log('Me Response:', data)
      alert(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error('Error:', err)
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleLogout = async () => {
    try {
      await apiService.logout()
      setUserInfo(null)
      navigate('/')
      alert('Logged out successfully!')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const getDashboardPath = () => {
    if (!userInfo) return '/dashboard'
    
    const hasWorkerRole = userInfo.roles.some(role => 
      ['ROLE_WAITER', 'ROLE_CHEF', 'ROLE_MANAGER', 'ROLE_ADMIN'].includes(role)
    )
    
    return hasWorkerRole ? '/worker-dashboard' : '/dashboard'
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/">
              <h2>🍽️ Odin Restaurant</h2>
            </Link>
          </div>
          <ul className="nav-menu">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            {userInfo && userInfo.authenticated && (
              <li><Link to={getDashboardPath()}>Dashboard</Link></li>
            )}
          </ul>
          <div className="nav-buttons">
            {userInfo && userInfo.authenticated ? (
              <>
                <span className="user-email">{userInfo.email}</span>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                className="account-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}

export default Navigation
