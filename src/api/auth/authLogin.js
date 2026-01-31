import { processGoogleAuth } from './googleAuth';
import { processEmailAuth } from './emailAuth';
import { decodeToken } from '../../utils/tokenUtils';

// Основная функция для обработки логики аутентификации
export const handleAuthLogic = async ({
  navigate,
  setUserData,
  setLoading,
  processedCodeRef,
  hasInitializedRef,
  fetchUserDataFromAPI
}) => {
  // Проверяем, не инициализирован ли уже процесс
  if (hasInitializedRef.current) {
    console.log('Auth logic: Already initialized, skipping...');
    return;
  }
  
  // Помечаем как инициализированный
  hasInitializedRef.current = true;
  
  // Получаем параметры из URL (для Google OAuth callback)
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const state = urlParams.get('state');

  console.log('Auth logic: Profile page loaded');
  console.log('Has OAuth code:', !!code);
  console.log('Has OAuth error:', !!error);
  console.log('Has OAuth state:', !!state);
  console.log('Current URL:', window.location.href);

  // Обрабатываем ошибку OAuth (если есть)
  if (error) {
    console.error('Auth logic: Google OAuth error:', error);
    
    // Получаем описание ошибки, если есть
    const errorDescription = urlParams.get('error_description');
    const errorMessage = errorDescription || error;
    
    alert(`Ошибка авторизации от Google: ${errorMessage}`);
    
    // Очищаем URL от параметров OAuth
    cleanUrlFromOAuthParams();
    
    // Перенаправляем на страницу профиля
    window.history.replaceState({}, document.title, '/profile');
    return;
  }

  // Проверяем наличие access token в localStorage
  const existingAccessToken = localStorage.getItem('access_token');
  const storedLoginType = localStorage.getItem('login_type');
  const idToken = localStorage.getItem('id_token');
  
  console.log('Auth logic: Checking localStorage');
  console.log('Has access token:', !!existingAccessToken);
  console.log('Login type:', storedLoginType);
  console.log('Has ID token:', !!idToken);
  
  // Если у нас уже есть токен
  if (existingAccessToken) {
    console.log('Auth logic: Access token found in localStorage');
    
    // Определяем тип входа
    if (storedLoginType === 'google' || idToken) {
      console.log('Auth logic: User logged in via Google');
      // Для Google OAuth
      try {
        await processGoogleAuth({ 
          accessToken: existingAccessToken, 
          setUserData, 
          setLoading, 
          navigate,
          fetchUserDataFromAPI 
        });
      } catch (error) {
        console.error('Auth logic: Error in Google auth:', error);
        handleAuthError(error, navigate);
      }
    } else {
      console.log('Auth logic: User logged in via Email');
      // Для обычного входа через email
      try {
        await processEmailAuth({ 
          accessToken: existingAccessToken, 
          setUserData, 
          setLoading, 
          navigate,
          fetchUserDataFromAPI 
        });
      } catch (error) {
        console.error('Auth logic: Error in Email auth:', error);
        handleAuthError(error, navigate);
      }
    }
    return;
  }

  // Если у нас есть код авторизации от Google (OAuth callback)
  if (code && !processedCodeRef.current.has(code)) {
    console.log('Auth logic: Processing Google OAuth callback with code:', code.substring(0, 10) + '...');
    processedCodeRef.current.add(code);

    try {
      await processGoogleAuth({ 
        code, 
        setUserData, 
        setLoading, 
        navigate,
        processedCodeRef,
        fetchUserDataFromAPI 
      });
    } catch (error) {
      console.error('Auth logic: Error processing Google callback:', error);
      handleAuthError(error, navigate);
    }
  } 
  // Если нет ни токена, ни кода - перенаправляем на логин
  else {
    if (!localStorage.getItem('access_token')) {
      console.log('Auth logic: No access token and no OAuth code found, redirecting to login');
      navigate('/login');
    } else {
      // Определяем тип входа по сохраненным данным
      const storedLoginType = localStorage.getItem('login_type');
      const idToken = localStorage.getItem('id_token');
      
      if (storedLoginType === 'google' || idToken) {
        console.log('Auth logic: Existing Google session found');
        try {
          await processGoogleAuth({ 
            accessToken: localStorage.getItem('access_token'), 
            setUserData, 
            setLoading, 
            navigate,
            fetchUserDataFromAPI 
          });
        } catch (error) {
          console.error('Auth logic: Error in existing Google session:', error);
          handleAuthError(error, navigate);
        }
      } else {
        console.log('Auth logic: Existing Email session found');
        try {
          await processEmailAuth({ 
            accessToken: localStorage.getItem('access_token'), 
            setUserData, 
            setLoading, 
            navigate,
            fetchUserDataFromAPI 
          });
        } catch (error) {
          console.error('Auth logic: Error in existing Email session:', error);
          handleAuthError(error, navigate);
        }
      }
    }
  }
};

// Функция для очистки URL от параметров OAuth
const cleanUrlFromOAuthParams = () => {
  if (window.location.search.includes('code=') || 
      window.location.search.includes('error=') || 
      window.location.search.includes('state=') ||
      window.location.search.includes('scope=') ||
      window.location.search.includes('authuser=') ||
      window.location.search.includes('prompt=')) {
    
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    console.log('Auth logic: URL cleaned from OAuth parameters');
  }
};

// Обработка ошибок аутентификации
const handleAuthError = (error, navigate) => {
  console.error('Auth logic: Authentication error:', error);
  
  let errorMessage = 'Неизвестная ошибка аутентификации';
  
  if (error.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Показываем пользователю понятное сообщение
  const userFriendlyMessage = getFriendlyErrorMessage(errorMessage);
  alert(userFriendlyMessage);
  
  // Если ошибка связана с истекшей сессией, выполняем logout
  if (errorMessage.includes('expired') || 
      errorMessage.includes('истек') || 
      errorMessage.includes('invalid token') ||
      errorMessage.includes('401')) {
    
    console.log('Auth logic: Session expired, logging out...');
    performLogout(navigate);
  }
};

// Получение понятного пользователю сообщения об ошибке
const getFriendlyErrorMessage = (errorMessage) => {
  const errorMap = {
    'invalid token': 'Недействительный токен. Пожалуйста, войдите снова.',
    'token expired': 'Сессия истекла. Пожалуйста, войдите снова.',
    '401': 'Ошибка авторизации. Пожалуйста, войдите снова.',
    'Network Error': 'Ошибка сети. Проверьте подключение к интернету.',
    'Failed to fetch': 'Ошибка соединения с сервером.',
    'User not found': 'Пользователь не найден.',
    'Incorrect email or password': 'Неверный email или пароль.',
  };
  
  // Ищем совпадение в errorMap
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Если не нашли совпадение, возвращаем оригинальное сообщение
  return `Ошибка аутентификации: ${errorMessage}`;
};

// Выполнение logout
const performLogout = (navigate) => {
  // Очищаем все токены и данные
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('token_timestamp');
  localStorage.removeItem('remember_me');
  localStorage.removeItem('login_type');
  
  console.log('Auth logic: User logged out, all tokens cleared');
  
  // Перенаправляем на страницу логина
  navigate('/login');
};

// Функция для проверки, авторизован ли пользователь
export const isUserAuthenticated = () => {
  const accessToken = localStorage.getItem('access_token');
  const tokenTimestamp = localStorage.getItem('token_timestamp');
  
  if (!accessToken) {
    return false;
  }
  
  // Проверяем, не истек ли токен (если есть timestamp)
  if (tokenTimestamp) {
    const tokenAge = Date.now() - parseInt(tokenTimestamp, 10);
    const maxTokenAge = 23 * 60 * 60 * 1000; // 23 часа в миллисекундах
    
    if (tokenAge > maxTokenAge) {
      console.log('Auth logic: Token is too old, considering as expired');
      return false;
    }
  }
  
  return true;
};

// Функция для получения типа входа пользователя
export const getUserLoginType = () => {
  return localStorage.getItem('login_type') || 'email';
};

// Функция для получения email пользователя из токена
export const getUserEmailFromToken = () => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    return null;
  }
  
  const decodedToken = decodeToken(accessToken);
  return decodedToken?.sub || null;
};

// Функция для обновления профиля
export const refreshProfile = async ({ navigate, setUserData, setLoading, fetchUserDataFromAPI }) => {
  setLoading(true);
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    navigate('/login');
    return;
  }

  const storedLoginType = localStorage.getItem('login_type');
  if (storedLoginType === 'google') {
    await processGoogleAuth({ 
      accessToken: token, 
      setUserData, 
      setLoading, 
      navigate,
      fetchUserDataFromAPI 
    });
  } else {
    await processEmailAuth({ 
      accessToken: token, 
      setUserData, 
      setLoading, 
      navigate,
      fetchUserDataFromAPI 
    });
  }
};