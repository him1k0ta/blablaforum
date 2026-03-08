import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faComment, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faEye as farEye, faComment as farComment, faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import Button from '../../components/buttons/Button';
import '../../style/threads/ThreadItem.css';

const ThreadItem = ({ thread }) => {
  const navigate = useNavigate();

  const handleThreadClick = () => {
    navigate(`/threads/${thread.id}`);
  };

  const handleReplyClick = (e) => {
    e.stopPropagation();
    console.log('Reply to thread', thread.id);
  };

  return (
    <div className="thread" onClick={handleThreadClick}>
      <div className="thread-header">
        <div className="thread-title">{thread.title}</div>
        <div className="thread-meta">
          <span className="thread-author">{thread.author}</span>
          <span className="thread-date">{thread.date}</span>
          <span className="thread-category">{thread.category}</span>
        </div>
      </div>
      <div className="thread-content">
        {thread.content}
      </div>
      <div className="thread-footer">
        <div className="thread-stats">
          <span className="thread-stat">
            <FontAwesomeIcon icon={farEye} /> {thread.views}
          </span>
          <span className="thread-stat">
            <FontAwesomeIcon icon={farComment} /> {thread.comments}
          </span>
          <span className="thread-stat">
            <FontAwesomeIcon icon={farHeart} /> {thread.likes}
          </span>
        </div>
        <Button className="thread-reply-btn" onClick={handleReplyClick}>
          Ответить
        </Button>
      </div>
    </div>
  );
};

export default ThreadItem;