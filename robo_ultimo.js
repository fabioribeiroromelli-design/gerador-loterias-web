/* ============================================================
   ROBÔ 1 — Salva o ÚLTIMO resultado RICO em loterias/{id}.ultimoCompleto
   - Roda das 01h às 06h (5 vezes)
   - Se o concurso já bateu com a API, PARA (economia)
   ============================================================ */

const https = require('https');
const admin = require('firebase-admin');

// ---------- FIREBASE ----------
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

// ---------- CONFIG ----------
const LOTERIAS = [
    'megasena', 'lotofacil', 'quina',
    'lotomania', 'timemania', 'duplasena',
    'diadesorte', 'supersete', 'maismilionaria',
    'loteca', 'federal'
];

// ---------- FETCH ----------
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

// ---------- LIMPA caracteres nulos que a API retorna ----------
const limpar = (s) => (s || '').replace(/\u0000/g, '').trim();

// ---------- FORMATA o ultimoCompleto ----------
function formatarUltimoCompleto(data, loteria) {
    if (!data || !data.numero) return null;

    const base = {
        numero: data.numero,
        numeroConcurso: data.numero,
        tipoJogo: data.tipoJogo || '',
        dataApuracao: limpar(data.dataApuracao) || limpar(data.data) || '',
        dataProximoConcurso: limpar(data.dataProximoConcurso) || '',
        numeroConcursoAnterior: data.numeroConcursoAnterior || '',
        numeroConcursoProximo: data.numeroConcursoProximo || '',

        // Números
        listaDezenas: (data.listaDezenas || []).map(d => String(d).padStart(2, '0')),
        dezenasSorteadasOrdemSorteio: (data.dezenasSorteadasOrdemSorteio || []).map(d => String(d).padStart(2, '0')),

        // Status
        acumulado: data.acumulado === true,
        indicadorConcursoEspecial: data.indicadorConcursoEspecial || 0,

        // 💰 Valores
        valorArrecadado: data.valorArrecadado || 0,
        valorAcumuladoProximoConcurso: data.valorAcumuladoProximoConcurso || 0,
        valorAcumuladoConcursoEspecial: data.valorAcumuladoConcursoEspecial || 0,
        valorEstimadoProximoConcurso: data.valorEstimadoProximoConcurso || 0,
        valorTotalPremioFaixaUm: data.valorTotalPremioFaixaUm || 0,
        valorSaldoReservaGarantidora: data.valorSaldoReservaGarantidora || 0,

        // 🏆 Rateio
        listaRateioPremio: (data.listaRateioPremio || []).map(r => ({
            descricaoFaixa: limpar(r.descricaoFaixa),
            faixa: r.faixa || 0,
            numeroDeGanhadores: r.numeroDeGanhadores || 0,
            valorPremio: r.valorPremio || 0
        })),

        // 📍 Ganhadores por cidade
        listaMunicipioUFGanhadores: (data.listaMunicipioUFGanhadores || []).map(g => ({
            municipio: limpar(g.municipio),
            uf: limpar(g.uf),
            ganhadores: g.ganhadores || 0
        })),

        // Local
        localSorteio: limpar(data.localSorteio),
        nomeMunicipioUFSorteio: limpar(data.nomeMunicipioUFSorteio),

        // Metadado
        atualizadoEm: new Date().toISOString()
    };

    // Específicos
    if (loteria === 'duplasena') {
        base.listaDezenasSegundoSorteio = (data.listaDezenasSegundoSorteio || [])
            .map(d => String(d).padStart(2, '0'));
    }
    if (loteria === 'maismilionaria') {
        base.trevosSorteados = (data.trevosSorteados || [])
            .map(d => String(d).padStart(2, '0'));
    }
    if (loteria === 'diadesorte') {
        base.nomeTimeCoracaoMesSorte = limpar(data.nomeTimeCoracaoMesSorte);
    }
    if (loteria === 'timemania') {
        base.nomeTimeCoracaoMesSorte = limpar(data.nomeTimeCoracaoMesSorte);
    }
    if (loteria === 'loteca') {
        base.listaResultadoEquipeEsportiva = (data.listaResultadoEquipeEsportiva || [])
            .map((j, idx) => ({
                numJogo: idx + 1,
                nomeEquipeUm: limpar(j.nomeEquipeUm),
                nomeEquipeDois: limpar(j.nomeEquipeDois),
                golEquipeUm: j.nuGolEquipeUm ?? j.golEquipeUm ?? 0,
                golEquipeDois: j.nuGolEquipeDois ?? j.golEquipeDois ?? 0,
                colunaVencedora: j.colunaVencedora ||
                    ((j.nuGolEquipeUm || 0) > (j.nuGolEquipeDois || 0) ? '1' :
                     (j.nuGolEquipeUm || 0) < (j.nuGolEquipeDois || 0) ? '2' : 'X'),
                diaSemana: limpar(j.diaSemana),
                dtJogo: limpar(j.dtJogo),
                nomeCampeonato: limpar(j.nomeCampeonato)
            }));
    }
    if (loteria === 'federal') {
        base.premios = (data.listaDezenas || []).slice(0, 5).map((b, i) => ({
            faixa: i + 1,
            bilhete: String(b).padStart(5, '0')
        }));
    }

    return base;
}

// ---------- MAIN ----------
async function atualizarUltimo() {
    const t0 = Date.now();
    console.log(`\n=== ROBÔ ULTIMO — ${new Date().toLocaleString('pt-BR')} ===\n`);

    let atualizados = 0;
    let ignorados = 0;

    for (const loteria of LOTERIAS) {
        try {
            const data = await fetchCaixa(`https://servicebus2.caixa.gov.br/portaldeloterias/api/${loteria}`);
            if (!data || !data.numero) {
                console.log(`⚠️ ${loteria}: sem dados`);
                continue;
            }

            const novo = formatarUltimoCompleto(data, loteria);
            const docRef = db.collection('loterias').doc(loteria);

            // Verifica se o ultimoCompleto já tem esse concurso
            const snap = await docRef.get();
            if (snap.exists) {
                const atual = snap.data().ultimoCompleto;
                if (atual && Number(atual.numero) === Number(novo.numero)) {
                    console.log(`⏭ ${loteria}: #${novo.numero} já está atualizado (ignorado)`);
                    ignorados++;
                    continue;
                }
            }

            // Atualiza: ultimoCompleto + espelha alguns campos na raiz (compat)
            await docRef.set({
                // ⭐ Ricos
                ultimoCompleto: novo,

                // 🔄 Espelho (compatibilidade com o site atual)
                concurso: String(novo.numero),
                numero: novo.numero,
                data: novo.dataApuracao,
                dataApuracao: novo.dataApuracao,
                dataProximoConcurso: novo.dataProximoConcurso,
                listaDezenas: novo.listaDezenas,
                dezenas: novo.listaDezenas,
                acumulado: novo.acumulado,
                acumulou: novo.acumulado,
                valorEstimadoProximoConcurso: novo.valorEstimadoProximoConcurso,
                valorArrecadado: novo.valorArrecadado,
                valorAcumuladoProximoConcurso: novo.valorAcumuladoProximoConcurso,
                numeroConcursoProximo: novo.numeroConcursoProximo,
                localSorteio: novo.localSorteio,
                nomeMunicipioUFSorteio: novo.nomeMunicipioUFSorteio,
                indicadorConcursoEspecial: novo.indicadorConcursoEspecial,
                listaRateioPremio: novo.listaRateioPremio,
                listaMunicipioUFGanhadores: novo.listaMunicipioUFGanhadores,

                // Específicos espelhados
                trevosSorteados: novo.trevosSorteados || [],
                dezenasSorteio2: novo.listaDezenasSegundoSorteio || [],
                nomeTimeCoracaoMesSorte: novo.nomeTimeCoracaoMesSorte || '',
                listaResultadoEquipeEsportiva: novo.listaResultadoEquipeEsportiva || [],

                ultimaAtualizacao: new Date().toISOString()
            }, { merge: true });

            console.log(`✅ ${loteria}: #${novo.numero} atualizado`);
            atualizados++;

            // Pequena pausa para não bloquear
            await new Promise(r => setTimeout(r, 150));
        } catch (err) {
            console.error(`❌ ${loteria}: ${err.message}`);
        }
    }

    console.log(`\n=== Resultado ===`);
    console.log(`✅ Atualizados: ${atualizados}`);
    console.log(`⏭ Ignorados (já atualizados): ${ignorados}`);
    console.log(`⏱ Tempo: ${((Date.now() - t0)/1000).toFixed(1)}s\n`);
}

atualizarUltimo().catch(err => {
    console.error("💥 Erro fatal:", err);
    process.exit(1);
});