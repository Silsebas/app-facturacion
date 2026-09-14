import { useState } from 'react';
import Home from './components/Home';
import NewInvoice from './components/NewInvoice';
import History from './components/History';

export default function App() {
  const [view, setView] = useState('home');

  return (
    // md:p-4 hace que los márgenes grises solo aparezcan en pantallas grandes
    <div className="min-h-screen bg-gray-100 flex items-center justify-center md:p-4 font-sans text-gray-800">
      
      {/* 
        CAMBIOS CLAVE AQUÍ:
        1. max-w-3xl: Permite que sea más ancho en tablets.
        2. h-[100dvh]: Usa altura dinámica para arreglar el scroll.
        3. md:h-[90vh] md:rounded-2xl: Mantiene el diseño de "tarjeta" en PC.
      */}
      <div className="w-full max-w-3xl bg-white shadow-xl overflow-hidden h-[100dvh] md:h-[90vh] md:rounded-2xl flex flex-col relative">
        
        {view === 'home' && <Home setView={setView} />}
        {view === 'new' && <NewInvoice setView={setView} />}
        {view === 'history' && <History setView={setView} />}
        
      </div>
    </div>
  );
}