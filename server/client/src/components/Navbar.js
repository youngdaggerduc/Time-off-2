import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Radian H.A. Logo" className="logo-img" />
          <span className="logo-text">Radian Time Sheet</span>
        </Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            {user.role === 'employee' && <Link to="/request">Request Time-Off</Link>}
            {user.role === 'boss' && <Link to="/calendar">Calendar</Link>}
            {user.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;