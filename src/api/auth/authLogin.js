import { processGoogleAuth } from './googleAuth';
import { processEmailAuth } from './emailAuth';
import { decodeToken } from '../../utils/tokenUtils';

export const handleAuthLogic = async ({
  navigate,
  setUserData,
  setLoading,
  processedCodeRef,
  hasInitializedRef,
  fetchUserDataFromAPI
}) => {
  if (hasInitializedRef.current) {
    return;
  }
  
  hasInitializedRef.current = true;
  
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const state = urlParams.get('state');

  if (error) {
    console.error('Auth logic: Google OAuth error:', error);
    
    const errorDescription = urlParams.get('error_description');
    const errorMessage = errorDescription || error;
    
    alert(`Ошибка авторизации от Google: ${errorMessage}`);
    
    cleanUrlFromOAuthParams();
    
    window.history.replaceState({}, document.title, '/profile');
    return;
  }

  const existingAccessToken = localStorage.getItem('access_token');
  const storedLoginType = localStorage.getItem('login_type');
  const idToken = localStorage.getItem('id_token');  

  if (existingAccessToken) {
    if (storedLoginType === 'google' || idToken) {
      try {
        await processGoogleAuth({ 
          accessToken: existingAccessToken, 
          setUserData, 
          setLoading, 
          navigate,
          fetchUserDataFromAPI 
        });
      } catch (error) {
        handleAuthError(error, navigate);
      }
    } else {
      try {
        await processEmailAuth({ 
          accessToken: existingAccessToken, 
          setUserData, 
          setLoading, 
          navigate,
          fetchUserDataFromAPI 
        });
      } catch (error) {
        handleAuthError(error, navigate);
      }
    }
    return;
  }

  if (code && !processedCodeRef.current.has(code)) {
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
      handleAuthError(error, navigate);
    }
  } 
  else {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    } else {
      const storedLoginType = localStorage.getItem('login_type');
      const idToken = localStorage.getItem('id_token');
      
      if (storedLoginType === 'google' || idToken) {
        try {
          await processGoogleAuth({ 
            accessToken: localStorage.getItem('access_token'), 
            setUserData, 
            setLoading, 
            navigate,
            fetchUserDataFromAPI 
          });
        } catch (error) {
          handleAuthError(error, navigate);
        }
      } else {
        try {
          await processEmailAuth({ 
            accessToken: localStorage.getItem('access_token'), 
            setUserData, 
            setLoading, 
            navigate,
            fetchUserDataFromAPI 
          });
        } catch (error) {
          handleAuthError(error, navigate);
        }
      }
    }
  }
};

const cleanUrlFromOAuthParams = () => {
  if (window.location.search.includes('code=') || 
      window.location.search.includes('error=') || 
      window.location.search.includes('state=') ||
      window.location.search.includes('scope=') ||
      window.location.search.includes('authuser=') ||
      window.location.search.includes('prompt=')) {
    
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
};

const handleAuthError = (error, navigate) => {
  
  let errorMessage = 'Неизвестная ошибка аутентификации';
  
  if (error.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  const userFriendlyMessage = getFriendlyErrorMessage(errorMessage);
  alert(userFriendlyMessage);
  
  if (errorMessage.includes('expired') || 
      errorMessage.includes('истек') || 
      errorMessage.includes('invalid token') ||
      errorMessage.includes('401')) {
    
    performLogout(navigate);
  }
};

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
  
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return `Ошибка аутентификации: ${errorMessage}`;
};

const performLogout = (navigate) => {
  navigate('/login');
};

export const isUserAuthenticated = () => {
  const accessToken = localStorage.getItem('access_token');
  const tokenTimestamp = localStorage.getItem('token_timestamp');
  
  if (!accessToken) {
    return false;
  }
  
  if (tokenTimestamp) {
    const tokenAge = Date.now() - parseInt(tokenTimestamp, 10);
    const maxTokenAge = 23 * 60 * 60 * 1000; 
    
    if (tokenAge > maxTokenAge) {
      console.log('Auth logic: Token is too old, considering as expired');
      return false;
    }
  }
  
  return true;
};

export const getUserLoginType = () => {
  return localStorage.getItem('login_type') || 'email';
};

export const getUserEmailFromToken = () => {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    return null;
  }
  
  const decodedToken = decodeToken(accessToken);
  return decodedToken?.sub || null;
};

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