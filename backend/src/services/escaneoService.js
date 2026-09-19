const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const PLANTNET_TIMEOUT_MS = 120000;

// ── PLANTNET ──
async function identificarConPlantNet(fotoBuffer, mimeType = 'image/jpeg') {
  const form = new FormData();
  form.append('images', fotoBuffer, {
    filename: 'planta.jpg',
    contentType: mimeType,
  });

  const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}&lang=es&nb-results=1`;

  const response = await axios.post(url, form, {
    headers: form.getHeaders(),
    timeout: PLANTNET_TIMEOUT_MS,
  });

  const resultado = response.data.results[0];

  return {
    nombreComun: resultado.species.commonNames?.[0] || resultado.species.scientificNameWithoutAuthor,
    nombreCientifico: resultado.species.scientificNameWithoutAuthor,
    coincidencia: Math.round(resultado.score * 100),
  };
}

// ── GEMINI ──
async function obtenerParametrosConGemini(nombreCientifico) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const prompt = `
    Eres un experto en plantas. Dame los parámetros óptimos de cuidado para la planta "${nombreCientifico}".
    Responde ÚNICAMENTE con un objeto JSON sin texto adicional, sin bloques de código, sin explicaciones.
    El JSON debe tener exactamente estas propiedades:
    {
      "humedadIdeal": número entre 0 y 100 (porcentaje de humedad del suelo),
      "temperaturaIdeal": número en grados Celsius,
      "luzIdeal": texto corto como "Alta", "Media" o "Baja",
      "umbralHumedadMinimo": número entre 0 y 100 (por debajo de este % se debe regar)
    }
  `;

  const result = await model.generateContent(prompt);
  const texto = result.response.text().trim();

  // Limpia por si Gemini manda bloques de código
  const limpio = texto.replace(/```json|```/g, '').trim();
  const parametros = JSON.parse(limpio);

  return parametros;
}

module.exports = { identificarConPlantNet, obtenerParametrosConGemini };