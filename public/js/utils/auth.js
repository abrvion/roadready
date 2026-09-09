const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const setAuth = ({ token, user }) => {
  if (!token) throw new Error("Authentication token was not returned by the server.");
  localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const authHeaders = (extra = {}) => {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
};

export const verifySession = async () => {
  const token = getToken();
  if (!token) return null;

  const response = await fetch("/api/auth/me", {
    headers: authHeaders()
  });

  if (!response.ok) {
    if (response.status === 401) clearAuth();
    return null;
  }

  const data = await response.json();
  if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user || null;
};
