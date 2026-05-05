import { decodeToken, isTokenValid } from '../../utils/tokenUtils';

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
    const decodedToken = decodeToken(accessToken);
    
    if (!decodedToken) {
      throw new Error('Не удалось декодировать токен');
    }
    
    const email = decodedToken.sub;
    
    if (!email) {
      throw new Error('Email не найден в токене');
    }
    
    if (!isTokenValid(decodedToken)) {
      alert('Сессия истекла. Пожалуйста, войдите снова.');
      handleEmailLogout(navigate);
      return;
    }
    
    const apiUserData = await fetchUserDataFromAPI(email, accessToken);
    
    if (!apiUserData) {
      console.log('Trying to fetch user data without token...');
      const apiUserDataWithoutToken = await fetchUserDataFromAPI(email);
      
      if (!apiUserDataWithoutToken) {
        throw new Error('Не удалось получить данные пользователя');
      }
      
      const userProfile = createUserProfileFromApiData(apiUserDataWithoutToken, email);
      setUserData(userProfile);
    } else {
      const userProfile = createUserProfileFromApiData(apiUserData, email);
      setUserData(userProfile);
    }
    
  } catch (error) {
    alert('Ошибка при загрузке профиля. Пожалуйста, войдите снова.');
    handleEmailLogout(navigate);
  } finally {
    setLoading(false);
  }
};

const createUserProfileFromApiData = (apiUserData, email) => {
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

const handleEmailLogout = (navigate) => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_timestamp');
  localStorage.removeItem('remember_me');
  localStorage.removeItem('login_type');
  navigate('/login');
};