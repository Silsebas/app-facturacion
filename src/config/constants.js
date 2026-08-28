// src/config/constants.js
export const PRODUCTOS_PRECARGADOS = [
  'Hamburguesa', 'Perro caliente', 'Picadillo', 'Arroz c/ pollo', 
  'Gallo de salchichón', 'Sándwich', 'Arroz c/ leche', 'Fresco', 
  'Tamales', 'Tacos', 'Pan dulce', 'Tamal asado', 'Tamal de maicena', 
  'Café', 'Chirribisco', 'Empanadas', 'Gelatinas'
];

export const PRECIOS_PRECARGADOS = [200, 300, 500, 600, 1000, 1200, 1500, 2000];
export const BILLETES_RAPIDOS = [1000, 2000, 3000, 4000, 5000, 10000];
export const METODOS_PAGO = ['Efectivo', 'SINPE', 'Pendiente de pago'];

export const getLocalDate = () => new Date().toLocaleDateString('sv-SE');