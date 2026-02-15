import React from 'react';
import { FaHeart } from 'react-icons/fa';
import "./Favorites.css"

const Favorites = () => {
  return (
    <div className="empty-state">
      <FaHeart size={64} />
      <h3>Избранное пусто</h3>
      <p>Добавляйте книги в избранное, чтобы вернуться к ним позже</p>
    </div>
  );
};

export default Favorites;