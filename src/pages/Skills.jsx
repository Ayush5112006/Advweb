import React, { useState } from 'react';
import Footer from '../components/Footer';

export default function SkillsPage({ studentInfo, themeColor }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Frontend', 'Backend', 'Database & Tools', 'Mobile', 'Data Science'];

  const skillsData = [
    { name: 'React / Next.js', category: 'Frontend', level: 'Advanced', percent: 90, icon: '⚛️', desc: 'Component architecture, Hooks, Context, Server Components, SSR/SSG workflows.' },
    { name: 'JavaScript (ES6+)', category: 'Frontend', level: 'Advanced', percent: 95, icon: '💛', desc: 'Asynchronous patterns, DOM manipulation, closures, and modern ES features.' },
    { name: 'HTML5 & CSS3', category: 'Frontend', level: 'Advanced', percent: 90, icon: '🎨', desc: 'Semantic layouts, Flexbox/Grid, custom properties, and responsive design systems.' },
    { name: 'Tailwind / Vanilla CSS', category: 'Frontend', level: 'Advanced', percent: 85, icon: '💅', desc: 'Utility-first styling, CSS variables, and modern responsive layouts.' },
    { name: 'Node.js & Express', category: 'Backend', level: 'Intermediate', percent: 75, icon: '🟢', desc: 'RESTful API construction, middleware, routing, and server-side logic.' },
    { name: 'PostgreSQL & SQL', category: 'Database & Tools', level: 'Intermediate', percent: 80, icon: '🐘', desc: 'Relational database design, query optimization, and schema management.' },
    { name: 'Supabase / Firebase', category: 'Database & Tools', level: 'Intermediate', percent: 80, icon: '⚡', desc: 'BaaS integration, authentication, realtime subscriptions, and database rules.' },
    { name: 'Git & GitHub', category: 'Database & Tools', level: 'Intermediate', percent: 85, icon: '🐙', desc: 'Version control, branching strategies, PR reviews, and GitHub Actions CI/CD.' },
    { name: 'TypeScript', category: 'Frontend', level: 'Intermediate', percent: 70, icon: '💙', desc: 'Type safety, interfaces, generics, and strict compiler configurations.' },
    { name: 'Flutter', category: 'Mobile', level: 'Intermediate', percent: 80, icon: '💙', desc: 'Cross-platform mobile application development, state management, and custom widget layouts.' },
    { name: 'Dart', category: 'Mobile', level: 'Intermediate', percent: 80, icon: '🎯', desc: 'Strongly-typed object-oriented programming, async stream handling, and package management.' },
    { name: 'Python', category: 'Data Science', level: 'Intermediate', percent: 85, icon: '🐍', desc: 'Data analysis, script automation, machine learning pipelines, and packages like Pandas, NumPy, Scikit-Learn.' },
    { name: 'Power BI Desktop', category: 'Data Science', level: 'Intermediate', percent: 80, icon: '📊', desc: 'Interactive dashboard creation, DAX modeling, data shaping, and business intelligence reports.' },
    { name: 'Tableau', category: 'Data Science', level: 'Intermediate', percent: 75, icon: '📈', desc: 'Data visualization, worksheet design, dashboard sharing, and connection to multiple data sources.' }
  ];

  const filteredSkills = skillsData.filter(skill => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <section className="skills-page-section">
        <div className="section-container">
          <h1 className="section-title" style={{ color: themeColor }}>Technical Expertise</h1>
          <p className="skills-subtitle">
            A comprehensive mapping of my engineering tools, programming languages, and development methodologies.
          </p>

          {/* Controls Container */}
          <div className="skills-controls">
            {/* Search */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search skills..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-tab-btn ${selectedCategory === category ? 'active' : ''}`}
                  style={{
                    borderColor: selectedCategory === category ? themeColor : 'transparent',
                    color: selectedCategory === category ? themeColor : 'var(--text-secondary)'
                  }}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Skills Grid */}
          <div className="skills-detailed-grid">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill, index) => (
                <div key={index} className="skill-detail-card">
                  <div className="skill-card-header">
                    <span className="skill-card-icon">{skill.icon}</span>
                    <div>
                      <h3 className="skill-card-name">{skill.name}</h3>
                      <span className="skill-category-tag">{skill.category}</span>
                    </div>
                  </div>
                  
                  <p className="skill-card-desc">{skill.desc}</p>
                  
                  <div className="skill-progress-wrapper">
                    <div className="skill-progress-info">
                      <span className="skill-level-text" style={{ color: themeColor }}>{skill.level}</span>
                      <span className="skill-percent-text">{skill.percent}%</span>
                    </div>
                    <div className="skill-progress-bg">
                      <div 
                        className="skill-progress-bar" 
                        style={{ 
                          width: `${skill.percent}%`,
                          backgroundColor: themeColor
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-skills-found">
                <p>No skills match your query. Try searching for something else!</p>
              </div>
            )}
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
