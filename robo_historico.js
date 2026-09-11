/* ============================================================
   ROBÔ 2 — Histórico COMPLETO em historico_loterias/{id}
   - Sempre garante o histórico do #1 até o último
   - Se já existe, só complementa os que faltam
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

// Baixa um intervalo [inicio, fim] e retorna array
async function baixarIntervalo(urlApi, inicio, fim, loteria) {
    const arr = [];
    for (let c = inicio; c <= fim; c++) {
        const data = await fetchCaixa(`${urlApi}/${c}`);
        if (data) {
            const fmt = formatarHistorico(data, loteria);
            if (fmt) arr.push(fmt);
        }
        // Pausa curta a cada request
        await new Promise(r => setTimeout(r, 80));
    }
    return arr;
}

async function atualizarHistorico() {
    const t0 = Date.now();
    console.log(`\n=== ROBÔ HISTÓRICO — ${new Date().toLocaleString('pt-BR')} ===\n`);

    for (const loteria of LOTERIAS) {
        const urlApi = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${loteria}`;
        const nomeArq = `historico_${loteria}.json`;
        const caminho = path.join(__dirname, nomeArq);

        try {
            // 1) Carrega JSON local (se existir)
            let historicoLocal = [];
            if (fs.existsSync(caminho)) {
                try {
                    historicoLocal = JSON.parse(fs.readFileSync(caminho, 'utf-8'));
                    if (!Array.isArray(historicoLocal)) historicoLocal = [];
                } catch (e) {
                    console.warn(`⚠️ ${nomeArq} corrompido, reiniciando.`);
                    historicoLocal = [];
                }
            }

            // 2) Consulta o Firestore para pegar o que já existe lá
            const docRef = db.collection('historico_loterias').doc(loteria);
            const snap = await docRef.get();
            let historicoFirestore = [];
            if (snap.exists && Array.isArray(snap.data().concursos)) {
                historicoFirestore = snap.data().concursos;
            }

            // 3) Escolhe o maior: local ou firestore
            let historicoBase = historicoLocal.length >= historicoFirestore.length
                ? historicoLocal
                : historicoFirestore;

            let ultimoBase = 0;
            if (historicoBase.length > 0) {
                ultimoBase = Math.max(...historicoBase.map(i => Number(i.concurso) || 0));
            }

            // 4) Consulta API para o último concurso
            const dataApi = await fetchCaixa(urlApi);
            if (!dataApi || !dataApi.numero) {
                console.log(`⚠️ ${loteria}: API sem resposta\n`);
                continue;
            }
            const ultimoApi = Number(dataApi.numero);

            console.log(`🔹 ${loteria}: Base=${ultimoBase} | API=${ultimoApi}`);

            // 5) Se o base está vazio OU muito atrás, baixa tudo do zero
            //    Caso contrário, complementa do (ultimoBase + 1) até ultimoApi
            let novos = [];
            if (historicoBase.length === 0) {
                console.log(`   📥 Histórico VAZIO. Baixando TUDO de #1 até #${ultimoApi}`);
                // Baixa do 1 até o último, em blocos pra não travar
                const TAM_BLOCO = 200;
                for (let c = 1; c <= ultimoApi; c += TAM_BLOCO) {
                    const fim = Math.min(c + TAM_BLOCO - 1, ultimoApi);
                    console.log(`      Bloco #${c} até #${fim}...`);
                    const bloco = await baixarIntervalo(urlApi, c, fim, loteria);
                    novos.push(...bloco);
                }
            } else if (ultimoApi > ultimoBase) {
                console.log(`   📥 Complementando do #${ultimoBase + 1} até #${ultimoApi}`);
                const bloco = await baixarIntervalo(urlApi, ultimoBase + 1, ultimoApi, loteria);
                novos.push(...bloco);
            } else {
                console.log(`   ✅ Já está completo\n`);
                continue;
            }

            // 6) Junta e ordena
            const todos = [...historicoBase, ...novos];
            // Remove duplicatas
            const mapa = new Map();
            todos.forEach(i => mapa.set(String(i.concurso), i));
            const historicoFinal = Array.from(mapa.values())
                .sort((a, b) => Number(a.concurso) - Number(b.concurso));

            // 7) Salva JSON local
            fs.writeFileSync(caminho, JSON.stringify(historicoFinal, null, 2), 'utf-8');
            console.log(`   📄 Total salvo em ${nomeArq}: ${historicoFinal.length} concursos`);

            // 8) Salva no Firestore (ordem decrescente, em chunks se necessário)
            const ordenadoDesc = historicoFinal.slice().sort((a, b) =>
                Number(b.concurso) - Number(a.concurso)
            );

            // Checa se cabe em 1MB
            const jsonStr = JSON.stringify(ordenadoDesc);
            const tamanhoMB = jsonStr.length / (1024 * 1024);

            if (tamanhoMB > 0.9) {
                console.log(`   ⚠️ ${loteria} tem ${tamanhoMB.toFixed(2)} MB — precisa dividir em chunks!`);
                console.log(`   💡 Pulando Firestore por enquanto. Rode depois com suporte a chunks.`);
            } else {
                await docRef.set({
                    concursos: ordenadoDesc,
                    total: historicoFinal.length,
                    ultimoConcurso: ordenadoDesc[0] ? ordenadoDesc[0].concurso : null,
                    primeiroConcurso: ordenadoDesc[ordenadoDesc.length - 1] ? ordenadoDesc[ordenadoDesc.length - 1].concurso : null,
                    atualizadoEm: new Date().toISOString()
                }, { merge: true });
                console.log(`   💾 Firestore (historico_loterias/${loteria}): ${ordenadoDesc.length} concursos (${tamanhoMB.toFixed(2)} MB)\n`);
            }
        } catch (err) {
            console.error(`❌ ${loteria}: ${err.message}\n`);
        }
    }

    console.log(`=== Histórico concluído em ${((Date.now() - t0)/1000).toFixed(1)}s ===\n`);
}

atualizarHistorico().catch(err => {
    console.error("💥 Erro fatal:", err);
    process.exit(1);
});