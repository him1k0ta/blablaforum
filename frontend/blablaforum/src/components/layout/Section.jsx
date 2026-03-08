import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../style/main/Section.css';
import vector from '../../assets/imagesm/vector.png';
import vector2 from '../../assets/imagesm/vector2.png';

const Content = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const allColumns = [
    {
      title: "Социальное",
      items: [
        { text: "Знакомства и приветствия", path: "/social/acquaintance" },
        { text: "Поиск единомышленников", path: "/social/like-minded" },
        { text: "Флудилка (оффтоп)", path: "/social/offtop" },
        { text: "Душевные разговоры", path: "/social/heart-to-heart" },
        { text: "Советы новичкам", path: "/social/advice" },
        { text: "Психология общения", path: "/social/psychology" }
      ]
    },
    {
      title: "Развитие",
      items: [
        { text: "Образование и курсы", path: "/development/education" },
        { text: "Саморазвитие и продуктивность", path: "/development/self-improvement" },
        { text: "Обсуждения и диалоги", path: "/development/discussions" },
        { text: "Работа и карьера", path: "/development/career" },
        { text: "Хобби и увлечения", path: "/development/hobbies" },
        { text: "Личные истории преодоления", path: "/development/stories" }
      ]
    },
    {
      title: "Развлечения",
      items: [
        { text: "Мемы и демотиваторы", path: "/entertainment/memes" },
        { text: "Весёлые истории", path: "/entertainment/funny-stories" },
        { text: "Картинки и приколы", path: "/entertainment/pics" },
        { text: "Игры и развлечения", path: "/entertainment/games" },
        { text: "Ностальгия и ретро", path: "/entertainment/retro" },
        { text: "Маленькие радости", path: "/entertainment/little-joys" }
      ]
    },
    {
      title: "Технологии",
      items: [
        { text: "Программирование", path: "/technology/programming" },
        { text: "Гаджеты и устройства", path: "/technology/gadgets" },
        { text: "Искусственный интеллект", path: "/technology/ai" },
        { text: "Кибербезопасность", path: "/technology/cybersecurity" },
        { text: "Новинки технологий", path: "/technology/news" },
        { text: "Обзоры софта", path: "/technology/reviews" }
      ]
    },
    {
      title: "Искусство",
      items: [
        { text: "Живопись и рисунок", path: "/art/painting" },
        { text: "Фотография", path: "/art/photography" },
        { text: "Музыка", path: "/art/music" },
        { text: "Литература", path: "/art/literature" },
        { text: "Кино и театр", path: "/art/cinema" },
        { text: "Дизайн", path: "/art/design" }
      ]
    },
    {
      title: "Путешествия",
      items: [
        { text: "Советы путешественникам", path: "/travel/tips" },
        { text: "Отзывы о странах", path: "/travel/reviews" },
        { text: "Фотоотчёты", path: "/travel/photos" },
        { text: "Лайфхаки", path: "/travel/lifehacks" },
        { text: "Культурные особенности", path: "/travel/culture" },
        { text: "Бюджетные поездки", path: "/travel/budget" }
      ]
    }
  ];

  // Разбиваем на группы по 3 колонки
  const columnsPerPage = 3;
  const totalPages = Math.ceil(allColumns.length / columnsPerPage);
  const startIdx = currentPage * columnsPerPage;
  const visibleColumns = allColumns.slice(startIdx, startIdx + columnsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  return (
    <section className="content-section">
      <button className="nav-arrow left" onClick={prevPage}>
        <img src={vector} alt="Предыдущая страница" />
      </button>

      {visibleColumns.map((column, index) => (
        <div key={`${currentPage}-${index}`} className="column">
          <h2 className="column-title">{column.title}</h2>
          <ul className="column-list">
            {column.items.map((item, i) => (
              <li key={i} className="column-item">
                <Link 
                  to={item.path} 
                  className="thread-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="link-text">{item.text}</span>
                  <span className="link-underline"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button className="nav-arrow right" onClick={nextPage}>
        <img src={vector2} alt="Следующая страница" />
      </button>
    </section>
  );
};

export default Content;