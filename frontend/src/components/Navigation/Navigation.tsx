import { Link } from 'react-router-dom'
import { useState } from 'react'
import AuthModal from '../AuthModal'
import './Navigation.css'

function Navigation() {
  const [showAuthModal, setShowAuthModal] = useState(false)

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
          </ul>
          <button 
            className="account-btn"
            onClick={() => setShowAuthModal(true)}
          >
            Account
          </button>
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}

export default Navigation
