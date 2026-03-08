import React from 'react';
import Navbar from '../components/layout/Navbar';
import ThreadList from '../components/threads/ThreadList';
import Footer from '../components/threads/Footer';
import { useThreads } from '../ThreadsContext';
import '../style/layout/ForumPage.css';

const ForumPage = () => {
  const { threads, loading, error } = useThreads();

  if (loading) return <div className="loading">Загрузка тредов...</div>;
  if (error) return <div className="error">Ошибка: {error.message || 'Неизвестная ошибка'}</div>;

  return (
    <div className="forum-page">
      <Navbar />
      <div className="forum-content">
        <ThreadList threads={threads} />
      </div>
      <Footer />
    </div>
  );
};

export default ForumPage;