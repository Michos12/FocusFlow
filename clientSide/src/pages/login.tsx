import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // El contexto hace la petición y guarda la sesión; el token viaja en una
      // cookie httpOnly que este código no puede leer.
      await login(email, password);

      // Redirigimos al dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trouble logging in. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 ">
      <div className="w-full max-w-md rounded-xl p-8 shadow-lg ring-1 ring-gray-200 bg-white">
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-full bg-blue-100 p-3 text-blue-600 mb-4">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-500">Sign in to your account to manage your tasks</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
          >
            Log in
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Dont have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">Register here</Link>
        </p>
      </div>
    </div>
  );
}