import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">🛍️ ShopEasy</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        {isAuthenticated ? (
          <>
            <Link to="/cart" className="nav-link">
              🛒 Cart
            </Link>
            <span className="nav-user">Hi, {user?.name?.split(" ")[0]}!</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes — require login */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <footer className="footer">
            <p>© 2024 ShopEasy — Practical 7: Authentication & Testing</p>
          </footer>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;