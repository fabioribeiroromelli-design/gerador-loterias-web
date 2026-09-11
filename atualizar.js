/* ============================================================
   ROBÔ — Sincroniza últimos concursos das Loterias com Firestore
   Roda 1x/dia no GitHub Actions
   Salva TODOS os campos (rateio, arrecadação, ganhadores, etc.)
   ============================================================ */

const fs = require('fs');
const path = require('path');
const https = require('https');
const admin = require('firebase-admin');

// Inicializa Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        console.log("🔥 Firebase Admin conectado!");
    } catch (e) {
        console.error("⚠️ Erro Firebase Admin:", e.message);
    }
} else {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT não definida.");
}
const db = admin.apps.length ? admin.firestore() : null;

// Lista das loterias
const LOTERIAS = [
    'megasena', 'lotofacil', 'quina',
    'lotomania', 'timemania', 'duplasena',
    'diadesorte', 'supersete', 'maismilionaria',
    'loteca', 'federal'
];

// ============================================================
// FETCH da API Caixa
// ============================================================
function fetchCaixa(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Referer': 'https://loterias.caixa.gov.br/'
            },
            timeout: 15000
        };
        https.get(url, options, (res) => {
            if (res.statusCode === 404) return resolve(null);
            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (e) { reject(new Error('JSON inválido')); }
            });
        }).on('error', reject);
    });
}

// ============================================================
// FORMATA — agora salva TODOS os campos importantes
// ============================================================
function formatarConcurso(data, loteria) {
    if (!data || !data.numero) return null;

    let dezenas = [];
    let jogosLoteca = [];
    let premiosFederal = [];

    // ---- LOTECA ----
    if (loteria === 'loteca') {
        const arrayLoteca = data.listaResultadoEquipeEsportiva || data.listaResultadoLoteca || [];
        jogosLoteca = arrayLoteca.map((item, idx) => {
            const g1 = item.nuGolEquipeUm ?? item.golEquipeUm ?? 0;
            const g2 = item.nuGolEquipeDois ?? item.golEquipeDois ?? 0;
            let col = item.colunaVencedora;
            if (!col) col = (g1 > g2 ? '1' : g1 < g2 ? '2' : 'X');
            return {
                numJogo: idx + 1,
                nomeEquipeUm: item.nomeEquipeUm || item.equipeUm || '',
                nomeEquipeDois: item.nomeEquipeDois || item.equipeDois || '',
                golEquipeUm: g1,
                golEquipeDois: g2,
                colunaVencedora: col,
                diaSemana: item.diaSemana || '',
                dtJogo: item.dtJogo || '',
                nomeCampeonato: item.nomeCampeonato || ''
            };
        });
        dezenas = jogosLoteca.map(j => j.colunaVencedora);
    }
    // ---- FEDERAL ----
    else if (loteria === 'federal') {
        const lista = data.listaDezenas || data.dezenasSorteadasOrdemSorteio || [];
        premiosFederal = lista.map((bilhete, i) => ({
            faixa: i + 1,
            bilhete: String(bilhete).padStart(5, '0')
        }));
        dezenas = lista.map(d => String(d).padStart(5, '0'));
    }
    // ---- DEMAIS ----
    else {
        const arr = data.listaDezenas || [];
        dezenas = arr.map(d => String(d).padStart(2, '0'));
    }

    // ---- MONTAGEM BASE ----
    const resultado = {
        // Concurso
        concurso: data.numero,
        numero: data.numero,
        data: data.dataApuracao || data.data || '',
        dataApuracao: data.dataApuracao || data.data || '',
        dataProximoConcurso: data.dataProximoConcurso || '',

        // Números
        dezenas: dezenas,
        listaDezenas: dezenas,

        // Status
        acumulado: data.acumulado === true,
        acumulou: data.acumulado === true,
        indicadorConcursoEspecial: data.indicadorConcursoEspecial || 0,

        // Valores
        valorArrecadado: data.valorArrecadado || 0,
        valorAcumuladoProximoConcurso: data.valorAcumuladoProximoConcurso || 0,
        valorAcumuladoConcursoEspecial: data.valorAcumuladoConcursoEspecial || 0,
        valorEstimadoProximoConcurso: data.valorEstimadoProximoConcurso || 0,
        valorTotalPremioFaixaUm: data.valorTotalPremioFaixaUm || 0,
        valorSaldoReservaGarantidora: data.valorSaldoReservaGarantidora || 0,

        // Rateio completo
        listaRateioPremio: (data.listaRateioPremio || []).map(r => ({
            descricaoFaixa: r.descricaoFaixa || `Faixa ${r.faixa}`,
            faixa: r.faixa || 0,
            numeroDeGanhadores: r.numeroDeGanhadores || 0,
            valorPremio: r.valorPremio || 0
        })),

        // Ganhadores por cidade/UF
        listaMunicipioUFGanhadores: (data.listaMunicipioUFGanhadores || []).map(g => ({
            municipio: g.municipio || '',
            uf: g.uf || '',
            ganhadores: g.ganhadores || 0
        })),

        // Local do sorteio
        localSorteio: (data.localSorteio || '').replace(/\u0000/g, '').trim(),
        nomeMunicipioUFSorteio: (data.nomeMunicipioUFSorteio || '').replace(/\u0000/g, '').trim(),

        // Números do próximo/anterior
        numeroConcursoAnterior: data.numeroConcursoAnterior || '',
        numeroConcursoProximo: data.numeroConcursoProximo || '',

        // Tipo de jogo
        tipoJogo: data.tipoJogo || ''
    };

    // ---- CAMPOS ESPECÍFICOS ----
    if (loteria === 'loteca') {
        resultado.jogos = jogosLoteca;
        resultado.listaResultadoEquipeEsportiva = jogosLoteca;
    }
    if (loteria === 'federal') {
        resultado.premios = premiosFederal;
    }
    if (loteria === 'duplasena') {
        const d2 = data.listaDezenasSegundoSorteio || [];
        resultado.dezenasSorteio2 = d2.map(d => String(d).padStart(2, '0'));
        resultado.segundoSorteio = resultado.dezenasSorteio2;
    }
    if (loteria === 'maismilionaria') {
        const trevos = data.trevosSorteados || [];
        resultado.trevos = trevos.map(d => String(d).padStart(2, '0'));
        resultado.trevosSorteados = resultado.trevos;
    }
    if (loteria === 'diadesorte') {
        const mes = (data.nomeTimeCoracaoMesSorte || data.nomeMesSorte || data.mesSorte || '')
            .replace(/\u0000/g, '').trim();
        resultado.mesSorte = mes;
        resultado.nomeTimeCoracaoMesSorte = mes;
    }
    if (loteria === 'timemania') {
        const time = (data.nomeTimeCoracaoMesSorte || data.nomeTimeCoracao || data.timeCoracao || '')
            .replace(/\u0000/g, '').trim();
        resultado.timeCoracao = time;
        resultado.nomeTimeCoracaoMesSorte = time;
    }

    return resultado;
}

// ============================================================
// MAIN
// ============================================================
async function atualizarLoterias() {
    const inicio = new Date();
    console.log(`\n==================================================`);
    console.log(`[${inicio.toLocaleString('pt-BR')}] Sincronização iniciada`);
    console.log(`==================================================\n`);

    for (const loteria of LOTERIAS) {
        const urlApi = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${loteria}`;

        try {
            const dataApi = await fetchCaixa(urlApi);
            if (!dataApi || !dataApi.numero) {
                console.error(`❌ [${loteria}] API não retornou dados.`);
                continue;
            }

            const concursoFormatado = formatarConcurso(dataApi, loteria);
            if (!concursoFormatado) {
                console.error(`❌ [${loteria}] Formatação falhou.`);
                continue;
            }

            console.log(`🔹 ${loteria.toUpperCase()} — Concurso ${concursoFormatado.concurso}`);

            // ----- LOTECA e FEDERAL: salva só o último -----
            if (loteria === 'loteca' || loteria === 'federal') {
                if (db) {
                    await db.collection('loterias').doc(loteria).set({
                        // Todos os campos na raiz
                        ...concursoFormatado,
                        ultimoConcurso: concursoFormatado,
                        ultimaAtualizacao: new Date().toISOString()
                    }, { merge: true });
                    console.log(`   💾 Salvo no Firestore.\n`);
                }
                continue;
            }

            // ----- DEMAIS: histórico em JSON + Firestore -----
            const nomeArquivo = `historico_${loteria}.json`;
            const caminho = path.join(__dirname, '..', nomeArquivo);
            let historico = [];

            if (fs.existsSync(caminho)) {
                try {
                    historico = JSON.parse(fs.readFileSync(caminho, 'utf-8'));
                    if (!Array.isArray(historico)) historico = [];
                } catch (e) {
                    console.warn(`   ⚠️ ${nomeArquivo} corrompido, iniciando novo.`);
                    historico = [];
                }
            }

            let ultimoLocal = 0;
            if (historico.length > 0) {
                ultimoLocal = Math.max(...historico.map(i => Number(i.concurso) || 0));
            }
            const ultimoApi = Number(concursoFormatado.concurso);

            console.log(`   Local: ${ultimoLocal} | API: ${ultimoApi}`);

            if (ultimoApi <= ultimoLocal) {
                console.log(`   ✅ Já atualizado.\n`);
                continue;
            }

            // Baixa concursos faltantes
            const inicioLoop = ultimoLocal > 0 ? ultimoLocal + 1 : ultimoApi;
            let novos = 0;

            for (let c = inicioLoop; c <= ultimoApi; c++) {
                let dataConc = null;
                if (c === ultimoApi) {
                    dataConc = dataApi;
                } else {
                    dataConc = await fetchCaixa(`${urlApi}/${c}`);
                }
                if (dataConc) {
                    const fmt = formatarConcurso(dataConc, loteria);
                    if (fmt) { historico.push(fmt); novos++; }
                }
                await new Promise(r => setTimeout(r, 100));
            }

            // Ordena CRESCENTE (menor → maior) para o JSON ficar cronológico
            historico.sort((a, b) => Number(a.concurso) - Number(b.concurso));

            fs.writeFileSync(caminho, JSON.stringify(historico, null, 2), 'utf-8');
            console.log(`   📄 ${novos} novo(s) salvo(s) em ${nomeArquivo}.`);

            // Salva no Firestore
            if (db) {
                // Pega o ÚLTIMO (maior concurso)
                let ultimo = historico[0];
                for (const i of historico) {
                    if (Number(i.concurso) > Number(ultimo.concurso)) ultimo = i;
                }

                // Ordena o histórico DECRESCENTE para o site
                const historicoDesc = historico.slice().sort((a, b) =>
                    Number(b.concurso) - Number(a.concurso)
                );

                await db.collection('loterias').doc(loteria).set({
                    // Raiz: campos do ÚLTIMO concurso (para o index ler rápido)
                    ...ultimo,
                    ultimoConcurso: ultimo,
                    historico: historicoDesc,
                    ultimaAtualizacao: new Date().toISOString()
                }, { merge: true });

                console.log(`   💾 Firestore atualizado.\n`);
            }
        } catch (err) {
            console.error(`❌ [${loteria}] ${err.message}\n`);
        }
    }

    console.log(`==================================================`);
    console.log(`✅ Sincronização concluída em ${((new Date() - inicio)/1000).toFixed(1)}s`);
    console.log(`==================================================\n`);
}

atualizarLoterias().catch(err => {
    console.error("💥 Erro fatal:", err);
    process.exit(1);
});
