import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaBook, 
  FaTag, 
  FaUser, 
  FaBuilding, 
  FaCalendar, 
  FaFileAlt, 
  FaEnvelope, 
  FaHashtag,
  FaBarcode,
  FaShoppingCart,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaChevronRight,
  FaBox,
  FaMinusCircle,
  FaPlusCircle,
  FaInfoCircle
} from 'react-icons/fa';
import './Book.css'

const fmtMoney = v =>
  Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 0 }) + ' ₽';

// Функция для форматирования даты
const fmtDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default function BookPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8001/book/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки');
        return res.json();
      })
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="book-page-loading-container">
      <FaSpinner className="book-page-loading-spinner" />
      <p className="book-page-loading-text">Загружаем информацию о книге…</p>
    </div>
  );
  
  if (error) return (
    <div className="book-page-error-container">
      <FaExclamationTriangle className="book-page-error-icon" />
      <p className="book-page-error-text">Ошибка: {error}</p>
      <Link to="/" className="book-page-error-link">
        <FaArrowLeft /> Вернуться к списку книг
      </Link>
    </div>
  );
  
  if (!book) return null;

  const finalPrice = book.price * (1 - (book.discount || 0) / 100);
  const discountAmount = book.price - finalPrice;

  return (
    <div className="book-page">
      <div className="book-page-container">
        <div className="book-page-detail-grid">
          <div className="book-page-cover-section">
            <div className="book-page-cover">
              <div className="book-page-cover-placeholder">
                <FaBook className="book-page-icon" />
              </div>
              {book.discount > 0 && (
                <div className="book-page-discount-badge">
                  <FaTag /> -{book.discount}%
                </div>
              )}
            </div>
            
            <div className="book-page-stats">
              <div className="book-page-stat-item">
                <span className="book-page-stat-label">
                  <FaHashtag /> ID:
                </span>
                <span className="book-page-stat-value">{book.id}</span>
              </div>
              <div className="book-page-stat-item">
                <span className="book-page-stat-label">
                  <FaBarcode /> ISBN:
                </span>
                <span className="book-page-stat-value">{book.isbn}</span>
              </div>
              <div className="book-page-stat-item">
                <span className="book-page-stat-label">
                  <FaCalendar /> Дата добавления:
                </span>
                <span className="book-page-stat-value">{fmtDate(book.create_date)}</span>
              </div>
            </div>
          </div>

          <div className="book-page-info-section">
            <div className="book-page-header">
              <span className="book-page-genre">
                <FaTag /> {book.genre}
              </span>
              <h1 className="book-page-title">{book.title}</h1>
              <div className="book-page-author">
                <span className="book-page-author-by">
                  <FaUser /> Автор:
                </span>
                <span className="book-page-author-name">{book.author}</span>
              </div>
            </div>

            <div className="book-page-description">
              <h3>
                <FaFileAlt /> Описание
              </h3>
              <p>{book.description}</p>
            </div>

            <div className="book-page-details">
              <div className="book-page-details-grid">
                <div className="book-page-detail-item">
                  <span className="book-page-detail-label">
                    <FaBuilding /> Издательство
                  </span>
                  <span className="book-page-detail-value">{book.publisher_name}</span>
                </div>
                <div className="book-page-detail-item">
                  <span className="book-page-detail-label">
                    <FaCalendar /> Год издания
                  </span>
                  <span className="book-page-detail-value">{book.publication_year}</span>
                </div>
                <div className="book-page-detail-item">
                  <span className="book-page-detail-label">
                    <FaFileAlt /> Количество страниц
                  </span>
                  <span className="book-page-detail-value">{book.pages}</span>
                </div>
                <div className="book-page-detail-item">
                  <span className="book-page-detail-label">
                    <FaEnvelope /> Контакт издателя
                  </span>
                  <span className="book-page-detail-value">{book.publisher_email}</span>
                </div>
              </div>
            </div>

            <div className="book-page-purchase-section">
              <div className="book-page-price-container">
                {book.discount > 0 ? (
                  <>
                    <div className="book-page-price-original">
                      <s>{fmtMoney(book.price)}</s>
                      <span className="book-page-discount-amount">
                        <FaPlusCircle /> Вы экономите {fmtMoney(discountAmount)}
                      </span>
                    </div>
                    <div className="book-page-price-final">
                      {fmtMoney(finalPrice)}
                    </div>
                  </>
                ) : (
                  <div className="book-page-price-final book-page-no-discount">
                    {fmtMoney(book.price)}
                  </div>
                )}
              </div>

              <div className="book-page-stock-container">
                <div className={`book-page-stock-status ${book.quantity_in_stock > 0 ? 'book-page-in-stock' : 'book-page-out-of-stock'}`}>
                  {book.quantity_in_stock > 0 ? (
                    <>
                      <FaCheck className="book-page-stock-icon" />
                      <span className="book-page-stock-text">
                        В наличии: {book.quantity_in_stock} шт.
                      </span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="book-page-stock-icon" />
                      <span className="book-page-stock-text">Нет в наличии</span>
                    </>
                  )}
                </div>
                <div className="book-page-min-quantity">
                  <FaMinusCircle /> Минимальный заказ: {book.min_quantity} шт.
                </div>
              </div>

              <button 
                className="book-page-buy-button"
                disabled={book.quantity_in_stock === 0}
              >
                <FaShoppingCart className="book-page-button-icon" />
                <span className="book-page-button-text">
                  {book.quantity_in_stock > 0 
                    ? 'Добавить в корзину' 
                    : 'Нет в наличии'}
                </span>
              </button>

              <div className="book-page-additional-info">
                <FaInfoCircle />
                <span>Книга будет доставлена в течение 3-5 рабочих дней</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}