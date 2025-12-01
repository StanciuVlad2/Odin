import { useEffect, useState } from 'react'
import { apiService } from '../../services/api'
import './WorkerDashboard.css'

function WorkerDashboard() {
  const [userEmail, setUserEmail] = useState<string>('')
  const [userRoles, setUserRoles] = useState<string[]>([])

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const data = await apiService.me()
      setUserEmail(data.email || '')
      setUserRoles(data.roles || [])
    } catch (err) {
      console.error('Failed to load user info:', err)
    }
  }

  const getRoleDisplay = () => {
    if (userRoles.includes('ROLE_ADMIN')) return 'Admin'
    if (userRoles.includes('ROLE_MANAGER')) return 'Manager'
    if (userRoles.includes('ROLE_CHEF')) return 'Chef'
    if (userRoles.includes('ROLE_WAITER')) return 'Waiter'
    return 'Worker'
  }

  return (
    <div className="worker-dashboard">
      <div className="worker-container">
        <div className="worker-card">
          <div className="worker-icon">👨‍💼</div>
          <h1>Worker Dashboard</h1>
          <div className="worker-info">
            <p className="welcome-message">Welcome, {userEmail}!</p>
            <p className="role-badge">{getRoleDisplay()}</p>
          </div>
          <div className="worker-message">
            <p>
              This is the worker dashboard. As a staff member, you have access to 
              specialized tools and features for managing restaurant operations.
            </p>
            <p className="info-note">
              🔧 Worker-specific features coming soon!
            </p>
          </div>
          <div className="worker-features">
            <div className="feature-card">
              <span className="feature-icon">📋</span>
              <h3>Orders Management</h3>
              <p>View and manage customer orders</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Analytics</h3>
              <p>Track performance and statistics</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h3>Team Coordination</h3>
              <p>Collaborate with your team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerDashboard
