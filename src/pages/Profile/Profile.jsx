import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthLogic } from '../../api/auth/authLogic';
import { fetchUserDataFromAPI } from '../../api/User/getUser';
import {
  FaUser, FaBox, FaHeart, FaShoppingCart, FaGoogle, FaEnvelope,
  FaSignOutAlt, FaSync, FaExclamationTriangle, FaCheckCircle, FaStar
} from 'react-icons/fa';
import PersonalData from '../../components/layout/ProfileTabs/PersonalData/PersonalData';
import Orders from '../../components/layout/ProfileTabs/Orders/Orders';
import Favorites from '../../components/layout/ProfileTabs/Favorites/Favorites';
import Reviews from '../../components/layout/ProfileTabs/Reviews/Reviews';
import Cart from '../../components/layout/ProfileTabs/Cart/Cart';
import './Profile.css';

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

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [ordersCount, setOrdersCount] = useState(0);   // ← сразу покажем цифру

  const processedCodeRef = useRef(new Set());
  const hasInitializedRef = useRef(false);

  /* ----------  счётчик заказов  ---------- */
  const fetchOrdersCount = async (email) => {
    if (!email) return;
    try {
      const data = await getUserOrders(email);
      const list = Array.isArray(data) ? data : data?.orders || [];
      setOrdersCount(list.length);
    } catch {
      setOrdersCount(0);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMessage('');
  };

  const handleLogout = () => {
    [
      'access_token','refresh_token','id_token','token_timestamp',
      'remember_me','login_type',
    ].forEach(k => localStorage.removeItem(k));
    processedCodeRef.current.clear();
    hasInitializedRef.current = false;
    setUserData(null);
    navigate('/login');
  };

  const refreshProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');
    await handleAuthLogic({
      navigate,setUserData,setLoading,processedCodeRef,
      hasInitializedRef: { current: false },fetchUserDataFromAPI,
    });
  };

  const getLoginTypeIcon = () => {
    const t = localStorage.getItem('login_type');
    if (t === 'google') return <FaGoogle className="login-icon" />;
    if (t === 'email') return <FaEnvelope className="login-icon" />;
    return <FaUser className="login-icon" />;
  };

  /* ----------  инициализация  ---------- */
  useEffect(() => {
    handleAuthLogic({
      navigate,setUserData,setLoading,processedCodeRef,
      hasInitializedRef,fetchUserDataFromAPI,
    });
  }, []);

  /* ----------  как только появился email – грузим счётчик  ---------- */
  useEffect(() => {
    if (userData?.email) fetchOrdersCount(userData.email);
  }, [userData]);

  if (loading)
    return (
      <div className="profile-page">
        <div className="loading-overlay"><div className="loader" /><p>Загрузка профиля...</p></div>
      </div>
    );

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="header-actions">
            <button className="btn btn-icon refresh-btn" onClick={refreshProfile} title="Обновить">
              <FaSync className={`icon ${loading ? 'spinning' : ''}`} />
            </button>
            <button className="btn btn-outline logout-btn" onClick={handleLogout} disabled={loading}>
              <FaSignOutAlt className="logout-icon" /><span>Выйти</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="save-message error">
            <FaExclamationTriangle className="message-icon" /><span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="save-message success">
            <FaCheckCircle className="message-icon" /><span>{successMessage}</span>
          </div>
        )}

        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="user-card">
              <div className="avatar-container">
                {userData?.picture ? (
                  <img src={userData.picture} alt={userData.fullName} className="profile-avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {userData?.fullName?.[0]?.toUpperCase() || userData?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {userData?.verified_email && (
                  <div className="verified-badge" title="Подтверждённый аккаунт"><FaCheckCircle /></div>
                )}
              </div>

              <div className="user-info">
                <h2 className="user-name">
                  {userData?.fullName || userData?.email?.split('@')?.[0] || 'Пользователь'}
                </h2>
                <p className="user-email">{userData?.email || ''}</p>
                <div className="login-type">
                  {getLoginTypeIcon()}
                  <span>{localStorage.getItem('login_type') === 'google' ? 'Google Аккаунт' : 'Email'}</span>
                </div>
              </div>

              <div className="user-stats">
                <div className="stat"><div className="stat-value">{ordersCount}</div><div className="stat-label">Заказов</div></div>
                <div className="stat"><div className="stat-value">0</div><div className="stat-label">Избранное</div></div>
                <div className="stat"><div className="stat-value">0</div><div className="stat-label">Корзина</div></div>
              </div>
            </div>

            <nav className="sidebar-nav">
              {[
                { key: 'profile', ico: <FaUser />, label: 'Личные данные' },
                { key: 'orders', ico: <FaBox />, label: 'Мои заказы' },
                { key: 'favorites', ico: <FaHeart />, label: 'Избранное' },
                { key: 'reviews', ico: <FaStar />, label: 'Мои рецензии' },
                { key: 'cart', ico: <FaShoppingCart />, label: 'Корзина покупок' },
              ].map(t => (
                <button
                  key={t.key}
                  className={`nav-item ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => handleTabChange(t.key)}
                  disabled={loading}
                >
                  <span className="nav-icon">{t.ico}</span><span>{t.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="profile-content">
            <div className="content-header">
              <h2>
                {activeTab === 'profile' && 'Личные данные'}
                {activeTab === 'orders' && 'История заказов'}
                {activeTab === 'favorites' && 'Избранное'}
                {activeTab === 'reviews' && 'Мои рецензии'}
                {activeTab === 'cart' && 'Корзина покупок'}
              </h2>
            </div>

            <div className="tab-content">
              {activeTab === 'profile' && (
                <PersonalData
                  userData={userData}
                  setUserData={setUserData}
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                  refreshProfile={refreshProfile}
                />
              )}
              {activeTab === 'orders' && <Orders currentEmail={userData?.email} />}
              {activeTab === 'favorites' && <Favorites />}
              {activeTab === 'reviews' && <Reviews />}
              {activeTab === 'cart' && <Cart />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;