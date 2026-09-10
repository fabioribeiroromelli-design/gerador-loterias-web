const fs = require('fs');
const path = require('path');
const https = require('https');
const admin = require('firebase-admin');

// 1. INICIALIZAÇÃO DO FIREBASE ADMIN
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin conectado com sucesso!");
    } catch (e) {
        console.error("⚠️ Erro ao inicializar Firebase Admin:", e.message);
    }
} else {
    console.warn("⚠️ Variável FIREBASE_SERVICE_ACCOUNT não encontrada. O script atualizará apenas os arquivos JSON.");
}

const db = admin.apps.length ? admin.firestore() : null;

// Lista de loterias suportadas
const loterias = [
    'megasena', 'lotofacil', 'quina', 
    'lotomania', 'timemania', 'duplasena', 
    'diadesorte', 'supersete', 'maismilionaria', 'loteca'
];

// Requisita dados da API da Caixa simulando um navegador real
function fetchCaixa(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Referer': 'https://loterias.caixa.gov.br/'
            },
            timeout: 10000
        };

        https.get(url, options, (res) => {
            if (res.statusCode === 404) {
                return resolve(null);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP Status ${res.statusCode}`));
            }

            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error('Erro ao fazer parse do JSON'));
                }
            });
        }).on('error', (err) => reject(err));
    });
}

// Converte os dados brutos da Caixa para a estrutura padrão do seu app/site
function formatarConcurso(data, loteria) {
    if (!data || !data.numero) return null;

    let dezenas = [];
    if (loteria === 'loteca') {
        const arrayLoteca = data.listaResultadoLoteca || data.listaResultadoEquipeEsportiva || [];
        dezenas = arrayLoteca.map(item => {
            const res = item.resultado;
            if (res === 'COLUNA_UM') return 1;
            if (res === 'EMPATE') return 2;
            if (res === 'COLUNA_DOIS') return 3;
            return item.golEquipeUm || 0;
        });
    } else {
        const arrayDezenas = data.listaDezenas || [];
        dezenas = arrayDezenas.map(d => parseInt(d, 10));
    }

    const resultado = {
        concurso: data.numero,
        dataApuracao: data.dataApuracao || "",
        dezenas: dezenas,
        acumulou: data.acumulado || false,
        valorEstimadoProximoConcurso: data.valorEstimadoProximoConcurso || 0,
        dataProximoConcurso: data.dataProximoConcurso || ""
    };

    if (loteria === 'duplasena' && data.listaDezenasSegundoSorteio) {
        resultado.segundoSorteio = data.listaDezenasSegundoSorteio.map(d => parseInt(d, 10));
    }
    if (loteria === 'maismilionaria' && data.trevosSorteados) {
        resultado.trevos = data.trevosSorteados.map(d => parseInt(d, 10));
    }
    if (loteria === 'diadesorte') {
        resultado.mesSorte = data.nomeMesSorte || data.nomeTimeCoracaoMesSorte || "";
    }
    if (loteria === 'timemania') {
        resultado.timeCoracao = data.nomeTimeCoracao || data.nomeTimeCoracaoMesSorte || "";
    }

    return resultado;
}

// Função principal de atualização
async function atualizarLoterias() {
    console.log(`\n==================================================`);
    console.log(`[${new Date().toLocaleString('pt-BR')}] Iniciando sincronização do histórico...`);
    console.log(`==================================================\n`);

    for (const loteria of loterias) {
        const nomeArquivo = `historico_${loteria}.json`;
        const caminhoArquivo = path.join(__dirname, '..', nomeArquivo);

        let historicoLocal = [];

        // 1. Carrega o histórico local existente
        if (fs.existsSync(caminhoArquivo)) {
            try {
                const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
                historicoLocal = JSON.parse(conteudo);
                if (!Array.isArray(historicoLocal)) historicoLocal = [];
            } catch (e) {
                console.warn(`⚠️ Não foi possível ler ${nomeArquivo}, iniciando novo histórico.`);
                historicoLocal = [];
            }
        }

        // 2. Identifica o último concurso salvo localmente
        let ultimoConcursoLocal = 0;
        if (historicoLocal.length > 0) {
            ultimoConcursoLocal = Math.max(...historicoLocal.map(item => item.concurso || item.contestNumber || 0));
        }

        const urlApi = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${loteria}`;

        try {
            // 3. Consulta o concurso mais recente na API da Caixa
            const ultimoConcursoApiData = await fetchCaixa(urlApi);

            if (!ultimoConcursoApiData || !ultimoConcursoApiData.numero) {
                console.error(`❌ [${loteria.toUpperCase()}] Erro ao consultar último concurso na API.`);
                continue;
            }

            const ultimoConcursoApi = ultimoConcursoApiData.numero;

            console.log(`🔹 ${loteria.toUpperCase()}: Local = ${ultimoConcursoLocal} | Caixa = ${ultimoConcursoApi}`);

            if (ultimoConcursoApi <= ultimoConcursoLocal) {
                console.log(`   ✔ Já está atualizado.\n`);
                continue;
            }

            // 4. Baixa os novos concursos do mais antigo faltante até o mais recente
            const inicio = ultimoConcursoLocal > 0 ? ultimoConcursoLocal + 1 : ultimoConcursoApi;
            let novosAdicionados = 0;

            for (let c = inicio; c <= ultimoConcursoApi; c++) {
                let dataConcurso = null;

                if (c === ultimoConcursoApi) {
                    dataConcurso = ultimoConcursoApiData;
                } else {
                    dataConcurso = await fetchCaixa(`${urlApi}/${c}`);
                }

                if (dataConcurso) {
                    const formatado = formatarConcurso(dataConcurso, loteria);
                    if (formatado) {
                        historicoLocal.push(formatado);
                        novosAdicionados++;
                    }
                }

                await new Promise(r => setTimeout(r, 80));
            }

            // Ordena os concursos em ordem crescente
            historicoLocal.sort((a, b) => a.concurso - b.concurso);

            // 5. Salva no Arquivo JSON
            fs.writeFileSync(caminhoArquivo, JSON.stringify(historicoLocal, null, 2), 'utf-8');
            console.log(`   ✔ Sucesso: ${novosAdicionados} novo(s) concurso(s) salvo(s) em ${nomeArquivo}.`);

            // 6. Atualiza no Firestore
            if (db) {
                await db.collection('loterias').doc(loteria).set({
                    historico: historicoLocal,
                    ultimoConcurso: historicoLocal[historicoLocal.length - 1],
                    ultimaAtualizacao: new Date().toISOString()
                }, { merge: true });

                console.log(`   🔥 Sincronizado no Firestore: document('loterias/${loteria}')\n`);
            }

        } catch (err) {
            console.error(`❌ Erro ao processar ${loteria}: ${err.message}\n`);
        }
    }

    console.log(`==================================================`);
    console.log(`Sincronização de todas as loterias concluída!`);
    console.log(`==================================================\n`);
}

atualizarLoterias();