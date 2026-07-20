import React from 'react';

export default function About({ bio, education, interests }) {
  return (
    <section id="about" className="about-section">
      <div className="section-container">
        <h2 className="section-title">About Me</h2>
        <div className="about-grid">
          <div className="about-card bio-card">
            <h3>Who I Am</h3>
            <p>{bio}</p>
          </div>
          <div className="about-card details-card">
            <h3>Details</h3>
            <ul>
              <li><strong>Education:</strong> {education}</li>
              <li><strong>Interests:</strong> {interests.join(', ')}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
