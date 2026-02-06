// api/profileApi.js

/**
 * PATCH-запрос для обновления данных пользователя
 * @param {Object} updates - Обновляемые данные
 * @param {Object} currentData - Текущие данные пользователя
 * @returns {Promise<Object>} - Ответ сервера
 */
export async function patchUser(updates, currentData) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Токен отсутствует');

  // Определяем обязательные и необязательные поля
  const optionalFields = ['middle_name', 'address']; // Поля, которые могут быть пустыми
  
  // Собираем все поля пользователя для отправки
  const payload = {
    email: currentData.email,
    password: updates.password || 'dummy_password',
    first_name: updates.first_name || currentData.first_name || '',
    last_name: updates.last_name || currentData.last_name || '',
    date_of_birth: updates.date_of_birth || currentData.date_of_birth || '',
    passport_number: updates.passport_number || currentData.passport_number || '',
  };

  // Добавляем необязательные поля - если они есть в updates
  optionalFields.forEach(field => {
    if (field in updates) {
      // Если поле есть в updates, используем его значение (даже если оно пустое)
      payload[field] = updates[field];
    } else if (field in currentData) {
      // Если поля нет в updates, но есть в текущих данных, используем текущие данные
      payload[field] = currentData[field] || '';
    } else {
      // Если поля нет нигде, отправляем пустую строку
      payload[field] = '';
    }
  });

  console.log('Отправляемые данные patchUser:', payload);

  // Создаем URLSearchParams для отправки данных
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => {
    // Для необязательных полей отправляем пустую строку, если значение пустое
    if (optionalFields.includes(k) && (v === '' || v === null || v === undefined)) {
      params.append(k, '');
    } 
    // Для обязательных полей отправляем значение
    else if (v !== undefined && v !== null) {
      params.append(k, String(v));
    }
  });

  const res = await fetch(`http://127.0.0.1:8001/user?${params.toString()}`, {
    method: 'PATCH',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    },
  });

  const responseText = await res.text();
  console.log('Ответ сервера (статус:', res.status, '):', responseText);

  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.message || errorData.detail || 'Ошибка при обновлении данных';
    } catch {
      errorMessage = responseText || 'Ошибка при обновлении данных';
    }
    throw new Error(errorMessage);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {};
  }
}

/**
 * Получение данных пользователя
 * @returns {Promise<Object>} - Данные пользователя
 */
export async function getUserData() {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Токен отсутствует');

  const response = await fetch('http://127.0.0.1:8001/user', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Обновление профиля пользователя
 * @param {Object} userData - Данные для обновления
 * @returns {Promise<Object>} - Обновленные данные
 */
export async function updateUserProfile(userData) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Токен отсутствует');

  const response = await fetch('http://127.0.0.1:8001/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}