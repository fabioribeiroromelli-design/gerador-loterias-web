/* ============================================================
   ROBÔ 2 — Histórico COMPLETO em historico_loterias/{id}
   VERSÃO 4 (FINAL) — sempre sincroniza JSON ↔ Firestore
   ============================================================ */

const fs = require('fs');
const path = require('path');
const https = require('https');
const admin = require('firebase-admin');

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({ credential: admin.credential.cert(sa) });
        console.log("🔥 Firebase conectado");
    } catch (e) {
        console.error("⚠️ Firebase:", e.message);
        process.exit(1);
    }
} else {
    console.error("⚠️ FIREBASE_SERVICE_ACCOUNT não definida");
    process.exit(1);
}
const db = admin.firestore();

const LOTERIAS = [
    'megasena', 'lotofacil', 'quina',
    'lotomania', 'timemania', 'duplasena',
    'diadesorte', 'supersete', 'maismilionaria'
];

function fetchCaixa(url) {
    return new Promise((resolve, reject) => {
        const opts = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Referer': 'https://loterias.caixa.gov.br/'
            },
            timeout: 15000
        };
        https.get(url, opts, (res) => {
            if (res.statusCode === 404) return resolve(null);
            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (e) { reject(new Error('JSON inválido')); }
            });
        }).on('error', reject);
    });
}

const limpar = (s) => (s || '').replace(/\u0000/g, '').trim();

function formatarHistorico(data, loteria) {
    if (!data || !data.numero) return null;

    const item = {
        concurso: String(data.numero),
        data: limpar(data.dataApuracao) || limpar(data.data) || '',
        dezenas: (data.listaDezenas || []).map(d => String(d).padStart(2, '0')),
        acumulado: data.acumulado === true
    };

    if (loteria === 'duplasena') {
        item.dezenasSorteio2 = (data.listaDezenasSegundoSorteio || [])
            .map(d => String(d).padStart(2, '0'));
    }
    if (loteria === 'maismilionaria') {
        item.trevos = (data.trevosSorteados || [])
            .map(d => String(d).padStart(2, '0'));
    }
    if (loteria === 'diadesorte') {
        item.mesSorte = limpar(data.nomeTimeCoracaoMesSorte);
    }
    if (loteria === 'timemania') {
        item.timeCoracao = limpar(data.nomeTimeCoracaoMesSorte);
    }

    return item;
}

async function baixarIntervalo(urlApi, inicio, fim, loteria) {
    const arr = [];
    for (let c = inicio; c <= fim; c++) {
        const data = await fetchCaixa(`${urlApi}/${c}`);
        if (data) {
            const fmt = formatarHistorico(data, loteria);
            if (fmt) arr.push(fmt);
        }
        await new Promise(r => setTimeout(r, 80));
    }
    return arr;
}

async function atualizarHistorico() {
    const t0 = Date.now();
    console.log(`\n=== ROBÔ HISTÓRICO v4 — ${new Date().toLocaleString('pt-BR')} ===\n`);

    for (const loteria of LOTERIAS) {
        const urlApi = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${loteria}`;
        const nomeArq = `historico_${loteria}.json`;
        const caminho = path.join(__dirname, nomeArq);

        try {
            // ============================================================
            // 1) Lê JSON local
            // ============================================================
            let historicoLocal = [];
            if (fs.existsSync(caminho)) {
                try {
                    historicoLocal = JSON.parse(fs.readFileSync(caminho, 'utf-8'));
                    if (!Array.isArray(historicoLocal)) historicoLocal = [];
                } catch (e) {
                    console.warn(`⚠️ ${nomeArq} corrompido, ignorando.`);
                    historicoLocal = [];
                }
            }
            console.log(`   📄 JSON local: ${historicoLocal.length}`);

            // ============================================================
            // 2) Lê Firestore
            // ============================================================
            const docRef = db.collection('historico_loterias').doc(loteria);
            const snap = await docRef.get();
            let historicoFirestore = [];
            if (snap.exists && Array.isArray(snap.data().concursos)) {
                historicoFirestore = snap.data().concursos;
            }
            console.log(`   🔥 Firestore: ${historicoFirestore.length}`);

            // ============================================================
            // 3) Escolhe o MAIOR entre JSON e Firestore
            // ============================================================
            const historicoBase = historicoLocal.length >= historicoFirestore.length
                ? historicoLocal
                : historicoFirestore;
            console.log(`   📦 Base escolhida: ${historicoBase.length} concursos`);

            let ultimoBase = 0;
            if (historicoBase.length > 0) {
                ultimoBase = Math.max(...historicoBase.map(i => Number(i.concurso) || 0));
            }

            // ============================================================
            // 4) Consulta API
            // ============================================================
            const dataApi = await fetchCaixa(urlApi);
            if (!dataApi || !dataApi.numero) {
                console.log(`   ⚠️ API sem resposta\n`);
                continue;
            }
            const ultimoApi = Number(dataApi.numero);

            console.log(`🔹 ${loteria}: Base=${ultimoBase} | API=${ultimoApi}`);

            // ============================================================
            // 5) Decide o que baixar
            // ============================================================
            let novos = [];
            if (historicoBase.length === 0) {
                console.log(`   📥 Vazio. Baixando de #1 até #${ultimoApi}`);
                const TAM_BLOCO = 200;
                for (let c = 1; c <= ultimoApi; c += TAM_BLOCO) {
                    const fim = Math.min(c + TAM_BLOCO - 1, ultimoApi);
                    console.log(`      Bloco #${c} até #${fim}...`);
                    const bloco = await baixarIntervalo(urlApi, c, fim, loteria);
                    novos.push(...bloco);
                }
            } else if (ultimoApi > ultimoBase) {
                console.log(`   📥 Complementando #${ultimoBase + 1} até #${ultimoApi}`);
                const bloco = await baixarIntervalo(urlApi, ultimoBase + 1, ultimoApi, loteria);
                novos.push(...bloco);
            } else {
                console.log(`   ✅ Já tem tudo da API (base=${ultimoBase}, api=${ultimoApi})`);
            }

            // ============================================================
            // 6) Junta e ordena
            // ============================================================
            const todos = [...historicoBase, ...novos];
            const mapa = new Map();
            todos.forEach(i => {
                if (i && i.concurso) mapa.set(String(i.concurso), i);
            });
            const historicoFinal = Array.from(mapa.values())
                .sort((a, b) => Number(a.concurso) - Number(b.concurso));

            console.log(`   📊 Total final: ${historicoFinal.length}`);

            // ============================================================
            // 7) SEMPRE salva JSON local
            // ============================================================
            fs.writeFileSync(caminho, JSON.stringify(historicoFinal, null, 2), 'utf-8');
            console.log(`   💾 JSON: ${historicoFinal.length}`);

            // ============================================================
            // 8) SEMPRE salva Firestore (mesmo se "já completo")
            // ============================================================
            const ordenadoDesc = historicoFinal.slice().sort((a, b) =>
                Number(b.concurso) - Number(a.concurso)
            );

            const jsonStr = JSON.stringify(ordenadoDesc);
            const tamanhoMB = jsonStr.length / (1024 * 1024);

            if (tamanhoMB > 0.9) {
                console.log(`   ⚠️ ${tamanhoMB.toFixed(2)} MB — salvando só os últimos 5000`);
                const truncado = ordenadoDesc.slice(0, 5000);
                await docRef.set({
                    concursos: truncado,
                    total: historicoFinal.length,
                    totalSalvo: truncado.length,
                    truncated: true,
                    ultimoConcurso: truncado[0] ? truncado[0].concurso : null,
                    primeiroConcurso: truncado[truncado.length - 1] ? truncado[truncado.length - 1].concurso : null,
                    atualizadoEm: new Date().toISOString()
                }, { merge: true });
                console.log(`   💾 Firestore: 5000 (truncado, real ${historicoFinal.length})\n`);
            } else {
                await docRef.set({
                    concursos: ordenadoDesc,
                    total: historicoFinal.length,
                    ultimoConcurso: ordenadoDesc[0] ? ordenadoDesc[0].concurso : null,
                    primeiroConcurso: ordenadoDesc[ordenadoDesc.length - 1] ? ordenadoDesc[ordenadoDesc.length - 1].concurso : null,
                    atualizadoEm: new Date().toISOString()
                }, { merge: true });
                console.log(`   💾 Firestore: ${ordenadoDesc.length} (${tamanhoMB.toFixed(2)} MB)\n`);
            }
        } catch (err) {
            console.error(`❌ ${loteria}: ${err.message}\n`);
        }
    }

    console.log(`=== Concluído em ${((Date.now() - t0)/1000).toFixed(1)}s ===\n`);
}

atualizarHistorico().catch(err => {
    console.error("💥 Erro fatal:", err);
    process.exit(1);
});
