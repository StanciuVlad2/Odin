import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { apiService } from '../../services/api'
import type { MeResponse } from '../../services/api'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<MeResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!apiService.isAuthenticated()) {
          setLoading(false)
          return
        }

        const data = await apiService.me()
        setUserInfo(data)
      } catch (err) {
        console.error('Auth check failed:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: '#2d5f3f'
      }}>
        Loading...
      </div>
    )
  }

  if (!userInfo || !userInfo.authenticated || error) {
    return <Navigate to={redirectTo} replace />
  }

  // Check if user has any of the allowed roles
  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => 
      userInfo.roles.includes(role)
    )

    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
