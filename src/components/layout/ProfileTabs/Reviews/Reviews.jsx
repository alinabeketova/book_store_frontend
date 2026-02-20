import React from 'react';
import { FaCommentAlt } from 'react-icons/fa';
import "./Reviews.css"

const Reviews = () => {
  return (
    <div className="empty-state">
      <FaCommentAlt size={64} />
      <h3>Рецензий пока нет</h3>
      <p>Поделитесь своим мнением о прочитанных книгах</p>
    </div>
  );
};

export default Reviews;