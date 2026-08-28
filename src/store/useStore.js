import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFacturasStore = create(
  persist(
    (set, get) => ({
      facturas: [],
      
      guardarFactura: (nuevaFactura) => set((state) => ({ 
        facturas: [nuevaFactura, ...state.facturas] 
      })),
      
      // NUEVA FUNCIÓN: Busca la factura por ID y le cambia el método de pago
      actualizarMetodoPago: (id, nuevoMetodo) => set((state) => ({
        facturas: state.facturas.map(f => 
          f.id === id ? { ...f, metodoPago: nuevoMetodo } : f
        )
      })),
      
      obtenerTotalDelDia: (fechaHoy) => {
        const { facturas } = get();
        return facturas
          .filter(f => f.fecha === fechaHoy)
          .reduce((total, f) => total + f.total, 0);
      },
      
      borrarHistorial: () => set({ facturas: [] })
    }),
    { name: 'facturador-db' }
  )
);