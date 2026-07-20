import React from 'react';

export default function Skills({ skillList }) {
  return (
    <section id="skills" className="skills-section">
      <div className="section-container">
        <h2 className="section-title">My Skills</h2>
        <div className="skills-grid">
          {skillList.map((skill, index) => {
            const isObject = typeof skill === 'object' && skill !== null;
            const name = isObject ? skill.name : skill;
            const level = isObject ? skill.level : 'Intermediate';
            const icon = isObject ? skill.icon : '🚀';

            return (
              <div key={index} className="skill-card">
                <span className="skill-icon">{icon}</span>
                <h3 className="skill-name">{name}</h3>
                <p className="skill-level">{level}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
