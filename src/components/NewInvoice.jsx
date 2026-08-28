import { useState } from 'react';
import { useFacturasStore } from '../store/useStore';
import { PRODUCTOS_PRECARGADOS, PRECIOS_PRECARGADOS, BILLETES_RAPIDOS, METODOS_PAGO, getLocalDate } from '../config/constants';

export default function NewInvoice({ setView }) {
  const guardarFacturaEnDB = useFacturasStore(state => state.guardarFactura);

  const [fecha, setFecha] = useState(getLocalDate());
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [lineas, setLineas] = useState([{ id: 1, desc: '', cant: 1, precio: '', isCustomDesc: false, isCustomPrecio: false }]);
  
  const [modoCobro, setModoCobro] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState('');

  const calcularTotal = () => lineas.reduce((acc, linea) => acc + ((parseFloat(linea.cant) || 0) * (parseFloat(linea.precio) || 0)), 0);
  const total = calcularTotal();
  const vuelto = montoRecibido ? parseFloat(montoRecibido) - total : 0;

  const agregarLinea = () => setLineas([...lineas, { id: Date.now(), desc: '', cant: 1, precio: '', isCustomDesc: false, isCustomPrecio: false }]);
  const actualizarLinea = (id, campo, valor) => setLineas(lineas.map(l => l.id === id ? { ...l, [campo]: valor } : l));
  const eliminarLinea = (id) => { if (lineas.length > 1) setLineas(lineas.filter(l => l.id !== id)); };

  const finalizarCompra = () => {
    const nuevaFactura = {
      id: Date.now(),
      fecha,
      cliente: cliente || 'Cliente de Contado',
      metodoPago,
      total,
      lineas: lineas.filter(l => l.desc !== '' && l.precio !== '').map(l => ({
        desc: l.desc,
        cant: l.cant,
        precio: l.precio
      }))
    };
    guardarFacturaEnDB(nuevaFactura);
    setView('home');
  };

  if (modoCobro) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Cobrar Factura</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center mb-6 border-2 border-blue-100">
          <p className="text-gray-500 mb-2">Total a Pagar</p>
          <p className="text-4xl font-bold text-blue-600">₡{total.toLocaleString()}</p>
        </div>
        {metodoPago === 'Efectivo' && (
          <>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Monto Recibido</label>
            <input 
              type="number" inputMode="numeric" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)}
              placeholder="Ej. 5000" className="w-full border-2 border-gray-300 rounded-xl p-4 text-2xl text-center mb-4" 
            />
            <div className="grid grid-cols-3 gap-2 mb-6">
              {BILLETES_RAPIDOS.map(billete => (
                <button key={billete} onClick={() => setMontoRecibido(billete)} className="bg-gray-100 hover:bg-gray-200 py-3 rounded-lg font-semibold text-gray-700">
                  ₡{billete}
                </button>
              ))}
            </div>
            <div className={`p-4 rounded-xl text-center mb-6 ${vuelto >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="text-sm mb-1 font-semibold">Vuelto a entregar:</p>
              <p className="text-3xl font-bold">₡{vuelto >= 0 ? vuelto.toLocaleString() : '0'}</p>
            </div>
          </>
        )}
        <div className="mt-auto flex gap-3">
          <button onClick={() => setModoCobro(false)} className="w-1/3 bg-gray-200 hover:bg-gray-300 font-bold py-4 rounded-xl text-gray-700">Atrás</button>
          <button onClick={finalizarCompra} className="w-2/3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-md">Confirmar y Guardar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 flex items-center justify-between shadow-sm border-b">
        <button onClick={() => setView('home')} className="text-gray-500 font-bold text-xl">←</button>
        <h2 className="text-xl font-bold">Nueva Factura</h2>
        <div className="w-8"></div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <div className="flex gap-2 mb-3">
            <div className="w-1/2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Método</label>
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white">
                {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Cliente (Opcional)</label>
          <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre del cliente" className="w-full border border-gray-300 rounded-lg p-2" />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
          <h3 className="font-bold mb-3 border-b pb-2 text-gray-700">Detalle del Pedido</h3>
          {lineas.map((linea) => (
            <div key={linea.id} className="flex gap-2 mb-2 items-center">
              <div className="w-1/2">
                {!linea.isCustomDesc ? (
                  <select 
                    value={linea.desc}
                    onChange={(e) => {
                      if(e.target.value === 'OTRO') actualizarLinea(linea.id, 'isCustomDesc', true);
                      else actualizarLinea(linea.id, 'desc', e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                  >
                    <option value="" disabled>Menú...</option>
                    {PRODUCTOS_PRECARGADOS.map(p => <option key={p} value={p}>{p}</option>)}
                    <option value="OTRO" className="font-bold">✍️ Escribir...</option>
                  </select>
                ) : (
                  <input type="text" placeholder="Escriba..." value={linea.desc} autoFocus onChange={(e) => actualizarLinea(linea.id, 'desc', e.target.value)} className="w-full border border-blue-500 rounded-lg p-2 text-sm" />
                )}
              </div>
              <input type="number" inputMode="numeric" min="1" value={linea.cant} onChange={(e) => actualizarLinea(linea.id, 'cant', e.target.value)} className="w-1/6 border border-gray-300 rounded-lg p-2 text-sm text-center" />
              <div className="w-1/3">
                {!linea.isCustomPrecio ? (
                  <select 
                    value={linea.precio}
                    onChange={(e) => {
                      if(e.target.value === 'OTRO') actualizarLinea(linea.id, 'isCustomPrecio', true);
                      else actualizarLinea(linea.id, 'precio', e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                  >
                    <option value="" disabled>₡...</option>
                    {PRECIOS_PRECARGADOS.map(p => <option key={p} value={p}>{p}</option>)}
                    <option value="OTRO" className="font-bold">✍️ Otro...</option>
                  </select>
                ) : (
                  <input type="number" inputMode="numeric" placeholder="₡..." value={linea.precio} autoFocus onChange={(e) => actualizarLinea(linea.id, 'precio', e.target.value)} className="w-full border border-blue-500 rounded-lg p-2 text-sm" />
                )}
              </div>
              {lineas.length > 1 && (
                <button onClick={() => eliminarLinea(linea.id)} className="text-red-500 font-bold px-1">✕</button>
              )}
            </div>
          ))}
          <button onClick={agregarLinea} className="text-blue-600 font-semibold text-sm mt-3 flex items-center">
            <span className="text-lg mr-1">+</span> Agregar línea
          </button>
        </div>
      </div>
      <div className="p-4 bg-white border-t flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total a cobrar</p>
          <p className="text-2xl font-bold text-gray-900">₡{total.toLocaleString()}</p>
        </div>
        <button 
          onClick={() => setModoCobro(true)} disabled={total === 0}
          className={`px-8 py-3 rounded-xl font-bold transition-colors shadow-md ${total > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Facturar
        </button>
      </div>
    </div>
  );
}