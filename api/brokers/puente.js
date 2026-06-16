/**
 * MiFinanzas · Proxy Puente
 * Estado: pendiente de implementación
 */
const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};
module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(501).json({ error: 'Próximamente', broker: 'puente', status: 'coming_soon' });
};

