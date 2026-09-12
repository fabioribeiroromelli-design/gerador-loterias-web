/* ============================================================
   gerador-avancado-data.js
   Configurações das loterias + cálculo de estatísticas
   ============================================================ */

const LOTTERY_CONFIGS = {
    'Mega-Sena':       { maxNumber: 60, numbersToSelect: 6,  minSum: 21, maxSum: 324, avgSum: 183.0, startNumber: 1, minSel: 6,  maxSel: 20 },
    'Lotofácil':       { maxNumber: 25, numbersToSelect: 15, minSum: 120, maxSum: 310, avgSum: 195.0, startNumber: 1, minSel: 15, maxSel: 20 },
    'Quina':           { maxNumber: 80, numbersToSelect: 5,  minSum: 15, maxSum: 380, avgSum: 202.0, startNumber: 1, minSel: 5,  maxSel: 15 },
    'Lotomania':       { maxNumber: 99, numbersToSelect: 50, minSum: 0,  maxSum: 4950, avgSum: 987.0, startNumber: 0, minSel: 50, maxSel: 50 },
    'Timemania':       { maxNumber: 80, numbersToSelect: 10, minSum: 55, maxSum: 735, avgSum: 283.0, startNumber: 1, minSel: 10, maxSel: 10 },
    'Dupla Sena':      { maxNumber: 50, numbersToSelect: 6,  minSum: 21, maxSum: 285, avgSum: 153.0, startNumber: 1, minSel: 6,  maxSel: 15 },
    'Dia de Sorte':    { maxNumber: 31, numbersToSelect: 7,  minSum: 28, maxSum: 196, avgSum: 112.0, startNumber: 1, minSel: 7,  maxSel: 15 },
    'Super Sete':      { maxNumber: 9,  numbersToSelect: 7,  minSum: 0,  maxSum: 63,  avgSum: 31.5,  startNumber: 0, minSel: 7,  maxSel: 7  },
    'Mais Milionária': { maxNumber: 50, numbersToSelect: 6,  minSum: 21, maxSum: 285, avgSum: 153.0, startNumber: 1, minSel: 6,  maxSel: 12 }
};

const ARQUIVO_JSON_MAP = {
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

// Primos até 100
const PRIMOS_SET = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]);
function isPrime(n) { return PRIMOS_SET.has(n); }

// ============================================================
// CACHE E CARREGAMENTO DO HISTÓRICO
// ============================================================
const _historicoCache = {};

async function carregarHistorico(lotteryName) {
    if (_historicoCache[lotteryName]) return _historicoCache[lotteryName];

    const arquivo = ARQUIVO_JSON_MAP[lotteryName];
    if (!arquivo) return [];

    try {
        const resp = await fetch(`./${arquivo}?v=${Date.now()}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const historico = Array.isArray(data) ? data : [];
        _historicoCache[lotteryName] = historico;
        return historico;
    } catch (e) {
        console.error(`Erro ao carregar ${arquivo}:`, e);
        return [];
    }
}

// ============================================================
// CÁLCULO DE ESTATÍSTICAS COMPLETAS (para o gerador)
// ============================================================
function calcularEstatisticas(historico) {
    if (!historico || historico.length === 0) {
        return { freq: {}, delay: {}, avgSum: 0, total: 0, hotNumbers: [], delayNumbers: [] };
    }

    // Ordena mais recente primeiro
    const ordenadoDesc = [...historico].sort((a, b) =>
        Number(b.concurso || b.numero || 0) - Number(a.concurso || a.numero || 0)
    );

    const freq = {};
    const delay = {};
    const todasDezenas = new Set();

    // Coleta de todos os números que apareceram
    ordenadoDesc.forEach(draw => {
        const nums = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
        nums.forEach(n => {
            if (!isNaN(n)) {
                todasDezenas.add(n);
                freq[n] = (freq[n] || 0) + 1;
            }
        });
    });

    // Calcula atraso (quantos concursos desde a última aparição)
    [...todasDezenas].forEach(n => {
        for (let i = 0; i < ordenadoDesc.length; i++) {
            const nums = (ordenadoDesc[i].dezenas || ordenadoDesc[i].listaDezenas || []).map(n => parseInt(n, 10));
            if (nums.includes(n)) { delay[n] = i; break; }
        }
        if (delay[n] === undefined) delay[n] = ordenadoDesc.length;
    });

    // Soma média
    const sumTotal = ordenadoDesc.reduce((acc, draw) => {
        const nums = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        return acc + nums.reduce((a, b) => a + b, 0);
    }, 0);
    const avgSum = sumTotal / ordenadoDesc.length;

    // Números quentes e atrasados (top 40%)
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
