/* ============================================================
   fechamento-dados.js
   Configurações das loterias + objetivos + cálculos matemáticos
   ============================================================ */

console.log("[fechamento-dados.js] Carregado");

// ============================================================
// CONFIGURAÇÕES DAS LOTERIAS
// ============================================================
const FECHAMENTO_LOTERIAS = {
    'Mega-Sena': {
        maxNumber: 60,
        minNumber: 1,
        startNumber: 1,
        numerosSorteados: 6,
        color: '#209869',
        arquivo: 'historico_megasena.json',
        objetivos: [
            { id: 'sena',   label: 'Sena (6 acertos)',    acertos: 6 },
            { id: 'quina',  label: 'Quina (5 acertos)',   acertos: 5 },
            { id: 'quadra', label: 'Quadra (4 acertos)',  acertos: 4 }
        ]
    },
    'Lotofácil': {
        maxNumber: 25,
        minNumber: 1,
        startNumber: 1,
        numerosSorteados: 15,
        color: '#930089',
        arquivo: 'historico_lotofacil.json',
        objetivos: [
            { id: '15', label: '15 acertos', acertos: 15 },
            { id: '14', label: '14 acertos', acertos: 14 },
            { id: '13', label: '13 acertos', acertos: 13 },
            { id: '12', label: '12 acertos', acertos: 12 },
            { id: '11', label: '11 acertos', acertos: 11 }
        ]
    },
    'Quina': {
        maxNumber: 80,
        minNumber: 1,
        startNumber: 1,
        numerosSorteados: 5,
        color: '#260085',
        arquivo: 'historico_quina.json',
        objetivos: [
            { id: 'quina',  label: 'Quina (5 acertos)',  acertos: 5 },
            { id: 'quadra', label: 'Quadra (4 acertos)', acertos: 4 },
            { id: 'terno',  label: 'Terno (3 acertos)',  acertos: 3 }
        ]
    },
    'Lotomania': {
        maxNumber: 99,
        minNumber: 0,
        startNumber: 0,
        numerosSorteados: 20,
        color: '#F78100',
        arquivo: 'historico_lotomania.json',
        objetivos: [
            { id: '20', label: '20 acertos', acertos: 20 },
            { id: '19', label: '19 acertos', acertos: 19 },
            { id: '18', label: '18 acertos', acertos: 18 },
            { id: '17', label: '17 acertos', acertos: 17 },
            { id: '16', label: '16 acertos', acertos: 16 }
        ]
    },
    'Timemania': {
        maxNumber: 80,
        minNumber: 1,
        startNumber: 1,
        numerosSorteados: 10,
        color: '#2ecc71',
        arquivo: 'historico_timemania.json',
        objetivos: [
            { id: 'sena',   label: 'Sena (6 acertos)',   acertos: 6 },
            { id: 'quina',  label: 'Quina (5 acertos)',  acertos: 5 },
            { id: 'quadra', label: 'Quadra (4 acertos)', acertos: 4 },
            { id: 'terno',  label: 'Terno (3 acertos)',  acertos: 3 }
        ]
    },
    'Dupla Sena': {
        maxNumber: 50,
        minNumber: 1,
        startNumber: 1,
        numerosSorteados: 6,
        color: '#a61324',
        arquivo: 'historico_duplasena.json',
        objetivos: [
            { id: 'sena',   label: 'Sena (6 acertos)',   acertos: 6 },
            { id: 'quina',  label: 'Quina (5 acertos)',  acertos: 5 },
            { id: 'quadra', label: 'Quadra (4 acertos)', acertos: 4 },
            { id: 'terno',  label: 'Terno (3 acertos)',  acertos: 3 }
        ]
    },
    'Dia de Sorte': {
        maxNumber: 31,
        minNumber: 1,
        startNumber: 1,
        numerosSorteados: 7,
        color: '#cb8322',
        arquivo: 'historico_diadesorte.json',
        objetivos: [
            { id: 'sena',   label: 'Sena (6 acertos)',   acertos: 6 },
            { id: 'quina',  label: 'Quina (5 acertos)',  acertos: 5 },
            { id: 'quadra', label: 'Quadra (4 acertos)', acertos: 4 }
        ]
    },
    'Super Sete': {
        maxNumber: 9,
        minNumber: 0,
        startNumber: 0,
        numerosSorteados: 7,
        colunas: 7,
        color: '#a8cf45',
        arquivo: 'historico_supersete.json',
        objetivos: [
            { id: '7', label: '7 acertos (1 por coluna)', acertos: 7 },
            { id: '6', label: '6 acertos',               acertos: 6 },
            { id: '5', label: '5 acertos',               acertos: 5 },
            { id: '4', label: '4 acertos',               acertos: 4 }
        ]
    },
    'Mais Milionária': {
        maxNumber: 50,
        minNumber: 1,
        startNumber: 1,
        numerosSorteados: 6,
        color: '#1b365d',
        arquivo: 'historico_maismilionaria.json',
        objetivos: [
            { id: 'sena',   label: 'Sena (6 acertos)',   acertos: 6 },
            { id: 'quina',  label: 'Quina (5 acertos)',  acertos: 5 },
            { id: 'quadra', label: 'Quadra (4 acertos)', acertos: 4 }
        ]
    }
};

const FECHAMENTO_LIMITE_JOGOS = 1000;

// ============================================================
// CÁLCULO DE COMBINAÇÕES C(N, K)
// ============================================================
function calcularCombinacao(n, k) {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    const minK = Math.min(k, n - k);
    for (let i = 1; i <= minK; i++) {
        res = res * (n - i + 1) / i;
    }
    return Math.round(res);
}

// ============================================================
// CÁLCULO DO NÚMERO DE JOGOS NECESSÁRIOS PARA GARANTIA 100%
// ============================================================
function calcularJogosNecessarios(loteriaNome, objetivoAcertos, qtdNumerosEscolhidos) {
    const cfg = FECHAMENTO_LOTERIAS[loteriaNome];
    if (!cfg) return 0;

    // Para Super Sete é diferente: C(escolhas por coluna)
    if (loteriaNome === 'Super Sete') {
        return 0; // calculado de outra forma
    }

    // Fechamento 100%: gerar TODAS as combinações de (númerosSorteados)
    // dos N números escolhidos
    const S = cfg.numerosSorteados;
    const N = qtdNumerosEscolhidos;

    if (N < S) return 0; // não dá pra gerar

    return calcularCombinacao(N, S);
}

// ============================================================
// CARREGAR HISTÓRICO (para conferir depois)
// ============================================================
const _fechamentoCache = {};

async function carregarHistoricoFechamento(loteriaNome) {
    if (_fechamentoCache[loteriaNome]) return _fechamentoCache[loteriaNome];
    const cfg = FECHAMENTO_LOTERIAS[loteriaNome];
    if (!cfg) return [];

    try {
        const url = './' + cfg.arquivo + '?v=' + Date.now();
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        const historico = Array.isArray(data) ? data : [];
        _fechamentoCache[loteriaNome] = historico;
        console.log('[fechamento] ' + loteriaNome + ': ' + historico.length + ' concursos');
        return historico;
    } catch (e) {
        console.error('[fechamento] Erro:', e);
        return [];
    }
}

console.log("[fechamento-dados.js] Pronto");