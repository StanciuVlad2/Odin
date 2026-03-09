import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast'
import AuthModal from '../AuthModal'
import { apiService } from '../../services/api'
import type { MeResponse } from '../../services/api'
import './Navigation.css'

function Navigation() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userInfo, setUserInfo] = useState<MeResponse | null>(null)
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const data = await apiService.me();
        setUserInfo(data);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUserInfo(null);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUserInfo(null);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const getDashboardPath = () => {
    if (!userInfo) return "/dashboard";

    const hasWorkerRole = userInfo.roles.some((role) =>
      ["ROLE_WAITER", "ROLE_CHEF", "ROLE_MANAGER", "ROLE_ADMIN"].includes(role),
    );

    return hasWorkerRole ? "/worker-dashboard" : "/dashboard";
  };

  const isManager = () => {
    return userInfo?.roles.some((role) =>
      ["ROLE_MANAGER", "ROLE_ADMIN"].includes(role),
    );
  };

  const isChefOrManager = () => {
    return userInfo?.roles.some((role) =>
      ["ROLE_CHEF", "ROLE_MANAGER", "ROLE_ADMIN"].includes(role),
    );
  };

  const isWorker = () => {
    return userInfo?.roles.some((role) =>
      ["ROLE_WAITER", "ROLE_CHEF", "ROLE_MANAGER", "ROLE_ADMIN"].includes(role),
    );
  };

  const isAdmin = () => {
    return userInfo?.roles.includes("ROLE_ADMIN");
  };

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
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/menu">Menu</Link>
            </li>
            <li>
              <Link to="/reservations">Reservations</Link>
            </li>
            <li>
              <Link to="/create-cocktail">Create Cocktail</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>

          {userInfo && userInfo.authenticated && (
            <div className="nav-role-menu" ref={dropdownRef}>
              <button
                className={`hamburger-btn ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Role menu"
                aria-expanded={menuOpen}
              >
                <span />
                <span />
                <span />
              </button>

              {menuOpen && (
                <div className="role-dropdown">
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isWorker() && (
                    <Link to="/orders" onClick={() => setMenuOpen(false)}>
                      Orders
                    </Link>
                  )}
                  {isChefOrManager() && (
                    <Link to="/recipes" onClick={() => setMenuOpen(false)}>
                      Recipes
                    </Link>
                  )}
                  {isManager() && (
                    <Link
                      to="/table-management"
                      onClick={() => setMenuOpen(false)}
                    >
                      Manage Tables
                    </Link>
                  )}
                  {isManager() && (
                    <Link to="/stock" onClick={() => setMenuOpen(false)}>
                      Stock
                    </Link>
                  )}
                  {isAdmin() && (
                    <Link to="/admin/users" onClick={() => setMenuOpen(false)}>
                      Users
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="nav-buttons">
            {userInfo && userInfo.authenticated ? (
              <>
                <span className="user-email">{userInfo.email}</span>
                <button className="logout-btn" onClick={handleLogout}>
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

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default Navigation
