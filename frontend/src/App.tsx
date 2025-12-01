import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Components
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Menu from './pages/Menu'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import WorkerDashboard from './pages/WorkerDashboard'

// Layout component cu Navigation și Footer persistent
function Layout() {
  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fdfaf6',
            color: '#2d5f3f',
            border: '2px solid #8bc395',
            borderRadius: '15px',
            padding: '1rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#8bc395',
              secondary: '#fdfaf6',
            },
          },
          error: {
            iconTheme: {
              primary: '#e08ea8',
              secondary: '#fdfaf6',
            },
          },
        }}
      />
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Odin Restaurant. All rights reserved.</p>
          <p>Follow us on social media: Facebook | Instagram | Twitter</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="menu" element={<Menu />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Protected Routes */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_GUEST']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="worker-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_WAITER', 'ROLE_CHEF', 'ROLE_MANAGER', 'ROLE_ADMIN']}>
                <WorkerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Unauthorized page */}
          <Route 
            path="unauthorized" 
            element={
              <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                color: '#2d5f3f'
              }}>
                <h1>🚫 Unauthorized</h1>
                <p>You don't have permission to access this page.</p>
              </div>
            } 
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
