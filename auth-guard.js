import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBc1Ab14Fo6Ua-u3i1SDudf4EfVijVmONY",
    authDomain: "gerador-loterias-web.firebaseapp.com",
    projectId: "gerador-loterias-web",
    storageBucket: "gerador-loterias-web.firebasestorage.app",
    messagingSenderId: "539211828205",
    appId: "1:539211828205:web:138dc9c6f09169bde2b5e4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function verificarAcessoAssinante() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Se não estiver logado, redireciona para a página de login/planos
            bloquearAcesso("Você precisa estar logado para acessar esta função.");
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().assinante === true) {
                // Usuário é assinante! Libera o uso da página.
                console.log("Acesso liberado para assinante:", user.email);
            } else {
                // Usuário logado, mas NÃO é assinante
                bloquearAcesso("Esta funcionalidade é exclusiva para assinantes VIP.");
            }
        } catch (error) {
            console.error("Erro ao verificar assinatura:", error);
            bloquearAcesso("Erro ao validar permissões.");
        }
    });
}

function bloquearAcesso(mensagem) {
    alert(mensagem);
    window.location.href = "planos.html"; // Redireciona para a página de vendas/login
}