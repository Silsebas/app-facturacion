import { useState } from 'react';
import { useFacturasStore } from '../store/useStore';
import { getLocalDate } from '../config/constants';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function History({ setView }) {
  const facturas = useFacturasStore(state => state.facturas);
  const borrarHistorial = useFacturasStore(state => state.borrarHistorial);
  const actualizarMetodoPago = useFacturasStore(state => state.actualizarMetodoPago); 
  const fechaHoy = getLocalDate();

  const [filtro, setFiltro] = useState('');
  
  // NUEVO: Estado para saber qué factura está abierta viendo el detalle
  const [facturaExpandida, setFacturaExpandida] = useState(null);

  const facturasFiltradas = facturas.filter(f => {
    const termino = filtro.toLowerCase();
    return (
      f.cliente.toLowerCase().includes(termino) ||
      f.metodoPago.toLowerCase().includes(termino) ||
      f.total.toString().includes(termino)
    );
  });

  // --- LÓGICA DE EXPORTACIÓN ---
  const prepararDatosTabulares = () => {
    const filas = [];
    let granTotal = 0;
    facturasFiltradas.forEach(factura => {
      factura.lineas.forEach(linea => {
        const montoLinea = (parseFloat(linea.cant) || 0) * (parseFloat(linea.precio) || 0);
        filas.push({
          fecha: factura.fecha,
          cliente: factura.cliente,
          detalle: `${linea.cant}x ${linea.desc}`,
          metodoPago: factura.metodoPago,
          montoNumerico: montoLinea,
          montoFormateado: `₡${montoLinea.toLocaleString()}`
        });
      });
      granTotal += factura.total;
    });
    return { filas, granTotal };
  };

  const exportarExcel = () => {
    const { filas, granTotal } = prepararDatosTabulares();
    const datosExcel = filas.map(f => ({
      'Fecha': f.fecha, 'Cliente': f.cliente, 'Detalle del Pedido': f.detalle,
      'Forma de Pago': f.metodoPago, 'Monto Línea': f.montoNumerico
    }));
    datosExcel.push({ 'Fecha': '', 'Cliente': '', 'Detalle del Pedido': '', 'Forma de Pago': 'TOTAL FILTRADO:', 'Monto Línea': granTotal });
    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Ventas");
    XLSX.writeFile(libro, `Reporte_Ventas_${fechaHoy}.xlsx`);
  };

  const exportarPDF = () => {
    const { filas, granTotal } = prepararDatosTabulares();
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text(`Reporte de Ventas`, 14, 15);
    doc.setFontSize(11); doc.setTextColor(100); doc.text(`Fecha: ${fechaHoy} ${filtro ? `| Filtro: "${filtro}"` : ''}`, 14, 22);
    
    const columnas = ["Fecha", "Cliente", "Detalle", "Método", "Monto"];
    const datosTabla = filas.map(f => [f.fecha, f.cliente, f.detalle, f.metodoPago, `CRC ${f.montoNumerico.toLocaleString()}`]);
    datosTabla.push(["", "", "", "TOTAL FILTRADO:", `CRC ${granTotal.toLocaleString()}`]);

    autoTable(doc, {
      head: [columnas], body: datosTabla, startY: 30, theme: 'grid', headStyles: { fillColor: [37, 99, 235] },
      didParseCell: function (data) {
        if (data.row.index === datosTabla.length - 1) {
          data.cell.styles.fontStyle = 'bold'; data.cell.styles.fillColor = [243, 244, 246];
        }
      }
    });
    doc.save(`Reporte_Ventas_${fechaHoy}.pdf`);
  };

  const handleBorrar = () => {
    const confirmacion = window.confirm("⚠️ ATENCIÓN: ¿Estás seguro de que quieres BORRAR TODAS las facturas? \n\n¡Asegúrate de haber descargado el reporte primero!");
    if (confirmacion) borrarHistorial();
  };

  // NUEVO: Función para alternar la vista del detalle
  const toggleDetalle = (id) => {
    if (facturaExpandida === id) {
      setFacturaExpandida(null); // Si ya está abierta, la cerramos
    } else {
      setFacturaExpandida(id); // Si está cerrada, la abrimos
    }
  };

  // --- VISTA (UI) ---
  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      <div className="bg-white p-4 pb-2 shadow-sm z-10 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <button onClick={() => setView('home')} className="text-gray-500 font-bold text-xl px-2 mr-2">←</button>
            <h2 className="text-xl font-bold">Historial</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={exportarExcel} disabled={facturasFiltradas.length === 0} className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center transition-colors ${facturasFiltradas.length > 0 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400'}`}>📊 Excel</button>
            <button onClick={exportarPDF} disabled={facturasFiltradas.length === 0} className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center transition-colors ${facturasFiltradas.length > 0 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-400'}`}>📄 PDF</button>
          </div>
        </div>

        {facturas.length > 0 && (
          <input 
            type="text" placeholder="🔍 Buscar cliente, método o monto..." value={filtro} onChange={(e) => setFiltro(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        )}
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {facturas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full"><p className="text-gray-400 mb-2">Aún no hay facturas guardadas.</p></div>
        ) : facturasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full"><p className="text-gray-400 mb-2">No se encontraron resultados para "{filtro}".</p></div>
        ) : (
          facturasFiltradas.map(f => {
            const esPendiente = f.metodoPago === 'Pendiente de pago';
            const estaAbierta = facturaExpandida === f.id; // ¿Esta tarjeta es la que está abierta?

            return (
              <div key={f.id} className={`bg-white rounded-xl shadow-sm mb-3 flex flex-col border-l-4 overflow-hidden transition-all duration-200 ${esPendiente ? 'border-orange-500' : 'border-blue-500'}`}>
                
                {/* ÁREA CLICKEABLE (Cabecera de la factura) */}
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleDetalle(f.id)}
                >
                  <div>
                    <p className="font-bold flex items-center gap-2">
                      {f.cliente}
                      {/* Icono de flechita que rota si está abierta */}
                      <span className={`text-gray-400 text-xs transition-transform duration-200 ${estaAbierta ? 'rotate-180' : ''}`}>▼</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {f.fecha} • <span className={esPendiente ? 'text-orange-600 font-bold' : ''}>{f.metodoPago}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{f.lineas.length} producto(s)</p>
                  </div>
                  <p className="font-bold text-gray-800">₡{f.total.toLocaleString()}</p>
                </div>

                {/* DETALLE DESPLEGABLE (Solo se muestra si la tarjeta está abierta) */}
                {estaAbierta && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 pt-3">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Detalle de Compra:</p>
                    <ul className="space-y-2">
                      {f.lineas.map((linea, index) => {
                        const montoLinea = (parseFloat(linea.cant) || 0) * (parseFloat(linea.precio) || 0);
                        return (
                          <li key={index} className="flex justify-between text-sm text-gray-700">
                            <span>{linea.cant}x {linea.desc}</span>
                            <span className="font-medium text-gray-900">₡{montoLinea.toLocaleString()}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* BOTONES DE COBRO RÁPIDO (Pendiente) */}
                {esPendiente && (
                  <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); actualizarMetodoPago(f.id, 'Efectivo'); }} className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors">💵 Efectivo</button>
                    <button onClick={(e) => { e.stopPropagation(); actualizarMetodoPago(f.id, 'SINPE'); }} className="flex-1 bg-purple-100 text-purple-700 py-2 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors">📱 SINPE</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {facturas.length > 0 && (
        <div className="p-4 bg-white border-t border-red-100 flex flex-col items-center">
          <button onClick={handleBorrar} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-colors border border-red-200">🗑️ Limpiar Datos del Día</button>
        </div>
      )}
    </div>
  );
}