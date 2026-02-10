export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isTokenValid = (decodedToken) => {
  if (!decodedToken?.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp > currentTime;
};

export const saveTokens = (tokenData) => {
  if (tokenData.access_token) {
    localStorage.setItem('access_token', tokenData.access_token);
    localStorage.setItem('token_timestamp', Date.now().toString());
    console.log('Access token saved to localStorage');
  }
  
  if (tokenData.refresh_token) {
    localStorage.setItem('refresh_token', tokenData.refresh_token);
  }
  
  if (tokenData.id_token) {
    localStorage.setItem('id_token', tokenData.id_token);
  }
};

export const cleanOAuthParamsFromUrl = () => {
  if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    console.log('URL cleaned from OAuth parameters');
  }
};