import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight,
  faEllipsis
} from '@fortawesome/free-solid-svg-icons';
import '../../style/threads/Pagination.css';

const Pagination = ({ currentPage, totalPages }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visiblePages, setVisiblePages] = useState([]);

  // Генерация видимых номеров страниц с учетом текущей позиции
  useEffect(() => {
    const maxVisible = 5; // Максимальное количество видимых номеров
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    setVisiblePages(pages);
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', page);
    navigate({ search: searchParams.toString() });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button 
        className="page-btn" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Предыдущая страница"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      
      {/* Первая страница */}
      {!visiblePages.includes(1) && (
        <>
          <button
            className={`page-btn ${1 === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(1)}
          >
            1
          </button>
          {visiblePages[0] > 2 && <span className="page-ellipsis"><FontAwesomeIcon icon={faEllipsis} /></span>}
        </>
      )}
      
      {/* Основные страницы */}
      {visiblePages.map(page => (
        <button
          key={page}
          className={`page-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      {/* Последняя страница */}
      {!visiblePages.includes(totalPages) && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="page-ellipsis"><FontAwesomeIcon icon={faEllipsis} /></span>
          )}
          <button
            className={`page-btn ${totalPages === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        className="page-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Следующая страница"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

export default Pagination;