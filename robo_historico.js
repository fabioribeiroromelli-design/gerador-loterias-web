/* ============================================================
   ROBÔ 2 — Preenche o HISTÓRICO (array) em loterias/{id}.historico
   - Roda 1x/dia às 06h
   - Baixa só os concursos faltantes
   - Salva JSON local (backup) + Firestore
   - NÃO salva dados de rateio (só o essencial para estatística)
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
    // ⚠️ Federal e Loteca NÃO entram (não fazem sentido histórico)
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

// ---- Formato ENXUTO (só o que estatística precisa) ----
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

async function atualizarHistorico() {
    const t0 = Date.now();
    console.log(`\n=== ROBÔ HISTÓRICO — ${new Date().toLocaleString('pt-BR')} ===\n`);

    for (const loteria of LOTERIAS) {
        const urlApi = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${loteria}`;
        const nomeArq = `historico_${loteria}.json`;
        const caminho = path.join(__dirname, '..', nomeArq);

        try {
            // 1) Carrega JSON local
            let historico = [];
            if (fs.existsSync(caminho)) {
                try {
                    historico = JSON.parse(fs.readFileSync(caminho, 'utf-8'));
                    if (!Array.isArray(historico)) historico = [];
                } catch (e) {
                    console.warn(`⚠️ ${nomeArq} corrompido, reiniciando.`);
                    historico = [];
                }
            }

            let ultimoLocal = 0;
            if (historico.length > 0) {
                ultimoLocal = Math.max(...historico.map(i => Number(i.concurso) || 0));
            }

            // 2) Consulta a API
            const dataApi = await fetchCaixa(urlApi);
            if (!dataApi || !dataApi.numero) {
                console.log(`⚠️ ${loteria}: API sem resposta`);
                continue;
            }
            const ultimoApi = Number(dataApi.numero);

            console.log(`🔹 ${loteria}: Local=${ultimoLocal} | API=${ultimoApi}`);

            if (ultimoApi <= ultimoLocal) {
                console.log(`   ✅ Já atualizado`);
                continue;
            }

            // 3) Baixa faltantes
            const inicio = ultimoLocal > 0 ? ultimoLocal + 1 : ultimoApi;
            let novos = 0;

            for (let c = inicio; c <= ultimoApi; c++) {
                let dataConc = (c === ultimoApi) ? dataApi : await fetchCaixa(`${urlApi}/${c}`);
                if (dataConc) {
                    const fmt = formatarHistorico(dataConc, loteria);
                    if (fmt) { historico.push(fmt); novos++; }
                }
                await new Promise(r => setTimeout(r, 100));
            }

            // 4) Ordena crescente
            historico.sort((a, b) => Number(a.concurso) - Number(b.concurso));

            // 5) Salva JSON
            fs.writeFileSync(caminho, JSON.stringify(historico, null, 2), 'utf-8');
            console.log(`   📄 +${novos} salvo(s) em ${nomeArq}`);

            // 6) Salva no Firestore (ordem decrescente para o site)
            const ordenado = historico.slice().sort((a, b) =>
                Number(b.concurso) - Number(a.concurso)
            );

            await db.collection('loterias').doc(loteria).set({
                historico: ordenado,
                totalConcursos: historico.length,
                ultimaAtualizacaoHistorico: new Date().toISOString()
            }, { merge: true });

            console.log(`   💾 Firestore: ${ordenado.length} concursos\n`);
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