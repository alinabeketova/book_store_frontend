import React, { useEffect, useState } from 'react';
import Carousel from '../../components/layout/Carousel/Carousel';
import BookCard from '../../components/features/BookCard/BookCard';
import './Home.css';


const API_BASE = 'http://127.0.0.1:8001';

const Home = () => {
  const [genres, setGenres] = useState([]);         
  const [genreLoading, setGenreLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState('Все');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/genre`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((data) => {
        const names = data.map((g) => g.name);
        setGenres(['Все', ...names]);
        setGenreLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки жанров:', err);
        setGenreLoading(false);
      });
  }, []);

  const fetchBooks = async (genre = null) => {
    setLoading(true);
    setError(null);
    try {
      const url = genre
        ? `${API_BASE}/book_genre/${encodeURIComponent(genre)}`
        : `${API_BASE}/book`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return data.map((b) => ({
        id: b.id,
        title: b.title,
        full_name: b.full_name,
        description: b.description,
        unit_price: b.unit_price,
        total_price: b.total_price,
      }));
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks().then(setBooks);
  }, []);

  useEffect(() => {
    if (activeFilter === 'Все') {
      fetchBooks().then(setBooks);
    } else {
      fetchBooks(activeFilter).then(setBooks);
    }
  }, [activeFilter]);

  if (genreLoading) return <p className="info">Загружаем фильтры…</p>;
  if (loading)      return <p className="info">Загружаем книги…</p>;
  if (error)        return <p className="error">Ошибка: {error}</p>;

  return (
    <>
      <Carousel />

      <div className="container">
        <div className="header">
          <h1>Популярные книги этой недели</h1>
          <p>
            Лучшие предложения от нашего магазина. Бестселлеры, новинки и книги
            со скидками в одном месте.
          </p>
        </div>

        <div className="controls">
          <div className="filter-buttons" key="filter-panel">
            {genres.map((f) => (
              <button
                type="button"
                key={f}
                className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="books-grid">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;