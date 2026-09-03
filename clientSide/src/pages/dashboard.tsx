import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';
import { fetchAPI } from '../services/api';
import { CheckCircle2, Circle, Trash2, LogOut, Plus, ListTodo, Calendar } from 'lucide-react';
import type { Todo } from '../interface/todo';

export default function Dashboard() {
  const { logout } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const loadTodos = async () => {
    try {
      const data = await fetchAPI('/todos');
      setTodos(data || []);
    } catch (error) {
      console.error("Error loading Todos", error);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await fetchAPI('/todos', {
        method: 'POST',
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          description: newDescription.trim() 
        }) 
      });
      setNewTitle("");
      setNewDescription("");
      loadTodos();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
    try {
      await fetchAPI(`/todos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !currentStatus })
      });
    } catch {
      loadTodos();
    }
  };

  const deleteTodo = async (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      await fetchAPI(`/todos/${id}`, { method: 'DELETE' });
    } catch {
      loadTodos();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Navbar Minimalista */}
      <nav className="bg-white border-b border-slate-200 mb-8">
        <div className="max-w-4xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ListTodo size={20} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">FocusFlow</span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6">
        {/* Sección de Bienvenida */}
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Tasks</h1>
          <div className="flex items-center text-slate-500 text-sm gap-2">
            <Calendar size={14} />
            <span>{todos.filter(t => !t.completed).length} tasks</span>
          </div>
        </header>

        {/* Card del Formulario */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-10">
          <form onSubmit={handleAddTodo} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full text-lg font-semibold placeholder:text-slate-400 border-none focus:ring-0 p-0"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add details..."
                className="w-full text-slate-600 placeholder:text-slate-400 border-none focus:ring-0 p-0 resize-none h-12 text-sm"
              />
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-50">
              <button 
                type="submit"
                disabled={!newTitle.trim()}
                className="bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              >
                <Plus size={18} /> Add Task
              </button>
            </div>
          </form>
        </section>

        {/* Lista de Todos */}
        <section className="space-y-4">
          {todos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500 font-medium">No pending tasks</p>
              <p className="text-slate-400 text-sm">Enjoy your free time!</p>
            </div>
          ) : (
            todos.map(todo => (
              <div 
                key={todo.id} 
                className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                  todo.completed 
                    ? 'bg-slate-50 border-slate-100 opacity-75' 
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50'
                }`}
              >
                <button 
                  onClick={() => toggleStatus(todo.id, todo.completed)}
                  className={`mt-1 transition-colors ${todo.completed ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-400'}`}
                >
                  {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-slate-800 leading-tight mb-1 truncate ${todo.completed ? 'line-through text-slate-400' : ''}`}>
                    {todo.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${todo.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                    {todo.description}
                  </p>
                </div>

                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}