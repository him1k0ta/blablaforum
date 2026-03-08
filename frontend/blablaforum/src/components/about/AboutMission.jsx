import React from 'react';
import '../../style/about/AboutMission.css';
import MissionCard from '../../components/about/MissionCard';
const AboutMission = () => {
  const missions = [
    {
      icon: '💡',
      title: 'Вдохновлять',
      description: 'Мы помогаем людям находить новые идеи и развивать творческое мышление'
    },
    {
      icon: '🤝',
      title: 'Объединять',
      description: 'Создаем сообщество единомышленников для продуктивного общения'
    },
    {
      icon: '🚀',
      title: 'Развивать',
      description: 'Предоставляем инструменты для профессионального и личностного роста'
    }
  ];

  return (
    <section className="about-mission">
      <div className="container">
        <h2>Наша миссия</h2>
        <div className="mission-grid">
          {missions.map((mission, index) => (
            <MissionCard 
              key={index}
              icon={mission.icon}
              title={mission.title}
              description={mission.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutMission;