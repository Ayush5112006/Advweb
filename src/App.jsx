import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import About from './pages/About';
import Tasks from './pages/Tasks';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';



function App() {
  // Theme options for inline styling
  const themes = [
    { name: 'Sunset Orange', color: '#ff5e36' },
    { name: 'Electric Indigo', color: '#6366f1' },
    { name: 'Emerald Green', color: '#10b981' },
    { name: 'Royal Gold', color: '#f59e0b' }
  ];

  const [themeColor, setThemeColor] = useState(themes[1].color); // Default Electric Indigo
  
  // Theme state for Light/Dark mode
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isLightMode]);

  const studentInfo = {
    name: 'Thummar Ayush',
    role: 'Computer Science & Full-Stack Developer Student',
    bio: 'Passionate computer science student specializing in building high-performance web applications. Enthusiastic about clean code, responsive design, and exploring cutting-edge frontend technologies.',
    education: 'Bachelor of Science in Computer Science and Engineering At CHARUSAT University (Class of 2028)',
    interests: ['Web Development', 'Machine Learning', 'Open Source', 'UI/UX Design', 'App Development'],
    email: 'thummarayush05@gmail.com',
    github: 'https://github.com/Ayush5112006/',
    linkedin: 'https://linkedin.com/in/ayush-thummar-471720309'
  };

  const skillList = [
    { name: 'React / Next.js', level: 'Advanced', icon: '⚛️' },
    { name: 'JavaScript (ES6+)', level: 'Advanced', icon: '💛' },
    { name: 'HTML5 & CSS3', level: 'Advanced', icon: '🎨' },
    { name: 'Node.js & Express', level: 'Intermediate', icon: '🟢' },
    { name: 'Tailwind / Vanilla CSS', level: 'Advanced', icon: '💅' },
    { name: 'Git & GitHub', level: 'Intermediate', icon: '🐙' },
    { name: 'Flutter', level: 'Intermediate', icon: '💙' },
    { name: 'Dart', level: 'Intermediate', icon: '🎯' },
    { name: 'Python', level: 'Intermediate', icon: '🐍' },
    { name: 'Power BI Desktop', level: 'Intermediate', icon: '📊' },
    { name: 'Tableau', level: 'Intermediate', icon: '📈' }
  ];

  return (
    <Router>
      <div className="app-wrapper">
        {/* Floating Theme Selector */}
        <div className="theme-selector-bubble">
          <span className="theme-bubble-label">Accent:</span>
          <div className="theme-circles">
            {themes.map((t) => (
              <button
                key={t.name}
                className={`theme-circle ${themeColor === t.color ? 'active-theme' : ''}`}
                style={{ backgroundColor: t.color }}
                title={t.name}
                onClick={() => setThemeColor(t.color)}
              />
            ))}
          </div>
        </div>

        <NavBar 
          isLightMode={isLightMode} 
          toggleTheme={toggleTheme} 
          themeColor={themeColor} 
        />

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  studentInfo={studentInfo} 
                  skillList={skillList} 
                  themeColor={themeColor} 
                />
              } 
            />
            <Route 
              path="/projects" 
              element={<Projects studentInfo={studentInfo} themeColor={themeColor} />} 
            />
            <Route 
              path="/about" 
              element={<About studentInfo={studentInfo} themeColor={themeColor} />} 
            />
            <Route 
              path="/skills" 
              element={<Skills studentInfo={studentInfo} themeColor={themeColor} />} 
            />
            <Route 
              path="/tasks" 
              element={<Tasks studentInfo={studentInfo} themeColor={themeColor} />} 
            />
            <Route 
              path="/contact" 
              element={
                <Contact 
                  studentInfo={studentInfo} 
                  themeColor={themeColor} 
                />
              } 
            />
            <Route 
              path="*" 
              element={<NotFound themeColor={themeColor} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
