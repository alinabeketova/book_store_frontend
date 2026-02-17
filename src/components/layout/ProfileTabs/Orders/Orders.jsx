import React, { useState, useEffect } from 'react';
import {
  FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaClock,
  FaEye, FaShoppingCart, FaExclamationTriangle, FaRedo
} from 'react-icons/fa';
import './Orders.css';
import BookCard from '../../../features/BookCard/BookCard';

const API = 'http://127.0.0.1:8001';

async function authFetch(url, opts = {}) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Токен отсутствует');
  const res = await fetch(url, {
    ...opts,
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...opts.headers }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

async function getUserOrders(email) {
  return authFetch(`${API}/user_order/${encodeURIComponent(email)}`);
}

async function getBookOrderLines(orderNumber) {
  return authFetch(`${API}/book_order/${encodeURIComponent(orderNumber)}`);
}

const Orders = ({ currentEmail }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [books, setBooks] = useState({});
  const [loadingBooks, setLoadingBooks] = useState({});

  const fetchOrders = async () => {
    if (!currentEmail) {
      setError('E-mail не передан');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getUserOrders(currentEmail);
      const list = Array.isArray(data) ? data : data?.orders || [];
      const sorted = list.sort((a, b) => new Date(b.create_date) - new Date(a.create_date));
      setOrders(sorted);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [currentEmail]);

  const loadBooks = async (orderNumber) => {
    if (books[orderNumber] || loadingBooks[orderNumber]) return;
    setLoadingBooks(p => ({ ...p, [orderNumber]: true }));
    try {
      const lines = await getBookOrderLines(orderNumber);
      setBooks(p => ({ ...p, [orderNumber]: lines }));
    } catch (e) {
      console.error('Книги заказа:', e);
      setBooks(p => ({ ...p, [orderNumber]: [] }));
    } finally {
      setLoadingBooks(p => ({ ...p, [orderNumber]: false }));
    }
  };

  const fmtDate = d => (d ? new Date(d).toLocaleString('ru-RU') : '—');
  const fmtMoney = v => {
    const n = Number(v);
    return Number.isNaN(n) ? '0 ₽' : `${n.toLocaleString('ru-RU', { minimumFractionDigits: 0 })} ₽`;
  };
  const statusInfo = (name = '') => {
    const s = name.toLowerCase();
    if (s.includes('обработк')) return { icon: <FaClock />, cls: 'processing' };
    if (s.includes('доставк') || s.includes('пути') || s.includes('отправлен')) return { icon: <FaTruck />, cls: 'shipped' };
    if (s.includes('доставлен') || s.includes('выполнен')) return { icon: <FaCheckCircle />, cls: 'delivered' };
    if (s.includes('отмен')) return { icon: <FaTimesCircle />, cls: 'cancelled' };
    return { icon: <FaBox />, cls: 'default' };
  };

  if (loading) return <div className="orders-container"><div className="loading-box"><div className="spinner" /><p>Загрузка заказов…</p></div></div>;
  if (error)   return <div className="orders-container"><div className="error-box"><FaExclamationTriangle size={48} /><h3>Ошибка</h3><p>{error}</p><button className="btn-retry" onClick={fetchOrders}><FaRedo /> Повторить</button></div></div>;
  if (!orders.length) return <div className="orders-container"><div className="empty-state"><FaBox size={64} /><h3>Заказов пока нет</h3><p>Сделайте первый заказ, чтобы увидеть его здесь</p><button className="btn-primary" onClick={() => window.location.href = '/catalog'}><FaShoppingCart /> Перейти в каталог</button></div></div>;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>История заказов <span className="count">({orders.length})</span></h2>
        <button className="icon-btn" onClick={fetchOrders} title="Обновить"><FaRedo /></button>
      </div>

      <div className="orders-list">
        {orders.map(o => {
          const { icon, cls } = statusInfo(o.name);
          const open = expanded === o.order_number;
          return (
            <div key={o.order_number} className="order-card">
              <div className="order-row">
                <div>
                  <div className="order-number">Заказ #{o.order_number}</div>
                  <div className="order-date">{fmtDate(o.create_date)}</div>
                </div>
                <div className={`status-badge ${cls}`}>{icon} {o.name || 'Статус не указан'}</div>
              </div>

              <div className="order-summary">
                <span className="sum">{fmtMoney(o.final_amount)}</span>
                <span className="address">{o.delivery_address || '—'}</span>
              </div>

              <div className="order-actions">
                <button
                  className="btn-text"
                  onClick={() => {
                    setExpanded(open ? null : o.order_number);
                    if (!open) loadBooks(o.order_number);
                  }}
                >
                  <FaEye /> {open ? 'Скрыть детали' : 'Подробнее'}
                </button>

                {!o.name?.toLowerCase().includes('отмен') && (
                  <button className="btn-text" onClick={() => alert(`Повтор заказа #${o.order_number} (заглушка)`)}>
                    <FaShoppingCart /> Повторить
                  </button>
                )}
              </div>

              {open && (
                <div className="order-expanded-details">
                  <div className="expanded-grid">
                    <div className="expanded-item"><span className="expanded-label">Общая сумма:</span><span className="expanded-value">{fmtMoney(o.total_amount)}</span></div>
                    {o.discount_amount && +o.discount_amount > 0 && <div className="expanded-item discount"><span className="expanded-label">Скидка:</span><span className="expanded-value">{fmtMoney(o.discount_amount)}</span></div>}
                    <div className="expanded-item total-amount"><span className="expanded-label">Итоговая сумма:</span><span className="expanded-value">{fmtMoney(o.final_amount)}</span></div>
                    {o.note && <div className="expanded-item full-width"><span className="expanded-label">Примечание:</span><span className="expanded-value note">{o.note}</span></div>}
                  </div>

                  <div className="books-section">
                    <h4>Книги в заказе</h4>

                    {loadingBooks[o.order_number] ? (
                      <div className="loading-small"><div className="spinner" /><p>Загрузка книг…</p></div>
                    ) : (
                      <div className="books-scroll-wrapper">
                        {(books[o.order_number] || []).length ? (
                          <div className="books-horizontal">
                            {(books[o.order_number] || []).map(b => (
                              <BookCard key={b.id} book={b} />
                            ))}
                          </div>
                        ) : (
                          <p className="no-books">Книги не найдены</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;