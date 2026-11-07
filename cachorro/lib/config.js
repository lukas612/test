/* Carga .env (si existe) y expone la configuración. Requerir antes que cualquier otro módulo de lib/. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const f = path.join(__dirname, '..', '.env');
if (fs.existsSync(f)) {
  for (const linea of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const CFG = {
  puerto: Number(process.env.PORT || 3000),
  baseUrl: (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  marca: process.env.MARCA || 'Plan Cachorro',
  emailContacto: process.env.EMAIL_CONTACTO || 'hola@example.com',
  titular: process.env.TITULAR || '[RAZÓN SOCIAL, NIF y dirección]',
  stripeKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  pixelId: process.env.META_PIXEL_ID || '',
  // Céntimos. Un valor = precio fijo (fase 1a). Varios = test de precio (fase 1b), reparto estable por visitante.
  precios: (process.env.PRECIOS || '1999').split(',').map((x) => Number(x.trim())).filter(Boolean),
  precioUpsell: Number(process.env.PRECIO_UPSELL || 999),
  adminToken: process.env.ADMIN_TOKEN || '',
  // Firma los enlaces de baja de los emails. Obligatorio en producción.
  secreto: process.env.APP_SECRET || 'solo-para-desarrollo'
};

function precioPara(sid) {
  const h = crypto.createHash('sha256').update(String(sid || '')).digest();
  return CFG.precios[h[0] % CFG.precios.length];
}
function firmaBaja(email) {
  return crypto.createHmac('sha256', CFG.secreto).update('baja:' + String(email).toLowerCase()).digest('hex').slice(0, 32);
}
function urlBaja(email) {
  return `${CFG.baseUrl}/baja?e=${encodeURIComponent(email)}&t=${firmaBaja(email)}`;
}

module.exports = { CFG, precioPara, firmaBaja, urlBaja };
