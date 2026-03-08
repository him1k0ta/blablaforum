import React from 'react';
import '../../style/about/AboutStory.css';
import TimelineItem from '../../components/about/TimelineItem';

const AboutStory = () => {
  const timelineData = [
    {
      year: '2020',
      title: 'Рождение идеи',
      description: 'Небольшая группа энтузиастов решила создать площадку для свободного обмена знаниями'
    },
    {
      year: '2021',
      title: 'Первый релиз',
      description: 'Запущена бета-версия платформы с базовыми функциями форума'
    },
    {
      year: '2023',
      title: 'Новые возможности',
      description: 'Добавлены системы рейтингов, бейджей и персональных блогов'
    }
  ];

  return (
    <section className="about-story">
      <div className="container">
        <h2>Наша история</h2>
        <div className="timeline">
          {timelineData.map((item, index) => (
            <TimelineItem
              key={index}
              year={item.year}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStory;