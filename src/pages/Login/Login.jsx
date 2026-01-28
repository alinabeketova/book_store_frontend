import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginWithGoogle = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8001/google/url');
      
      if (!response.ok) {
        throw new Error('Не удалось получить URL для авторизации');
      }
      
      const data = await response.json();
      console.log('Redirecting to Google OAuth...');
      window.location.href = data.uri;
      
    } catch (error) {
      console.error('Error getting Google OAuth URL:', error);
      alert('Ошибка при подключении к серверу авторизации');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // POST запрос с query параметрами
      const params = new URLSearchParams({
        email: formData.email,
        password: formData.password
      });

      const response = await fetch(`http://127.0.0.1:8001/login?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log('POST Request URL:', `http://127.0.0.1:8001/login?${params.toString()}`);
      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Неверный формат ответа от сервера');
      }
      
      if (!response.ok) {
        let errorMsg = 'Ошибка при входе';
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map(err => err.msg || err).join(', ');
          }
        } else if (data.message) {
          errorMsg = data.message;
        }
        throw new Error(errorMsg);
      }

      // Обработка успешного ответа
      if (data.token) {
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('token_timestamp', Date.now().toString());
        localStorage.setItem('login_type', 'email'); // Сохраняем тип входа
        
        // Декодируем токен, чтобы получить email
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          const email = payload.sub;
          localStorage.setItem('user_email', email);
        } catch (e) {
          console.error('Error decoding token:', e);
        }
        
        if (rememberMe) {
          localStorage.setItem('remember_me', 'true');
        }
        
        console.log('Login successful, token saved');
        
        // Получаем дополнительные данные пользователя
        await fetchUserProfileData(data.token);
        
      } else {
        throw new Error('Токен не получен от сервера');
      }

    } catch (error) {
      console.error('Login error details:', error);
      setError(error.message || 'Ошибка при входе. Проверьте email и пароль.');
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения дополнительных данных пользователя
  const fetchUserProfileData = async (token) => {
    try {
      // Предположим, что есть эндпоинт для получения профиля пользователя
      // Если нет, можно добавить его в бэкенд
      const response = await fetch('http://127.0.0.1:8001/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const userData = await response.json();
        // Сохраняем данные пользователя в localStorage или state
        localStorage.setItem('user_profile', JSON.stringify(userData));
        console.log('User profile data saved:', userData);
      } else {
        console.log('Profile endpoint not available, using basic data');
        // Если эндпоинта нет, сохраняем базовые данные
        saveBasicUserData(token);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      saveBasicUserData(token);
    }
    
    // Перенаправляем в профиль
    navigate('/profile');
  };

  // Сохранение базовых данных из токена
  const saveBasicUserData = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.sub;
      
      // Создаем базовый профиль из email
      const basicProfile = {
        email: email,
        name: email.split('@')[0], // Имя из email
        loginType: 'email',
        isLocalUser: true
      };
      
      localStorage.setItem('user_profile', JSON.stringify(basicProfile));
      localStorage.setItem('user_email', email);
    } catch (e) {
      console.error('Error saving basic user data:', e);
    }
  };

  // Проверяем, есть ли сохраненный токен
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/profile');
    }
  }, [navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Вход в аккаунт</h1>
          <p className="login-subtitle">
            Введите свои данные для входа
          </p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Ошибка:</strong> {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Введите ваш email"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              Пароль
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Введите ваш пароль"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Запомнить меня</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Забыли пароль?
            </Link>
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Вход...
              </>
            ) : 'Войти'}
          </button>

          <div className="divider">
            <span>или</span>
          </div>

          <div className="social-login">
            <div className="social-buttons">
              <button 
                type="button" 
                className="social-btn google"
                onClick={loginWithGoogle}
                disabled={loading}
              >
                <FaGoogle />
                Войти через Google
              </button>
            </div>
          </div>

          <div className="switch-form">
            <p>
              Ещё нет аккаунта?{' '}
              <Link 
                to="/register"
                className="switch-btn"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </form>

        <div className="login-footer">
          <p>
            Нажимая кнопку Войти, вы соглашаетесь с 
            <Link to="/terms"> Условиями использования</Link> и 
            <Link to="/privacy"> Политикой конфиденциальности</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;