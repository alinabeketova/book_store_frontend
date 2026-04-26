import React, { useState, useEffect } from 'react';
import { FaHeart, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import './Favorites.css';
import BookCard from '../../../features/BookCard/BookCard';

const API = 'http://127.0.0.1:8001';

async function authFetch(url, opts = {}) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Токен отсутствует');

  const res = await fetch(url, {
    ...opts,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...opts.headers,
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

async function getWishlistIds(email) {
  return authFetch(`${API}/wishlist/${encodeURIComponent(email)}`);
}

async function getBookById(id) {
  return authFetch(`${API}/book/${id}`);
}

const getUserEmail = () => {
  const fromStorage = localStorage.getItem('user_email');
  if (fromStorage) return fromStorage;

  try {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData.email) return userData.email;
  } catch { /* ignore */ }

  return null;
};

const transformBookForCard = (apiBook) => {
  const price = Number(apiBook.price) || 0;
  const discount = Number(apiBook.discount) || 0;

  const totalPrice = discount > 0
    ? Math.round(price * (1 - discount / 100))
    : price;

  return {
    id: apiBook.id,
    title: apiBook.title,
    full_name: apiBook.author,
    description: apiBook.description,
    unit_price: price,
    total_price: totalPrice,
  };
};

const Favorites = ({ currentEmail }) => {
  const email = currentEmail || getUserEmail();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    if (!email) {
      setError('E-mail не передан. Войдите в аккаунт.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const ids = await getWishlistIds(email);
      const idList = Array.isArray(ids) ? ids : [];

      if (idList.length === 0) {
        setBooks([]);
        setLoading(false);
        return;
      }

      const bookPromises = idList.map(id =>
        getBookById(id).catch(err => {
          console.error(`Ошибка загрузки книги ${id}:`, err);
          return null;
        })
      );

      const results = await Promise.all(bookPromises);
      const validBooks = results
        .filter(b => b !== null)
        .map(transformBookForCard);

      setBooks(validBooks);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Не удалось загрузить избранное');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-box">
          <div className="spinner" />
          <p>Загрузка избранного…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="error-box">
          <FaExclamationTriangle size={48} />
          <h3>Ошибка</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchFavorites}>
            <FaRedo /> Повторить
          </button>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="favorites-container">
        <div className="empty-state">
          <FaHeart size={64} />
          <h3>Избранное пусто</h3>
          <p>Добавляйте книги в избранное, чтобы вернуться к ним позже</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>
          Избранное <span className="count">({books.length})</span>
        </h2>
        <button className="icon-btn" onClick={fetchFavorites} title="Обновить">
          <FaRedo />
        </button>
      </div>

      <div className="books-grid">
        {books.map(book => (
          <BookCard key={book.id} book={book} isFavorite={true} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;