// src/App.jsx
import { useState } from 'react';
import Home from './components/Home';
import NewInvoice from './components/NewInvoice';
import History from './components/History';

export default function App() {
  const [view, setView] = useState('home');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden h-[85vh] flex flex-col relative">
        {view === 'home' && <Home setView={setView} />}
        {view === 'new' && <NewInvoice setView={setView} />}
        {view === 'history' && <History setView={setView} />}
      </div>
    </div>
  );
}