/* ============================================================
   estrategias-data.js
   Configuracoes + estatisticas + carregamento de historico
   ============================================================ */

console.log("[estrategias-data.js] Carregado");

// ============================================================
// CONFIGURACOES DAS LOTERIAS
// ============================================================
const PREMIUM_LOTTERY_CONFIGS = {
    'Mega-Sena':       { maxNumber: 60, defaultNumbersToSelect: 6,  minNumbers: 6,  maxNumbers: 20, startNumber: 1 },
    'Lotofácil':       { maxNumber: 25, defaultNumbersToSelect: 15, minNumbers: 15, maxNumbers: 20, startNumber: 1 },
    'Quina':           { maxNumber: 80, defaultNumbersToSelect: 5,  minNumbers: 5,  maxNumbers: 15, startNumber: 1 },
    'Lotomania':       { maxNumber: 99, defaultNumbersToSelect: 50, minNumbers: 50, maxNumbers: 50, startNumber: 0 },
    'Timemania':       { maxNumber: 80, defaultNumbersToSelect: 10, minNumbers: 10, maxNumbers: 10, startNumber: 1 },
    'Dupla Sena':      { maxNumber: 50, defaultNumbersToSelect: 6,  minNumbers: 6,  maxNumbers: 15, startNumber: 1 },
    'Dia de Sorte':    { maxNumber: 31, defaultNumbersToSelect: 7,  minNumbers: 7,  maxNumbers: 15, startNumber: 1 },
    'Super Sete':      { maxNumber: 9,  defaultNumbersToSelect: 7,  minNumbers: 7,  maxNumbers: 7,  startNumber: 0 },
    'Mais Milionária': { maxNumber: 50, defaultNumbersToSelect: 6,  minNumbers: 6,  maxNumbers: 12, startNumber: 1 }
};

// ============================================================
// MAPA DOS ARQUIVOS JSON
// ============================================================
const PREMIUM_ARQUIVO_JSON_MAP = {
    'Mega-Sena':       'historico_megasena.json',
    'Lotofácil':       'historico_lotofacil.json',
    'Quina':           'historico_quina.json',
    'Lotomania':       'historico_lotomania.json',
    'Timemania':       'historico_timemania.json',
    'Dupla Sena':      'historico_duplasena.json',
    'Dia de Sorte':    'historico_diadesorte.json',
    'Super Sete':      'historico_supersete.json',
    'Mais Milionária': 'historico_maismilionaria.json'
};

// ============================================================
// PRIMOS
// ============================================================
const PREMIUM_PRIMOS = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]);
function isPremiumPrime(n) { return PREMIUM_PRIMOS.has(n); }

// ============================================================
// CARREGAMENTO DO HISTORICO
// ============================================================
const _premiumHistoricoCache = {};

async function carregarHistoricoPremium(lotteryName) {
    if (_premiumHistoricoCache[lotteryName]) return _premiumHistoricoCache[lotteryName];

    const arquivo = PREMIUM_ARQUIVO_JSON_MAP[lotteryName];
    if (!arquivo) return [];

    try {
        const url = "./" + arquivo + "?v=" + Date.now();
        console.log("[premium] Carregando: " + url);
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("HTTP " + resp.status);

        const data = await resp.json();
        const historico = Array.isArray(data) ? data : [];
        _premiumHistoricoCache[lotteryName] = historico;
        console.log("[premium] " + lotteryName + ": " + historico.length + " concursos");
        return historico;
    } catch (e) {
        console.error("[premium] Erro: ", e);
        return [];
    }
}

// ============================================================
// CALCULO DE ESTATISTICAS
// ============================================================
function calcularEstatisticasPremium(historico) {
    if (!historico || historico.length === 0) {
        return { freq: {}, delay: {}, avgSum: 0, total: 0, hotNumbers: [], delayNumbers: [], ordenadoDesc: [] };
    }

    const ordenadoDesc = [...historico].sort((a, b) =>
        Number(b.concurso || b.numero || 0) - Number(a.concurso || a.numero || 0)
    );

    const freq = {};
    const delay = {};
    const todasDezenas = new Set();

    ordenadoDesc.forEach(draw => {
        const nums = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
        nums.forEach(n => {
            if (!isNaN(n)) {
                todasDezenas.add(n);
                freq[n] = (freq[n] || 0) + 1;
            }
        });
    });

    [...todasDezenas].forEach(n => {
        for (let i = 0; i < ordenadoDesc.length; i++) {
            const nums = (ordenadoDesc[i].dezenas || ordenadoDesc[i].listaDezenas || []).map(x => parseInt(x, 10));
            if (nums.includes(n)) { delay[n] = i; break; }
        }
        if (delay[n] === undefined) delay[n] = ordenadoDesc.length;
    });

    const sumTotal = ordenadoDesc.reduce((acc, draw) => {
        const nums = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        return acc + nums.reduce((a, b) => a + b, 0);
    }, 0);
    const avgSum = sumTotal / ordenadoDesc.length;

    const hotNumbers = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.max(10, Math.floor(Object.keys(freq).length * 0.4)))
        .map(([n]) => parseInt(n));

    const delayNumbers = Object.entries(delay)
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.max(10, Math.floor(Object.keys(delay).length * 0.4)))
        .map(([n]) => parseInt(n));

    return {
        freq, delay, avgSum, total: ordenadoDesc.length,
        hotNumbers, delayNumbers, ordenadoDesc
    };
}

console.log("[estrategias-data.js] Funcoes prontas");
