/**
 * MiFinanzas · Router Central de Brokers
 * 
 * Para agregar un broker nuevo:
 * 1. Crear api/brokers/nombrebroker.js
 * 2. Agregar entrada en BROKERS
 * 3. Agregar rewrite en vercel.json
 */

const BROKERS = {
  iol:        'InvertirOnLine',
  balanz:     'Balanz',
  ppi:        'Portfolio Personal Inversiones',
  bullmarket: 'Bull Market Broker',
  cocos:      'Cocos Capital',
  rava:       'Rava Bursátil',
  lemon:      'Lemon Cash',
  bitso:      'Bitso',
  aurum:      'Aurum Valores',
  puente:     'Puente',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    status: 'ok',
    brokers: Object.entries(BROKERS).map(([id, name]) => ({ id, name })),
  });
};

