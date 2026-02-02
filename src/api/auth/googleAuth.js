import { decodeToken, isTokenValid, saveTokens, cleanOAuthParamsFromUrl } from '../../utils/tokenUtils';

// Функция для обработки Google аутентификации
export const processGoogleAuth = async ({ 
  code = null, 
  accessToken = null, 
  setUserData, 
  setLoading, 
  navigate,
  processedCodeRef
}) => {
  // Если есть код авторизации, обмениваем его на токен
  if (code) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/login/google?code=${encodeURIComponent(code)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        let errorMessage = 'Ошибка сервера';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const tokenData = await response.json();
      
      // Сохраняем токены
      saveTokens(tokenData);
      localStorage.setItem('login_type', 'google');
      
      // Очищаем URL от параметров OAuth
      cleanOAuthParamsFromUrl();
      
      // Получаем профиль Google
      await fetchGoogleProfile(tokenData.access_token, setUserData, setLoading, navigate);
      
    } catch (error) {
      console.error('Error in Google OAuth processing:', error);
      throw error;
    }
  } 
  // Если есть access token, получаем профиль
  else if (accessToken) {
    await fetchGoogleProfile(accessToken, setUserData, setLoading, navigate);
  }
};

// Получение профиля Google
const fetchGoogleProfile = async (accessToken, setUserData, setLoading, navigate) => {
  console.log('Fetching Google profile with token');

  if (!accessToken) {
    console.log('No access token available');
    setLoading(false);
    navigate('/login');
    return;
  }

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    console.log('Google API response status:', response.status);

    if (response.ok) {
      const googleData = await response.json();
      console.log('Successfully fetched Google user data:', googleData);
      
      // Формируем профиль пользователя из данных Google
      const userProfile = createUserProfileFromGoogleData(googleData);
      setUserData(userProfile);
      
    } else if (response.status === 401) {
      console.log('Google token expired or invalid (401)');
      
      // Пробуем получить данные из токена
      const decodedToken = decodeToken(accessToken);
      if (decodedToken?.sub && isTokenValid(decodedToken)) {
        const userProfile = createUserProfileFromToken(decodedToken, 'google');
        setUserData(userProfile);
      } else {
        alert('Сессия Google истекла. Пожалуйста, войдите снова.');
        handleLogout(navigate);
      }
      
    } else {
      console.log('Failed to fetch Google profile');
      // Пробуем получить данные из токена
      const decodedToken = decodeToken(accessToken);
      if (decodedToken?.sub && isTokenValid(decodedToken)) {
        const userProfile = createUserProfileFromToken(decodedToken, 'google');
        setUserData(userProfile);
      }
    }
  } catch (error) {
    console.error('Error fetching Google profile:', error);
    // Пробуем получить данные из токена
    const decodedToken = decodeToken(accessToken);
    if (decodedToken?.sub && isTokenValid(decodedToken)) {
      const userProfile = createUserProfileFromToken(decodedToken, 'google');
      setUserData(userProfile);
    }
  } finally {
    setLoading(false);
  }
};

// Создание профиля пользователя из данных Google
const createUserProfileFromGoogleData = (googleData) => {
  return {
    ...googleData,
    loginType: 'google',
    name: googleData.name || googleData.email,
    picture: googleData.picture || null,
    email: googleData.email,
    given_name: googleData.given_name,
    family_name: googleData.family_name,
    verified_email: googleData.verified_email,
    locale: googleData.locale,
    
    // Поля из вашего списка
    first_name: googleData.given_name || '',
    last_name: googleData.family_name || '',
    middle_name: '',
    date_of_birth: '',
    address: '',
    passport_number: '',
    password: '',
    
    fullName: googleData.name || googleData.email.split('@')[0]
  };
};

// Создание профиля пользователя из токена
const createUserProfileFromToken = (decodedToken, loginType) => {
  return {
    loginType,
    email: decodedToken.sub || '',
    name: decodedToken.sub?.split('@')[0] || '',
    first_name: decodedToken.first_name || '',
    middle_name: decodedToken.middle_name || '',
    last_name: decodedToken.last_name || '',
    date_of_birth: decodedToken.date_of_birth || '',
    address: decodedToken.address || '',
    passport_number: decodedToken.passport_number || '',
    password: decodedToken.password || '',
    locale: decodedToken.locale || '',
    
    fullName: [decodedToken.first_name, decodedToken.middle_name, decodedToken.last_name]
      .filter(Boolean)
      .join(' ') || decodedToken.sub?.split('@')[0] || '',
    
    isTokenData: true
  };
};

// Выход из системы для Google
const handleLogout = (navigate) => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('token_timestamp');
  localStorage.removeItem('remember_me');
  localStorage.removeItem('login_type');
  navigate('/login');
};