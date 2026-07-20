import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ name, role, themeColor }) {
  return (
    <header className="header-section">
      <div className="header-content">
        <h1 className="hero-title">
          Hi, I am <span style={{ color: themeColor }}>{name}</span>
        </h1>
        <p className="hero-subtitle">{role}</p>
        <div className="hero-cta">
          <Link to="/about" className="btn btn-primary" style={{ backgroundColor: themeColor, borderColor: themeColor }}>
            About Me
          </Link>
          <Link to="/skills" className="btn btn-secondary" style={{ color: themeColor, borderColor: themeColor }}>
            My Skills
          </Link>
        </div>
      </div>
      <div className="header-bg-glow" style={{ background: `radial-gradient(circle, ${themeColor}1a 0%, transparent 70%)` }}></div>
    </header>
  );
}
