import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavBar({ isLightMode, toggleTheme, themeColor }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" style={{ color: themeColor }}>
          Portfolio.
        </NavLink>
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/about" 
              className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
            >
              About
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/projects" 
              className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
            >
              Projects
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/skills" 
              className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
            >
              Skills
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `nav-links ${isActive ? 'active' : ''}`}
            >
              Contact
            </NavLink>
          </li>
          <li className="nav-item">
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              title="Toggle Light/Dark Mode"
            >
              {isLightMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
