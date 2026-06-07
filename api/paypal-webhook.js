// api/paypal-webhook.js
// Recibe eventos de suscripción de PayPal y actualiza el rol en Firestore.
//
// Env vars requeridas (Vercel → Settings → Environment Variables):
//   PAYPAL_CLIENT_ID          — Client ID de la app PayPal (Developer Dashboard)
//   PAYPAL_CLIENT_SECRET      — Client Secret de la app PayPal
//   PAYPAL_WEBHOOK_ID         — ID del webhook registrado en Developer Dashboard
//   FIREBASE_SERVICE_ACCOUNT_JSON — Service account de Firebase Admin (JSON stringificado)
//
// URL a registrar en PayPal Developer → Webhooks:
//   https://<tu-dominio>.vercel.app/api/paypal-webhook
// Eventos a suscribir:
//   BILLING.SUBSCRIPTION.ACTIVATED
//   BILLING.SUBSCRIPTION.CANCELLED
//   BILLING.SUBSCRIPTION.SUSPENDED
//   BILLING.SUBSCRIPTION.EXPIRED

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Mapeo Plan ID PayPal → rol Firestore
// Los Plan IDs se encuentran en suscripcion.html → PAYPAL_PLAN_IDS
const PLAN_ROLES = {
  "P-25F417313S297331VNIKEUVI": "socio",
  "P-96X51494K0392870MNIKEVUI": "fundador",
};

const EVENTOS_ACTIVACION = new Set(["BILLING.SUBSCRIPTION.ACTIVATED"]);
const EVENTOS_CANCELACION = new Set([
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.EXPIRED",
]);

// ─── Firebase Admin ────────────────────────────────────────────────────────
function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
    });
  }
  return getFirestore();
}

// ─── PayPal: obtener access token ─────────────────────────────────────────
async function getPaypalAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("No se pudo obtener access token PayPal");
  return data.access_token;
}

// ─── PayPal: verificar firma del webhook ──────────────────────────────────
// Devuelve true si la firma es válida o si PAYPAL_WEBHOOK_ID no está configurado (dev).
async function verifyWebhookSignature(req, body) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("PayPal webhook: PAYPAL_WEBHOOK_ID no configurado — omitiendo verificación (solo en dev)");
    return true;
  }

  const accessToken = await getPaypalAccessToken();

  const verifyRes = await fetch(
    "https://api-m.paypal.com/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo:       req.headers["paypal-auth-algo"],
        cert_url:        req.headers["paypal-cert-url"],
        transmission_id: req.headers["paypal-transmission-id"],
        transmission_sig: req.headers["paypal-transmission-sig"],
        transmission_time: req.headers["paypal-transmission-time"],
        webhook_id:      webhookId,
        webhook_event:   body,
      }),
    }
  );

  const result = await verifyRes.json();
  return result.verification_status === "SUCCESS";
}

// ─── Handler principal ─────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // PayPal solo envía POST; responder 200 a otros métodos para evitar errores
  if (req.method !== "POST") return res.status(200).end();

  const body = req.body;
  const eventType = body?.event_type;

  // Ignorar eventos no relevantes
  if (!EVENTOS_ACTIVACION.has(eventType) && !EVENTOS_CANCELACION.has(eventType)) {
    return res.status(200).end();
  }

  try {
    // Verificar autenticidad del webhook
    const isValid = await verifyWebhookSignature(req, body);
    if (!isValid) {
      console.warn("PayPal webhook: firma inválida — rechazado");
      return res.status(401).end();
    }

    const resource = body.resource || {};
    const uid    = resource.custom_id;     // UID de Firebase, enviado al crear la suscripción
    const planId = resource.plan_id;

    // Sin UID no podemos identificar al usuario
    if (!uid || !planId) {
      console.warn("PayPal webhook: falta custom_id o plan_id", { uid, planId, eventType });
      return res.status(200).end();
    }

    const rol = PLAN_ROLES[planId];
    if (!rol) {
      console.warn("PayPal webhook: plan_id desconocido:", planId);
      return res.status(200).end();
    }

    const db     = getDb();
    const docRef = db.collection("usuarios").doc(uid);

    if (EVENTOS_ACTIVACION.has(eventType)) {
      // Suscripción activa → asignar rol
      await docRef.set(
        {
          rol,
          paypalSubscriptionId: resource.id,
          paypalActivacion: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`PayPal webhook: rol "${rol}" asignado a uid ${uid}`);

    } else if (EVENTOS_CANCELACION.has(eventType)) {
      // Suscripción cancelada/suspendida → bajar acceso
      await docRef.set(
        {
          rol: `${rol}_cancelado`,
          paypalCancelacion: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`PayPal webhook: rol "${rol}_cancelado" asignado a uid ${uid}`);
    }

    // Siempre responder 200 — si respondemos 4xx/5xx PayPal reintenta indefinidamente
    res.status(200).end();

  } catch (err) {
    console.error("Error webhook PayPal:", err);
    res.status(200).end();
  }
};
