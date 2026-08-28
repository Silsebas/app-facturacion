import { useFacturasStore } from '../store/useStore';
import { getLocalDate } from '../config/constants';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function History({ setView }) {
  const facturas = useFacturasStore(state => state.facturas);
  const borrarHistorial = useFacturasStore(state => state.borrarHistorial);
  // Traemos la nueva función
  const actualizarMetodoPago = useFacturasStore(state => state.actualizarMetodoPago); 
  const fechaHoy = getLocalDate();

  // --- LÓGICA DE EXPORTACIÓN (Sin cambios) ---
  const prepararDatosTabulares = () => {
    const filas = [];
    let granTotal = 0;
    facturas.forEach(factura => {
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
    datosExcel.push({ 'Fecha': '', 'Cliente': '', 'Detalle del Pedido': '', 'Forma de Pago': 'TOTAL DEL DÍA:', 'Monto Línea': granTotal });
    const hoja = XLSX.utils.json_to_sheet(datosExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Ventas");
    XLSX.writeFile(libro, `Reporte_Ventas_${fechaHoy}.xlsx`);
  };

  const exportarPDF = () => {
    const { filas, granTotal } = prepararDatosTabulares();
    const doc = new jsPDF();
    
    doc.setFontSize(18); doc.text(`Reporte de Ventas del Día`, 14, 15);
    doc.setFontSize(11); doc.setTextColor(100); doc.text(`Fecha de exportación: ${fechaHoy}`, 14, 22);
    
    const columnas = ["Fecha", "Cliente", "Detalle", "Método", "Monto"];
    
    // Aquí cambiamos el '₡' por 'CRC ' (o puedes usar 'C. ' si lo prefieres) solo para el PDF
    const datosTabla = filas.map(f => [
      f.fecha, 
      f.cliente, 
      f.detalle, 
      f.metodoPago, 
      f.montoFormateado.replace('₡', 'CRC ') // <-- EL CAMBIO ESTÁ AQUÍ
    ]);
    
    // Y también lo cambiamos en la fila del Gran Total
    datosTabla.push(["", "", "", "TOTAL DEL DÍA:", `CRC ${granTotal.toLocaleString()}`]);

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

  // --- VISTA (UI) ---
  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      <div className="bg-white p-4 flex items-center justify-between shadow-sm border-b">
        <button onClick={() => setView('home')} className="text-gray-500 font-bold text-xl px-2">←</button>
        <h2 className="text-xl font-bold">Historial</h2>
        <div className="flex gap-2">
          <button onClick={exportarExcel} disabled={facturas.length === 0} className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm transition-colors ${facturas.length > 0 ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400'}`}>📊 Excel</button>
          <button onClick={exportarPDF} disabled={facturas.length === 0} className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm transition-colors ${facturas.length > 0 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-400'}`}>📄 PDF</button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {facturas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full"><p className="text-gray-400 mb-2">Aún no hay facturas guardadas.</p></div>
        ) : (
          facturas.map(f => {
            // Evaluamos si está pendiente para cambiar el color visualmente
            const esPendiente = f.metodoPago === 'Pendiente de pago';
            
            return (
              <div key={f.id} className={`bg-white p-4 rounded-xl shadow-sm mb-3 flex flex-col border-l-4 ${esPendiente ? 'border-orange-500' : 'border-blue-500'}`}>
                
                {/* Info principal */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{f.cliente}</p>
                    <p className="text-xs text-gray-500">
                      {f.fecha} • <span className={esPendiente ? 'text-orange-600 font-bold' : ''}>{f.metodoPago}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{f.lineas.length} producto(s)</p>
                  </div>
                  <p className="font-bold text-gray-800">₡{f.total.toLocaleString()}</p>
                </div>

                {/* ZONA DE COBRO RÁPIDO: Solo se muestra si la factura está pendiente */}
                {esPendiente && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <button 
                      onClick={() => actualizarMetodoPago(f.id, 'Efectivo')}
                      className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors"
                    >
                      💵 Efectivo
                    </button>
                    <button 
                      onClick={() => actualizarMetodoPago(f.id, 'SINPE')}
                      className="flex-1 bg-purple-100 text-purple-700 py-2 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors"
                    >
                      📱 SINPE
                    </button>
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