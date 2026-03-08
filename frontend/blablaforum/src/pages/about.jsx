import React from 'react';
import AboutHero from '../components/about/AboutHero.jsx';
import AboutMission from '../components/about/AboutMission.jsx';
import AboutStory from '../components/about/AboutStory.jsx';
import '../style/layout/ForumPage.css';
import AboutFooter from '../components/about/AboutFooter';
import Navbar from '../components/layout/Navbar';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      <AboutHero />
      <AboutMission />
      <AboutStory />
      <AboutFooter />
    </div>
  );
};

export default About;