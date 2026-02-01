import { decodeToken, isTokenValid } from '../../utils/tokenUtils';

// Функция для обработки аутентификации через email
export const processEmailAuth = async ({ 
  accessToken, 
  setUserData, 
  setLoading, 
  navigate,
  fetchUserDataFromAPI 
}) => {
  console.log('Processing email login profile');
  
  if (!accessToken) {
    console.log('No access token available');
    setLoading(false);
    navigate('/login');
    return;
  }

  try {
    // Декодируем токен, чтобы получить email
    const decodedToken = decodeToken(accessToken);
    
    if (!decodedToken) {
      throw new Error('Не удалось декодировать токен');
    }
    
    const email = decodedToken.sub;
    
    if (!email) {
      throw new Error('Email не найден в токене');
    }
    
    // Проверяем срок действия токена
    if (!isTokenValid(decodedToken)) {
      console.log('Token expired');
      alert('Сессия истекла. Пожалуйста, войдите снова.');
      handleEmailLogout(navigate);
      return;
    }
    
    // Получаем данные пользователя из API с токеном
    const apiUserData = await fetchUserDataFromAPI(email, accessToken);
    
    if (!apiUserData) {
      // Если не получили данные с токеном, пробуем без него
      console.log('Trying to fetch user data without token...');
      const apiUserDataWithoutToken = await fetchUserDataFromAPI(email);
      
      if (!apiUserDataWithoutToken) {
        throw new Error('Не удалось получить данные пользователя');
      }
      
      // Создаем профиль пользователя из данных API
      const userProfile = createUserProfileFromApiData(apiUserDataWithoutToken, email);
      setUserData(userProfile);
    } else {
      // Создаем профиль пользователя из данных API
      const userProfile = createUserProfileFromApiData(apiUserData, email);
      setUserData(userProfile);
    }
    
  } catch (error) {
    console.error('Error processing email login profile:', error);
    alert('Ошибка при загрузке профиля. Пожалуйста, войдите снова.');
    handleEmailLogout(navigate);
  } finally {
    setLoading(false);
  }
};

// Создание профиля пользователя из данных API
const createUserProfileFromApiData = (apiUserData, email) => {
  // Формируем полное имя
  const fullNameParts = [];
  if (apiUserData.first_name) fullNameParts.push(apiUserData.first_name);
  if (apiUserData.middle_name) fullNameParts.push(apiUserData.middle_name);
  if (apiUserData.last_name) fullNameParts.push(apiUserData.last_name);
  
  const fullName = fullNameParts.join(' ') || apiUserData.email?.split('@')[0] || email.split('@')[0];
  
  const profile = {
    loginType: 'email',
    email: apiUserData.email || email,
    name: apiUserData.name || email.split('@')[0],
    fullName: fullName,
    
    // Поля из вашего списка
    first_name: apiUserData.first_name || '',
    middle_name: apiUserData.middle_name || '',
    last_name: apiUserData.last_name || apiUserData.blast_name || '',
    date_of_birth: apiUserData.date_of_birth || '',
    address: apiUserData.address || '',
    passport_number: apiUserData.passport_number || '',
    password: apiUserData.password || '',
  };
  
  return profile;
};

// Выход из системы для email
const handleEmailLogout = (navigate) => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_timestamp');
  localStorage.removeItem('remember_me');
  localStorage.removeItem('login_type');
  navigate('/login');
};