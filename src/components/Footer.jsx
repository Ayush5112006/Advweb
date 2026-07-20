import React from 'react';

export default function Footer({ email, github, linkedin, name }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="footer-section">
      <div className="footer-container">
        <div className="footer-info">
          <h3>Get In Touch</h3>
          <p>If you'd like to collaborate or just say hello, feel free to reach out!</p>
          <a 
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-email"
          >
            {email}
          </a>
        </div>
        <div className="footer-links">
          {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} {name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
