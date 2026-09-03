const getToken = () => localStorage.getItem("token");

const API_URL = "http://localhost:4000/api";

// This module is not a React component, so it cannot call hooks such as
// useNavigate. AuthProvider registers a handler here instead, and the redirect
// happens through the router once the session is cleared.
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Only an expired or invalid token ends the session. A failed login has no
    // token to expire, and a 400 must not throw the user out of the app.
    if (response.status === 401 && token) {
      onUnauthorized?.();
    }

    throw new Error(errorData.message || "Error in the API request");
  }

  if (response.status === 204) return null;
  return response.json();
};
