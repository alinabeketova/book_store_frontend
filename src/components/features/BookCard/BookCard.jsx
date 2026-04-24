
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';
import { FaHeart, FaRegHeart, FaCartPlus } from 'react-icons/fa';

const BookCard = ({ book, isFavorite: initialFavorite = false }) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(v => !v);
  };

  const fmtMoney = v =>
    Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

  const showSale =
    book.total_price != null && book.unit_price > book.total_price;

  return (
    <div className="book-card" data-book-id={book.id}>
      <div className="book-img">
        <div className="book-img-placeholder">📚</div>

        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.full_name}</p>

        {/* ✅ Добавлена проверка на наличие описания */}
        {book.description && (
          <p className="book-desc">
            {book.description.split('.')[0].slice(0, 60)}
            {book.description.length > 60 && '…'}
          </p>
        )}

        <div className="book-price">
          {showSale ? (
            <>
              <s style={{ color: '#999', fontSize: '16px', fontWeight: '400', marginRight: '8px' }}>
                {fmtMoney(book.unit_price)}
              </s>
              {fmtMoney(book.total_price)}
            </>
          ) : (
            fmtMoney(book.unit_price)
          )}
        </div>

        <div className="book-actions">
          <button className="btn-buy">
            <FaCartPlus /> Купить
          </button>
          <Link to={`/book/${book.id}`} className="btn-details">
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookCard;