import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import './App.css'

// Components
import Navigation from './components/Navigation'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Menu from './pages/Menu'
import Services from './pages/Services'
import Contact from './pages/Contact'

// Layout component cu Navigation și Footer persistent
function Layout() {
  return (
    <div className="app">
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
        </Route>
      </Routes>
    </Router>
  )
}

export default App
