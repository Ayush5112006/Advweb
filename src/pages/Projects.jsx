import React, { useState } from 'react';
import Footer from '../components/Footer';

export default function Projects({ studentInfo, themeColor }) {
  // Meaningful state 1: Toggle visibility of detailed technical metrics/stats of projects
  const [showDetails, setShowDetails] = useState(false);

  const projects = [
    {
      title: 'Smart Alumni Association Platform',
      description: 'A state-of-the-art ecosystem designed to foster lifelong connections between engineering college departments and alumni with interactive career, event, and donation modules.',
      tags: ['Next.js 14', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'TypeScript', 'Lucide React'],
      details: 'Protected routes via Supabase Auth + RBAC, live job posting workflows with admin moderation queues, and real-time donation campaigns tracking.',
      githubLink: 'https://github.com/Ayush5112006/depstar',
      liveLink: 'https://alumni-connects-snowy.vercel.app/'
    },
    {
      title: 'Smart Transport Operations Platform',
      description: 'A Smart Transport Operations Platform designed to digitize fleet assets, dispatch lifecycles, maintenance logs, and financial expenses with strict business rules.',
      tags: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'RBAC'],
      details: 'Automated state transitions (vehicle/driver to "On Trip"), capacity limits validation, maintenance log triggers ("In Shop"), and live fleet utilization KPIs.',
      githubLink: 'https://github.com/Ayush5112006/Odoo-2026',
      liveLink: 'https://transitops-henna.vercel.app/'
    },
    {
      title: 'Hackathon Management Portal',
      description: 'A comprehensive, production-ready full-stack hackathon management platform featuring smart registrations, submissions, and judge scoring panels.',
      tags: ['Next.js', 'Prisma ORM', 'Tailwind CSS', 'SQLite', 'TypeScript', 'Jest'],
      details: 'Automated 5-metric scoring rubric with automatic averaging, Resend transactional emails, and >90% test coverage with 34+ Jest tests.',
      githubLink: 'https://github.com/Ayush5112006/dduhack#ddu-hackathon-management-portal',
      liveLink: 'https://dduhackathon.vercel.app/'
    },

  ];

  return (
    <section className="projects-section">
      <div className="section-container">
        <h2 className="section-title" style={{ color: themeColor }}>Projects</h2>
        <div style={{ marginBottom: '30px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDetails(!showDetails)}
            style={{ color: themeColor, borderColor: themeColor }}
          >
            {showDetails ? 'Hide Detailed Metrics' : 'Show Detailed Metrics'}
          </button>
        </div>

        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tech">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tech-tag">{tag}</span>
                  ))}
                </div>
              </div>

              {showDetails && (
                <div className="project-extra-details">
                  <strong>Technical Metrics:</strong>
                  <p style={{ marginTop: '8px' }}>{project.details}</p>
                </div>
              )}

              <div className="project-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                {project.githubLink && project.githubLink !== '#' && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '8px 16px', borderColor: themeColor, color: themeColor }}
                  >
                    GitHub Code
                  </a>
                )}
                {project.liveLink && project.liveLink !== '#' && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '8px 16px', backgroundColor: themeColor, borderColor: themeColor }}
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer
        email={studentInfo.email}
        github={studentInfo.github}
        linkedin={studentInfo.linkedin}
        name={studentInfo.name}
      />
    </section>
  );
}
