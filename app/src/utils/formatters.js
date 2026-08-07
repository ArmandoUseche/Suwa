// Formatea cuánto pasó desde una fecha ISO en un texto corto en español,
// tipo "hace 2 min". Vive aparte de la pantalla para poder reusarlo en
// Historial (Paso 6) y testearlo sin montar componentes.
export function formatearTiempoRelativo(fechaIso) {
  const segundos = Math.max(0, Math.floor((Date.now() - new Date(fechaIso).getTime()) / 1000));

  if (segundos < 60) return 'hace un momento';

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}
