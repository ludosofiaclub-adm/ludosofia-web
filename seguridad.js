import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBbvpUaTAyeRGT0yxY-YswQab5dRalx5uc",
    authDomain: "ludosofia-1cdc7.firebaseapp.com",
    projectId: "ludosofia-1cdc7"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.documentElement.style.display = 'none';

onAuthStateChanged(auth, async (user) => {
    const config = window.CONFIG_ACCESO;

    if (!user) {
        if (config && config.PUBLICO === false) {
            localStorage.setItem('destino_post_login', window.location.pathname.split('/').pop());
            window.location.replace("login.html");
        } else {
            document.documentElement.style.display = '';
        }
        return;
    }

    try {
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));

        if (docSnap.exists()) {
            const rol = (docSnap.data().rol || '').toUpperCase();

            // Acceso solo con rol pago ACTIVO. Excluye *_pendiente y *_cancelado:
            // antes 'SOCIO_CANCELADO'.includes('SOCIO') daba acceso a cancelados.
            const esSocio = rol === 'SOCIO' || rol === 'FUNDADOR';
            const esFundador = rol === 'FUNDADOR';

            let tieneAcceso = false;

            if (!config || config.PUBLICO) {
                tieneAcceso = true;
            } else if (config.SOCIO && esSocio) {
                tieneAcceso = true;
            } else if (config.SOCIO_FUNDADOR && esFundador) {
                tieneAcceso = true;
            }

            if (tieneAcceso) {
                document.documentElement.style.display = '';
            } else {
                window.location.replace("suscripcion.html");
            }
        } else {
            window.location.replace("suscripcion.html");
        }
    } catch (error) {
        console.error("Error al verificar membresía:", error);
        if (!config || config.PUBLICO !== false) {
            document.documentElement.style.display = '';
        } else {
            window.location.replace("suscripcion.html");
        }
    }
});
