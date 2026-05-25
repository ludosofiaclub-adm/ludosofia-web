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

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).end();

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
