import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';

export default function Projects({ studentInfo, themeColor }) {
  // Meaningful state 1: Toggle visibility of detailed technical metrics/stats of projects
  const [showDetails, setShowDetails] = useState(false);

  // States for GitHub API Integration (Practical 3)
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [retryTrigger, setRetryTrigger] = useState(0); // Used to trigger re-fetch

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

  // Fetch GitHub Repositories on Mount and on Retry Trigger
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch repositories of Ayush5112006
    fetch('https://api.github.com/users/Ayush5112006/repos?sort=updated&per_page=10')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: Failed to fetch repositories (Status: ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          throw new Error("Invalid response data format.");
        }
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong while fetching data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="projects-section">
      <div className="section-container">
        <h2 className="section-title" style={{ color: themeColor }}>Featured Projects</h2>
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

        {/* --- GitHub Repositories Section (Practical 3) --- */}
        <div style={{ marginTop: '80px', borderTop: '1px solid var(--border-color)', paddingTop: '60px' }}>
          <h2 className="section-title" style={{ color: themeColor }}>Live GitHub Repositories</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Dynamically fetched from my public GitHub account.
          </p>

          {/* Search Input Filter */}
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search repositories by name..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ caretColor: themeColor }}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <span className="spinner" style={{ borderBottomColor: themeColor }}></span>
              <p style={{ color: 'var(--text-secondary)' }}>Retrieving repositories from GitHub...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="api-error-card">
                <div className="api-error-title">Unable to Load Repositories</div>
                <div className="api-error-desc">{error}</div>
                <button
                  className="btn btn-primary"
                  onClick={handleRetry}
                  style={{ backgroundColor: themeColor, borderColor: themeColor, fontSize: '0.9rem', padding: '8px 20px' }}
                >
                  🔄 Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* Success State & Repos Grid */}
          {!loading && !error && (
            <>
              {filteredRepos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No repositories match "{searchQuery}".
                </div>
              ) : (
                <div className="projects-grid">
                  {filteredRepos.map((repo) => (
                    <div key={repo.id} className="project-card" style={{ minHeight: '220px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <h3 className="project-title" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                            {repo.name}
                          </h3>
                          <span className="star-count">
                            ⭐ {repo.stargazers_count}
                          </span>
                        </div>
                        <p className="project-desc" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                          {repo.description || 'No description provided.'}
                        </p>

                        {repo.language && (
                          <div className="project-tech" style={{ marginBottom: '16px' }}>
                            <span className="tech-tag" style={{ fontSize: '0.7rem' }}>
                              {repo.language}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="project-actions" style={{ display: 'flex', marginTop: 'auto' }}>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '6px 14px', borderColor: themeColor, color: themeColor }}
                        >
                          View Repository ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
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
