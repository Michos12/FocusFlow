const getToken = () => localStorage.getItem("token");
import { useNavigate } from 'react-router-dom';


const API_URL = "http://localhost:4000/api";

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const navigate = useNavigate();
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
    navigate('/login'); // Redirect to login on error
    throw new Error(errorData.message || "Error in the API request");
  }

  if (response.status === 204) return null;
  return response.json();
};