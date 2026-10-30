import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTOS_PRECARGADOS, PRECIOS_PRECARGADOS } from '../config/constants';

export const useFacturasStore = create(
  persist(
    (set, get) => ({
      facturas: [],
      // Inicializamos con los estáticos, pero ahora vivirán en la base de datos local
      productos: PRODUCTOS_PRECARGADOS,
      precios: PRECIOS_PRECARGADOS,
      
      // Funciones de Facturas
      guardarFactura: (nuevaFactura) => set((state) => ({ 
        facturas: [nuevaFactura, ...state.facturas] 
      })),
      actualizarMetodoPago: (id, nuevoMetodo) => set((state) => ({
        facturas: state.facturas.map(f => f.id === id ? { ...f, metodoPago: nuevoMetodo } : f)
      })),
      obtenerTotalDelDia: (fechaHoy) => {
        const { facturas } = get();
        return facturas.filter(f => f.fecha === fechaHoy).reduce((total, f) => total + f.total, 0);
      },
      borrarHistorial: () => set({ facturas: [] }),

      // Funciones de Mantenimiento
      agregarProducto: (producto) => set((state) => ({ 
        productos: [...state.productos, producto].sort() 
      })),
      eliminarProducto: (producto) => set((state) => ({ 
        productos: state.productos.filter(p => p !== producto) 
      })),
      
      agregarPrecio: (precio) => set((state) => ({ 
        precios: [...state.precios, Number(precio)].sort((a, b) => a - b) 
      })),
      eliminarPrecio: (precio) => set((state) => ({ 
        precios: state.precios.filter(p => p !== precio) 
      })),
    }),
    { name: 'facturador-db' }
  )
);