// api/mercadopago-webhook.js
// Recibe eventos de suscripción de MercadoPago y actualiza el rol en Firestore.
//
// Env vars requeridas (Vercel → Settings → Environment Variables):
//   MP_ACCESS_TOKEN               — Access Token de la app MercadoPago
//   MP_WEBHOOK_SECRET             — "Clave secreta" del webhook (MP → Tus integraciones → Webhooks)
//   FIREBASE_SERVICE_ACCOUNT_JSON — Service account de Firebase Admin (JSON stringificado)

const crypto = require("crypto");
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const PLAN_ROLES = {
  "de1ab5218f6346b492ce47cc6be53385": "socio",
  "a83d97070a10460391a08efd923cd0bd": "fundador",
};

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
    });
  }
  return getFirestore();
}

// ─── MercadoPago: verificar firma del webhook ─────────────────────────────
// Devuelve true si la firma es válida o si MP_WEBHOOK_SECRET no está configurado (dev).
// MP firma con HMAC-SHA256 sobre el template: id:<dataId>;request-id:<xRequestId>;ts:<ts>;
function verifyWebhookSignature(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("MP webhook: MP_WEBHOOK_SECRET no configurado — omitiendo verificación (solo en dev)");
    return true;
  }

  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];
  if (!xSignature || !xRequestId) return false;

  // x-signature viene como "ts=<timestamp>,v1=<hash>"
  let ts, v1;
  for (const part of xSignature.split(",")) {
    const [k, val] = part.split("=").map((s) => s && s.trim());
    if (k === "ts") ts = val;
    else if (k === "v1") v1 = val;
  }
  if (!ts || !v1) return false;

  // El id es el data.id del query string (MP lo envía en minúsculas para el manifest)
  const dataId =
    (req.query && req.query["data.id"]) ||
    (req.body && req.body.data && req.body.data.id) ||
    "";
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId};ts:${ts};`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  // Comparación en tiempo constante
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).end();

  // Verificar autenticidad del webhook antes de procesar
  if (!verifyWebhookSignature(req)) {
    console.warn("MP webhook: firma inválida — rechazado");
    return res.status(401).end();
  }

  const { type, data } = req.body;
  if (type !== "subscription_preapproval") return res.status(200).end();

  try {
    const mpRes = await fetch(
      `https://api.mercadopago.com/preapproval/${data.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );
    const subscription = await mpRes.json();

    const uid = subscription.external_reference;
    const planId = subscription.preapproval_plan_id;
    const status = subscription.status;

    if (!uid || !planId) return res.status(200).end();
    const rol = PLAN_ROLES[planId];
    if (!rol) return res.status(200).end();

    const db = getDb();
    const docRef = db.collection("usuarios").doc(uid);

    if (status === "authorized") {
      await docRef.set(
        { rol, mpSubscriptionId: data.id, mpActivacion: new Date().toISOString() },
        { merge: true }
      );
    } else if (status === "cancelled" || status === "paused") {
      await docRef.set(
        { rol: `${rol}_cancelado`, mpCancelacion: new Date().toISOString() },
        { merge: true }
      );
    }

    res.status(200).end();
  } catch (err) {
    console.error("Error webhook MP:", err);
    res.status(200).end();
  }
};
