const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const PLANTNET_TIMEOUT_MS = 120000;
const PLANTNET_RESULTADOS = 5;
const GEMINI_MODELO = 'gemini-3.6-flash';

// ── PLANTNET ──
async function identificarConPlantNet(fotoBuffer, mimeType = 'image/jpeg') {
  const form = new FormData();
  form.append('images', fotoBuffer, {
    filename: 'planta.jpg',
    contentType: mimeType,
  });

  const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}&lang=es&nb-results=${PLANTNET_RESULTADOS}`;

  const response = await axios.post(url, form, {
    headers: form.getHeaders(),
    timeout: PLANTNET_TIMEOUT_MS,
  });

  const resultados = Array.isArray(response.data.results) ? response.data.results : [];

  return resultados.map((resultado) => ({
    nombreComun: resultado.species.commonNames?.[0] || resultado.species.scientificNameWithoutAuthor,
    nombreCientifico: resultado.species.scientificNameWithoutAuthor,
    coincidencia: Math.round(resultado.score * 100),
  }));
}

// ── GEMINI ──
async function obtenerParametrosConGemini(nombreCientifico) {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODELO });

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

async function identificarConGemini(fotoBuffer, mimeType = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODELO });
  const prompt = `
    Analiza esta imagen de una planta. Devuelve únicamente un objeto JSON válido,
    sin bloques de código ni texto adicional, con exactamente esta estructura:
    {
      "candidatas": [
        {
          "nombreComun": "nombre común",
          "nombreCientifico": "nombre científico",
          "coincidencia": número entero entre 0 y 100
        }
      ]
    }
    Incluye hasta 5 especies posibles, ordenadas de mayor a menor probabilidad.
    Si la imagen no muestra una planta o no hay información suficiente, devuelve
    {"candidatas": []}. No inventes una especie con confianza alta cuando la
    imagen no permita identificarla.
  `;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: fotoBuffer.toString('base64'),
      },
    },
  ]);
  const texto = result.response.text().trim();
  const limpio = texto.replace(/```json|```/g, '').trim();
  const respuesta = JSON.parse(limpio);

  if (!Array.isArray(respuesta.candidatas)) {
    return [];
  }

  return respuesta.candidatas
    .filter((candidata) => candidata?.nombreComun && candidata?.nombreCientifico)
    .slice(0, 5)
    .map((candidata) => ({
      nombreComun: String(candidata.nombreComun),
      nombreCientifico: String(candidata.nombreCientifico),
      coincidencia: Math.max(0, Math.min(100, Math.round(Number(candidata.coincidencia) || 0))),
      fuente: 'gemini',
    }));
}

module.exports = {
  identificarConPlantNet,
  identificarConGemini,
  obtenerParametrosConGemini,
};