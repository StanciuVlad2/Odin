import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster, ToastBar, toast } from "react-hot-toast";
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
import VerifyEmail from './pages/VerifyEmail'
import Reservations from './pages/Reservations'
import TableManagement from './pages/TableManagement'
import CreateCocktail from './pages/CreateCocktail'
import AdminUsers from "./pages/AdminUsers";
import Stock from "./pages/Stock";
import Recipes from "./pages/Recipes";
import Orders from "./pages/Orders";

// Layout component cu Navigation și Footer persistent
function Layout() {
  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fdfaf6",
            color: "#2d5f3f",
            border: "2px solid #8bc395",
            borderRadius: "15px",
            padding: "0.75rem 1rem 0.75rem 1.25rem",
            fontSize: "1rem",
            fontWeight: "500",
          },
          success: {
            iconTheme: { primary: "#8bc395", secondary: "#fdfaf6" },
          },
          error: {
            iconTheme: { primary: "#e08ea8", secondary: "#fdfaf6" },
            style: {
              border: "2px solid #e08ea8",
            },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#7f8c8d",
                    fontSize: "1.2rem",
                    lineHeight: 1,
                    padding: "0 2px",
                    marginLeft: "4px",
                    flexShrink: 0,
                  }}
                  aria-label="Close notification"
                >
                  ×
                </button>
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
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
  );
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
          <Route path="reservations" element={<Reservations />} />
          <Route path="create-cocktail" element={<CreateCocktail />} />
          <Route path="verify-email" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["ROLE_GUEST"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="worker-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ROLE_WAITER",
                  "ROLE_CHEF",
                  "ROLE_MANAGER",
                  "ROLE_ADMIN",
                ]}
              >
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="table-management"
            element={
              <ProtectedRoute allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}>
                <TableManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="stock"
            element={
              <ProtectedRoute allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}>
                <Stock />
              </ProtectedRoute>
            }
          />
          <Route
            path="recipes"
            element={
              <ProtectedRoute
                allowedRoles={["ROLE_MANAGER", "ROLE_CHEF", "ROLE_ADMIN"]}
              >
                <Recipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ROLE_WAITER",
                  "ROLE_CHEF",
                  "ROLE_MANAGER",
                  "ROLE_ADMIN",
                ]}
              >
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized page */}
          <Route
            path="unauthorized"
            element={
              <div
                style={{
                  minHeight: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "1rem",
                  color: "#2d5f3f",
                }}
              >
                <h1>🚫 Unauthorized</h1>
                <p>You don't have permission to access this page.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
