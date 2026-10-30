import { useState } from 'react';
import { useFacturasStore } from '../store/useStore';

export default function Maintenance({ setView }) {
  const { productos, precios, agregarProducto, eliminarProducto, agregarPrecio, eliminarPrecio } = useFacturasStore();
  
  const [nuevoProducto, setNuevoProducto] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [pestaña, setPestaña] = useState('productos'); // 'productos' o 'precios'

  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (nuevoProducto.trim() && !productos.includes(nuevoProducto.trim())) {
      agregarProducto(nuevoProducto.trim());
      setNuevoProducto('');
    }
  };

  const handleAgregarPrecio = (e) => {
    e.preventDefault();
    const precioNum = Number(nuevoPrecio);
    if (precioNum > 0 && !precios.includes(precioNum)) {
      agregarPrecio(precioNum);
      setNuevoPrecio('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 flex items-center justify-between shadow-sm border-b">
        <button onClick={() => setView('home')} className="text-gray-500 font-bold text-xl px-2">←</button>
        <h2 className="text-xl font-bold">Mantenimiento</h2>
        <div className="w-8"></div>
      </div>

      <div className="flex bg-white border-b">
        <button onClick={() => setPestaña('productos')} className={`flex-1 py-3 font-bold text-sm ${pestaña === 'productos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          🍔 Productos
        </button>
        <button onClick={() => setPestaña('precios')} className={`flex-1 py-3 font-bold text-sm ${pestaña === 'precios' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
          💰 Precios
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {pestaña === 'productos' ? (
          <>
            <form onSubmit={handleAgregarProducto} className="flex gap-2 mb-4">
              <input type="text" value={nuevoProducto} onChange={(e) => setNuevoProducto(e.target.value)} placeholder="Ej. Empanada de queso" className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" />
              <button type="submit" disabled={!nuevoProducto} className="bg-blue-600 text-white font-bold px-4 rounded-lg disabled:bg-gray-300">+</button>
            </form>
            <div className="bg-white rounded-xl shadow-sm border p-2">
              {productos.map(p => (
                <div key={p} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
                  <span className="text-gray-700">{p}</span>
                  <button onClick={() => eliminarProducto(p)} className="text-red-500 font-bold px-2 py-1 bg-red-50 rounded-lg text-xs">✕</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleAgregarPrecio} className="flex gap-2 mb-4">
              <input type="number" inputMode="numeric" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} placeholder="Ej. 1500" className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 outline-none" />
              <button type="submit" disabled={!nuevoPrecio} className="bg-blue-600 text-white font-bold px-4 rounded-lg disabled:bg-gray-300">+</button>
            </form>
            <div className="bg-white rounded-xl shadow-sm border p-2">
              {precios.map(p => (
                <div key={p} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
                  <span className="text-gray-700 font-bold">₡{p.toLocaleString()}</span>
                  <button onClick={() => eliminarPrecio(p)} className="text-red-500 font-bold px-2 py-1 bg-red-50 rounded-lg text-xs">✕</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}