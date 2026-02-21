import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';
import { FaHeart, FaRegHeart, FaCartPlus } from 'react-icons/fa';

const BookCard = ({ book }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const toggleFavorite = () => setIsFavorite(v => !v);

  const fmtMoney = v =>
    Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

  const showSale =
    book.total_price != null && book.unit_price > book.total_price;

  return (
    <Link to={`/book/${book.id}`} className="book-card-link">
      <div className="book-card" data-book-id={book.id}>
        <div className="book-img">
          <div className="book-img-placeholder">📚</div>

          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            aria-label="В избранное"
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        <div className="book-info">
          <h3 className="book-title">{book.title}</h3>

          <p className="book-author">{book.full_name}</p>

          {book.description && (
            <p className="book-desc">
              {book.description.split('.')[0].slice(0, 60)}
              {book.description.length > 60 && '…'}
            </p>
          )}

          <div className="book-price">
            {showSale ? (
              <>
                <s>{fmtMoney(book.unit_price)}</s>&nbsp;{fmtMoney(book.total_price)}
              </>
            ) : (
              fmtMoney(book.unit_price)
            )}
          </div>

            <button className="btn-buy">
              <FaCartPlus /> Купить
            </button>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;