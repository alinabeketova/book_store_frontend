// Функция для получения данных пользователя из API с токеном
export const fetchUserDataFromAPI = async (email, accessToken = null) => {
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    // Если передан токен, добавляем Authorization header
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(`http://127.0.0.1:8001/user_email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      console.error('Failed to fetch user data from API:', response.status, response.statusText);
      return null;
    }

    const userData = await response.json();
    console.log('User data from API:', userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data from API:', error);
    return null;
  }
};