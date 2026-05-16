import React from 'react';
import Header from '../components/layout/Header';
import BoardList from '../components/boards/BoardList';
import Footer from '../components/threads/Footer';

const Main = () => {
  return (
    <div className="forum-page">
      <Header />
      <div className="forum-content">
        <BoardList />
      </div>
      <Footer />
    </div>
  );
};

export default Main;