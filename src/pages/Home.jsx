import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';
import Footer from '../components/Footer';

export default function Home({ studentInfo, skillList, themeColor }) {
  return (
    <>
      <Header
        name={studentInfo.name}
        role={studentInfo.role}
        themeColor={themeColor}
      />
      <About
        bio={studentInfo.bio}
        education={studentInfo.education}
        interests={studentInfo.interests}
      />
      <Skills skillList={skillList} />
      <Footer
        email={studentInfo.email}
        github={studentInfo.github}
        linkedin={studentInfo.linkedin}
        name={studentInfo.name}
      />
    </>
  );
}
