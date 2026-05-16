import React from 'react';
import BoardList from '../components/boards/BoardList';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/threads/Footer';

const BoardsPage = () => {
  return (
    <div className="forum-page">
      <Navbar />
      <div className="forum-content">
        <BoardList />
      </div>
      <Footer />
    </div>
  );
};

export default BoardsPage;
