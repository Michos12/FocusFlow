const API_URL = "http://localhost:4000/api";

// This module is not a React component, so it cannot call hooks such as
// useNavigate. AuthProvider registers a handler here instead, and the redirect
// happens through the router once the session is cleared.
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    // The session is an httpOnly cookie the page cannot read, so the browser
    // has to be told to attach it to these cross-origin requests.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      onUnauthorized?.();
    }

    throw new Error(errorData.message || "Error in the API request");
  }

  if (response.status === 204) return null;
  return response.json();
};
