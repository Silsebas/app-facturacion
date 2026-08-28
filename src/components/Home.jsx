import { useFacturasStore } from '../store/useStore';
import { getLocalDate } from '../config/constants';

export default function Home({ setView }) {
  const fechaHoy = getLocalDate();
  const totalHoy = useFacturasStore(state => state.obtenerTotalDelDia(fechaHoy));

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mt-8 mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600">Facturador Web</h1>
        <p className="text-gray-500 mt-1">Práctico y sencillo</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-center shadow-sm">
        <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Ventas de Hoy</p>
        <p className="text-4xl font-bold text-gray-800">₡{totalHoy.toLocaleString()}</p>
      </div>

      <div className="flex flex-col gap-4 mt-auto mb-8">
        <button onClick={() => setView('new')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md text-lg">
          + Nueva Factura
        </button>
        <button onClick={() => setView('history')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-colors text-lg">
          Ver Historial
        </button>
      </div>
    </div>
  );
}