import React from 'react';
import Footer from '../components/Footer';

export default function AboutPage({ studentInfo, themeColor }) {
  // Experience timeline / achievements
  const milestones = [
    {
      year: '2024 - Present',
      title: 'B.Tech. in Computer Science',
      institution: 'CHARUSAT University (Class of 2028)',
      desc: 'Focusing on database architectures, algorithms, frontend frameworks, and full-stack software development.'
    },
    {
      year: '2023',
      title: 'High School Graduation',
      institution: 'Science Stream',
      desc: 'Formed a strong base in mathematics, physics, and computer applications.'
    }
  ];

  return (
    <>
      <section className="about-page-section">
        <div className="section-container">
          <h1 className="section-title" style={{ color: themeColor }}>About Me</h1>

          <div className="about-page-grid">
            {/* Biography & Story */}
            <div className="about-page-card intro-card">
              <h2 className="about-card-title">My Journey</h2>
              <p className="about-text-p">{studentInfo.bio}</p>
              <p className="about-text-p">
                I thrive on solving complex frontend design problems, engineering responsive user interfaces,
                and translating product wireframes into interactive, high-performance web applications.
              </p>

              <div className="personal-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-val">Gujarat, India</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-val">{studentInfo.email}</span>
                </div>
              </div>
            </div>

            {/* Core Focus / Specialization */}
            <div className="about-page-card focus-card">
              <h2 className="about-card-title">Interests & Hobbies</h2>
              <div className="interests-badges">
                {studentInfo.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="interest-badge-item"
                    style={{ borderColor: themeColor, color: themeColor }}
                  >
                    🚀 {interest}
                  </span>
                ))}
              </div>

              <h2 className="about-card-title" style={{ marginTop: '30px' }}>What I Do</h2>
              <ul className="what-i-do-list">
                <li>🎨 <strong>UI/UX Prototyping:</strong> Designing state-of-the-art mockups and layouts.</li>
                <li>⚡ <strong>Full-Stack Apps:</strong> Building REST APIs and relational database architectures.</li>
                <li>📈 <strong>Performance Optimization:</strong> Writing lean, optimized component code.</li>
              </ul>
            </div>
          </div>

          {/* Education Timeline */}
          <div className="education-timeline-container">
            <h2 className="timeline-section-title">Education & Milestones</h2>
            <div className="timeline-vertical">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="timeline-node">
                  <div className="timeline-badge" style={{ backgroundColor: themeColor }} />
                  <div className="timeline-content-card">
                    <span className="timeline-year" style={{ color: themeColor }}>{milestone.year}</span>
                    <h3 className="timeline-title">{milestone.title}</h3>
                    <h4 className="timeline-inst">{milestone.institution}</h4>
                    <p className="timeline-desc">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer
        email={studentInfo.email}
        github={studentInfo.github}
        linkedin={studentInfo.linkedin}
        name={studentInfo.name}
      />
    </>
  );
}
