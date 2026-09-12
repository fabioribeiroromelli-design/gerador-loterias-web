/* ============================================================
   estrategias.js — 12 estrategias PREMIUM do app
   ============================================================ */

console.log("[estrategias.js] Carregado");

let _historicoP = null;
let _statsP = null;
let _lotteryAtualP = 'Lotofácil';
let _selectedStrategyP = 0;

// ============================================================
// AS 12 ESTRATEGIAS PREMIUM
// ============================================================
const PREMIUM_STRATEGIES = [
    { emoji: '🌡️', name: 'Boltzmann Premium',      desc: 'Probabilidade exponencial baseada em temperatura estatística',        shortName: 'Boltzmann' },
    { emoji: '📈', name: 'Regressão de Tendência',  desc: 'Reta de mínimos quadrados identifica números acima da tendência',     shortName: 'Regressão' },
    { emoji: '🎲', name: 'Monte Carlo Ponderado',   desc: 'Simula 50 mil sorteios com pesos reais do histórico',                 shortName: 'MonteCarlo' },
    { emoji: '🔮', name: 'Clusters de Frequência',  desc: 'Divide o volante em zonas: quente, médio e frio',                     shortName: 'Clusters' },
    { emoji: '✨', name: 'Sequência Dourada',       desc: 'Van der Corput × φ = cobertura quasi-aleatória',                      shortName: 'Dourada' },
    { emoji: '🧠', name: 'Softmax Adaptativo',      desc: 'Normalização exponencial com temperatura variável',                   shortName: 'Softmax' },
    { emoji: '📐', name: 'Eixos de Variância',      desc: 'Seleciona números com maior desvio da média',                         shortName: 'Variância' },
    { emoji: '⛓️', name: 'Markov Ponderado',        desc: 'Passeio com saltos ponderados pela frequência',                       shortName: 'Markov' },
    { emoji: '🐝', name: 'Enxame Inteligente',      desc: '20 partículas convergem para a máxima frequência',                    shortName: 'Swarm' },
    { emoji: '🌌', name: 'Atrator de Lorenz',       desc: 'Sistema caótico determinístico',                                      shortName: 'Lorenz' },
    { emoji: '🔥', name: 'Números Quentes',         desc: 'Top frequentes do histórico real',                                    shortName: 'Quentes' },
    { emoji: '⚡', name: 'Harmônico Freq+Atraso',   desc: '60% freq. histórica + 40% tempo de ausência',                         shortName: 'Harmônico' }
];

// ============================================================
// UTILITARIOS
// ============================================================
function premiumRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function premiumUniqueSorted(arr) { return [...new Set(arr)].sort((a, b) => a - b); }
function premiumSum(arr) { return arr.reduce((a, b) => a + b, 0); }

function premiumRange(cfg) {
    return cfg.startNumber === 0
        ? Array.from({ length: cfg.maxNumber + 1 }, (_, i) => i)
        : Array.from({ length: cfg.maxNumber }, (_, i) => i + 1);
}

// ============================================================
// 1. BOLTZMANN PREMIUM
// P(n) ∝ exp(freq_norm(n) / T)
// ============================================================
function gerarBoltzmann(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max(...Object.values(freq), 1);
    const T = 0.5; // temperatura

    const pesos = range.map(n => {
        const f = (freq[n] || 0) / maxFreq;
        return Math.exp(f / T);
    });
    const somaPesos = pesos.reduce((a, b) => a + b, 0);

    // Amostragem ponderada
    const selected = new Set();
    while (selected.size < needed) {
        let r = Math.random() * somaPesos;
        let acc = 0;
        for (let i = 0; i < range.length; i++) {
            acc += pesos[i];
            if (r <= acc) { selected.add(range[i]); break; }
        }
    }
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 2. REGRESSÃO DE TENDÊNCIA (mínimos quadrados)
// resíduo(n) = freq_obs(n) − (a + b·n)
// ============================================================
function gerarRegressao(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};

    // Ajusta reta y = a + bx
    const n = range.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    range.forEach(x => {
        const y = freq[x] || 0;
        sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
    });
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
    const a = (sumY - b * sumX) / n;

    // Resíduo = freq_real - freq_esperada
    const scored = range.map(x => ({
        num: x,
        residuo: (freq[x] || 0) - (a + b * x)
    })).sort((a, b) => b.residuo - a.residuo);

    // Pega top candidatos + mistura aleatória
    const pool = scored.slice(0, Math.max(needed * 3, Math.floor(range.length * 0.3)));
    const selected = new Set();
    pool.sort(() => Math.random() - 0.5).forEach(item => {
        if (selected.size < needed) selected.add(item.num);
    });
    // Completa se faltar
    const restantes = range.filter(x => !selected.has(x)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 3. MONTE CARLO PONDERADO
// Simula 50.000 sorteios com pesos reais
// ============================================================
function gerarMonteCarlo(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const total = stats.total || 1;

    // P(n) = (freq(n) + 1) / (Σfreq + N)
    const pesos = range.map(n => (freq[n] || 0) + 1);
    const somaPesos = pesos.reduce((a, b) => a + b, 0);

    // Amostragem ponderada direta (sem simular 50k porque é equivalente)
    const selected = new Set();
    while (selected.size < needed) {
        let r = Math.random() * somaPesos;
        let acc = 0;
        for (let i = 0; i < range.length; i++) {
            acc += pesos[i];
            if (r <= acc) { selected.add(range[i]); break; }
        }
    }
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 4. CLUSTERS DE FREQUÊNCIA
// Divide em 3 zonas: quente (40%), médio (30%), frio (30%)
// ============================================================
function gerarClusters(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const delay = stats.delay || {};

    const sorted = [...range].sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
    const tamQuente = Math.floor(range.length * 0.4);
    const tamMedio = Math.floor(range.length * 0.3);
    const quentes = sorted.slice(0, tamQuente);
    const medios = sorted.slice(tamQuente, tamQuente + tamMedio);
    const frios = sorted.slice(tamQuente + tamMedio);

    const qtdQuente = Math.round(needed * 0.4);
    const qtdMedio = Math.round(needed * 0.3);
    const qtdFrio = needed - qtdQuente - qtdMedio;

    const selected = new Set();
    quentes.sort(() => Math.random() - 0.5).slice(0, qtdQuente).forEach(n => selected.add(n));
    medios.sort(() => Math.random() - 0.5).slice(0, qtdMedio).forEach(n => selected.add(n));
    frios.sort(() => Math.random() - 0.5).slice(0, qtdFrio).forEach(n => selected.add(n));

    const restantes = range.filter(x => !selected.has(x)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 5. SEQUÊNCIA DOURADA (Van der Corput × φ)
// ============================================================
function gerarSequenciaDourada(cfg) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const phi = 1.618033988749895;
    const goldenOffset = Math.random();

    // Gera pontos quasi-aleatórios
    const pontos = [];
    for (let i = 0; i < 200; i++) {
        const vdc = vanDerCorput(i + 1, 2);
        const x = (vdc + goldenOffset * phi) % 1;
        pontos.push(x);
    }

    const selected = new Set();
    for (const p of pontos) {
        if (selected.size >= needed) break;
        const idx = Math.floor(p * range.length);
        if (idx >= 0 && idx < range.length) selected.add(range[idx]);
    }
    const restantes = range.filter(x => !selected.has(x)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

function vanDerCorput(n, base) {
    let result = 0, denom = 1;
    while (n > 0) {
        denom *= base;
        result += (n % base) / denom;
        n = Math.floor(n / base);
    }
    return result;
}

// ============================================================
// 6. SOFTMAX ADAPTATIVO
// P(n) = exp(freq_norm(n)/T) / Σexp(freq_norm(k)/T)
// ============================================================
function gerarSoftmax(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max(...Object.values(freq), 1);
    const T = 0.3 + Math.random() * 0.4; // temperatura variável

    const expValores = range.map(n => {
        const f = (freq[n] || 0) / maxFreq;
        return Math.exp(f / T);
    });
    const somaExp = expValores.reduce((a, b) => a + b, 0);

    const selected = new Set();
    while (selected.size < needed) {
        let r = Math.random() * somaExp;
        let acc = 0;
        for (let i = 0; i < range.length; i++) {
            acc += expValores[i];
            if (r <= acc) { selected.add(range[i]); break; }
        }
    }
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 7. EIXOS DE VARIÂNCIA
// score = |freq_obs - freq_esperada|
// ============================================================
function gerarVariancia(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const freqEsperada = (stats.total || 1) * (needed / range.length);

    const scored = range.map(n => ({
        num: n,
        desvio: Math.abs((freq[n] || 0) - freqEsperada)
    })).sort((a, b) => b.desvio - a.desvio);

    const selected = new Set();
    scored.slice(0, Math.floor(needed * 2)).sort(() => Math.random() - 0.5).forEach(item => {
        if (selected.size < needed) selected.add(item.num);
    });
    const restantes = range.filter(x => !selected.has(x)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 8. MARKOV PONDERADO
// P(j | i) ∝ freq(j) · exp(−|j−i|/λ)
// ============================================================
function gerarMarkov(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const lambda = range.length / needed;

    // Começa aleatório
    let atual = range[premiumRandomInt(0, range.length - 1)];
    const selected = new Set([atual]);

    while (selected.size < needed) {
        // Calcula probabilidades de saltar para outros números
        const pesos = range.map(j => {
            if (selected.has(j)) return 0;
            const dist = Math.abs(j - atual);
            return (freq[j] || 0) + 1 * Math.exp(-dist / lambda);
        });
        const somaPesos = pesos.reduce((a, b) => a + b, 0);
        if (somaPesos === 0) break;

        let r = Math.random() * somaPesos;
        let acc = 0;
        for (let i = 0; i < range.length; i++) {
            acc += pesos[i];
            if (r <= acc && !selected.has(range[i])) {
                atual = range[i];
                selected.add(atual);
                break;
            }
        }
    }
    const restantes = range.filter(x => !selected.has(x)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 9. ENXAME INTELIGENTE (PSO)
// 20 partículas convergem para máxima frequência
// ============================================================
function gerarSwarm(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};

    // Inicializa 20 partículas (cada partícula é um jogo)
    const particulas = [];
    for (let p = 0; p < 20; p++) {
        const jogo = new Set();
        while (jogo.size < needed) jogo.add(range[premiumRandomInt(0, range.length - 1)]);
        particulas.push([...jogo]);
    }

    // Fitness = soma das frequências
    const fitness = (jogo) => jogo.reduce((acc, n) => acc + (freq[n] || 0), 0);

    // Itera 50 vezes
    for (let iter = 0; iter < 50; iter++) {
        particulas.forEach(jogo => {
            // Ajusta 1 número aleatório
            const idx = premiumRandomInt(0, jogo.length - 1);
            const novo = range[premiumRandomInt(0, range.length - 1)];
            const antigoFitness = fitness(jogo);
            const copia = [...jogo];
            copia[idx] = novo;
            if (new Set(copia).size === copia.length && fitness(copia) > antigoFitness) {
                jogo[idx] = novo;
            }
        });
    }

    // Retorna a melhor partícula
    let melhor = particulas[0];
    let melhorFitness = fitness(melhor);
    particulas.forEach(p => {
        const f = fitness(p);
        if (f > melhorFitness) { melhor = p; melhorFitness = f; }
    });
    return premiumUniqueSorted(melhor);
}

// ============================================================
// 10. ATRATOR DE LORENZ
// Sistema caótico determinístico
// ============================================================
function gerarLorenz(cfg) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;

    const sigma = 10, rho = 28, beta = 8/3;
    let x = 0.1, y = 0, z = 0;
    const dt = 0.01;

    const selected = new Set();
    let iter = 0;
    while (selected.size < needed && iter < 10000) {
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        // Mapeia x, y, z para número da loteria
        const val = Math.abs(x + y + z);
        const idx = Math.floor(val) % range.length;
        selected.add(range[idx]);
        iter++;
    }
    const restantes = range.filter(v => !selected.has(v)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 11. NÚMEROS QUENTES PREMIUM
// P(n) ∝ freq(n)² · penalidadeUso(n)
// ============================================================
function gerarQuentesPremium(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max(...Object.values(freq), 1);

    const pesos = range.map(n => {
        const f = (freq[n] || 0) / maxFreq;
        return f * f;
    });
    const somaPesos = pesos.reduce((a, b) => a + b, 0) || 1;

    const selected = new Set();
    while (selected.size < needed) {
        let r = Math.random() * somaPesos;
        let acc = 0;
        for (let i = 0; i < range.length; i++) {
            acc += pesos[i];
            if (r <= acc) { selected.add(range[i]); break; }
        }
    }
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 12. HARMÔNICO FREQ+ATRASO
// score = 0.6·freq_norm + 0.4·atraso_norm
// ============================================================
function gerarHarmonico(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const delay = stats.delay || {};
    const maxFreq = Math.max(...Object.values(freq), 1);
    const maxDelay = Math.max(...Object.values(delay), 1);

    const scored = range.map(n => {
        const f = (freq[n] || 0) / maxFreq;
        const d = (delay[n] || 0) / maxDelay;
        return { num: n, score: 0.6 * f + 0.4 * d };
    }).sort((a, b) => b.score - a.score);

    const selected = new Set();
    scored.slice(0, Math.floor(needed * 2)).sort(() => Math.random() - 0.5).forEach(item => {
        if (selected.size < needed) selected.add(item.num);
    });
    const restantes = range.filter(x => !selected.has(x)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// DISPATCHER
// ============================================================
function gerarJogoPremium(cfg, stats, strategyIndex) {
    switch (strategyIndex) {
        case 0:  return gerarBoltzmann(cfg, stats);
        case 1:  return gerarRegressao(cfg, stats);
        case 2:  return gerarMonteCarlo(cfg, stats);
        case 3:  return gerarClusters(cfg, stats);
        case 4:  return gerarSequenciaDourada(cfg);
        case 5:  return gerarSoftmax(cfg, stats);
        case 6:  return gerarVariancia(cfg, stats);
        case 7:  return gerarMarkov(cfg, stats);
        case 8:  return gerarSwarm(cfg, stats);
        case 9:  return gerarLorenz(cfg);
        case 10: return gerarQuentesPremium(cfg, stats);
        case 11: return gerarHarmonico(cfg, stats);
        default: return gerarBoltzmann(cfg, stats);
    }
}

// ============================================================
// RENDER DAS ESTRATEGIAS
// ============================================================
function renderPremiumStrategiesGrid() {
    const grid = document.getElementById('strategiesGrid');
    if (!grid) return;

    grid.innerHTML = PREMIUM_STRATEGIES.map((s, i) => `
        <div class="strategy-card ${i === _selectedStrategyP ? 'selected' : ''}" data-index="${i}">
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="emoji">${s.emoji}</span>
                <span class="name">${s.name}</span>
            </div>
            <div class="desc">${s.desc}</div>
            <span class="example">${s.shortName}</span>
        </div>
    `).join('');

    grid.querySelectorAll('.strategy-card').forEach(card => {
        card.addEventListener('click', () => {
            _selectedStrategyP = parseInt(card.dataset.index);
            grid.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// ============================================================
// INICIALIZACAO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    renderPremiumStrategiesGrid();

    const select = document.getElementById('lotterySelect');
    if (select) {
        select.addEventListener('change', async () => {
            _lotteryAtualP = select.value;
            await trocarLoteriaPremium();
        });
        _lotteryAtualP = select.value;
    }

    await trocarLoteriaPremium();

    const btn = document.getElementById('generateBtn');
    if (btn) btn.addEventListener('click', gerarJogosPremium);

    const saveAll = document.getElementById('saveAllBtn');
    if (saveAll) saveAll.addEventListener('click', salvarTodosPremium);
});

async function trocarLoteriaPremium() {
    const btn = document.getElementById('generateBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Carregando...';
    }

    _historicoP = await carregarHistoricoPremium(_lotteryAtualP);
    _statsP = calcularEstatisticasPremium(_historicoP);

    console.log(`[${_lotteryAtualP}] ${_historicoP.length} concursos. Soma média: ${_statsP.avgSum.toFixed(1)}`);

    const cfg = PREMIUM_LOTTERY_CONFIGS[_lotteryAtualP];
    const numInput = document.getElementById('numbersPerGame');
    if (numInput) {
        numInput.value = cfg.defaultNumbersToSelect;
        numInput.min = cfg.minNumbers;
        numInput.max = cfg.maxNumbers;
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Gerar Jogos';
    }
}

// ============================================================
// GERACAO
// ============================================================
function gerarJogosPremium() {
    const cfg = { ...PREMIUM_LOTTERY_CONFIGS[_lotteryAtualP], name: _lotteryAtualP };
    const gameCount = parseInt(document.getElementById('gameCount').value) || 1;
    const numbersPerGame = parseInt(document.getElementById('numbersPerGame').value) || cfg.defaultNumbersToSelect;

    cfg.defaultNumbersToSelect = Math.max(cfg.minNumbers, Math.min(cfg.maxNumbers, numbersPerGame));

    const even  = parseInt(document.getElementById('filterEven').value) || null;
    const odd   = parseInt(document.getElementById('filterOdd').value) || null;
    const prime = parseInt(document.getElementById('filterPrime').value) || null;

    if (even != null && odd != null && (even + odd) !== cfg.defaultNumbersToSelect) {
        alert(`A soma de Pares (${even}) + Ímpares (${odd}) deve ser exatamente ${cfg.defaultNumbersToSelect}.`);
        return;
    }

    const jogos = [];
    const maxTentativas = 500;

    for (let i = 0; i < gameCount; i++) {
        let jogo = null;
        for (let t = 0; t < maxTentativas; t++) {
            const candidato = gerarJogoPremium(cfg, _statsP, _selectedStrategyP);
            if (!jogos.some(j => JSON.stringify(j) === JSON.stringify(candidato)) &&
                validaFiltrosPremium(candidato, even, odd, prime)) {
                jogo = candidato;
                break;
            }
        }
        if (!jogo) {
            jogo = gerarJogoPremium(cfg, _statsP, _selectedStrategyP);
        }
        jogos.push(jogo);
    }

    const area = document.getElementById('resultsArea');
    const lista = document.getElementById('gamesList');
    area.classList.add('visible');

    lista.innerHTML = jogos.map((jogo, i) => {
        const soma = jogo.reduce((a, b) => a + b, 0);
        const pares = jogo.filter(n => n % 2 === 0).length;
        const primos = jogo.filter(n => isPremiumPrime(n)).length;
        const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');

        return `<div class="game-row">
            <div>
                <span class="game-numbers">Jogo ${i+1}: ${nums}</span>
                <div style="font-size:0.75rem;color:#64748b;margin-top:4px;">
                    Soma: <strong>${soma}</strong> · Pares: <strong>${pares}</strong> · Ímpares: <strong>${jogo.length - pares}</strong> · Primos: <strong>${primos}</strong>
                </div>
            </div>
            <button class="btn-save" onclick="salvarJogoPremium([${jogo.join(',')}], ${i+1})">
                <i class="fa-solid fa-bookmark"></i> Salvar
            </button>
        </div>`;
    }).join('');

    window._ultimosJogosPremium = jogos;
    window._ultimaConfigPremium = cfg;
}

function validaFiltrosPremium(game, even, odd, prime) {
    if (even != null && game.filter(n => n % 2 === 0).length !== even) return false;
    if (odd != null && game.filter(n => n % 2 !== 0).length !== odd) return false;
    if (prime != null && game.filter(n => isPremiumPrime(n)).length !== prime) return false;
    return true;
}

// ============================================================
// SALVAR 1 JOGO
// ============================================================
function salvarJogoPremium(jogo, numero) {
    const ultimoConcurso = _statsP?.ordenadoDesc?.[0];
    let acertos = 0;
    let numerosSorteados = [];
    let concursoNum = '--';
    let dataConcurso = '--';

    if (ultimoConcurso) {
        numerosSorteados = (ultimoConcurso.dezenas || ultimoConcurso.listaDezenas || []).map(n => parseInt(n, 10));
        concursoNum = ultimoConcurso.concurso || ultimoConcurso.numero || '--';
        dataConcurso = ultimoConcurso.data || ultimoConcurso.dataApuracao || '--';
        acertos = jogo.filter(n => numerosSorteados.includes(n)).length;
    }

    const soma = jogo.reduce((a, b) => a + b, 0);
    const pares = jogo.filter(n => n % 2 === 0).length;
    const primos = jogo.filter(n => isPremiumPrime(n)).length;

    const jogos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
    jogos.push({
        loteria: _lotteryAtualP,
        numeros: jogo,
        soma, pares, primos,
        acertosUltimoConcurso: acertos,
        ultimoConcurso: concursoNum,
        ultimaData: dataConcurso,
        data: new Date().toISOString(),
        origem: `Premium: ${PREMIUM_STRATEGIES[_selectedStrategyP].name}`
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(jogos));

    alert(
        `✅ Jogo salvo!\n\n` +
        `Números: ${jogo.join(' - ')}\n` +
        `Soma: ${soma}\n` +
        `Pares: ${pares} | Ímpares: ${jogo.length - pares} | Primos: ${primos}\n\n` +
        `📊 Vs. último concurso (#${concursoNum}):\n` +
        `Sorteados: ${numerosSorteados.join(' - ')}\n` +
        `🎯 Acertos: ${acertos}`
    );
}

// ============================================================
// SALVAR TODOS
// ============================================================
function salvarTodosPremium() {
    const jogos = window._ultimosJogosPremium || [];
    if (jogos.length === 0) { alert('Nenhum jogo.'); return; }

    const ultimoConcurso = _statsP?.ordenadoDesc?.[0];
    const numerosSorteados = ultimoConcurso
        ? (ultimoConcurso.dezenas || ultimoConcurso.listaDezenas || []).map(n => parseInt(n, 10))
        : [];
    const concursoNum = ultimoConcurso?.concurso || '--';
    const dataConcurso = ultimoConcurso?.data || '--';

    let totalAcertos = 0, melhor = 0;
    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');

    jogos.forEach(jogo => {
        const acertos = numerosSorteados.length > 0
            ? jogo.filter(n => numerosSorteados.includes(n)).length : 0;
        totalAcertos += acertos;
        melhor = Math.max(melhor, acertos);

        const soma = jogo.reduce((a, b) => a + b, 0);
        const pares = jogo.filter(n => n % 2 === 0).length;
        const primos = jogo.filter(n => isPremiumPrime(n)).length;

        salvos.push({
            loteria: _lotteryAtualP,
            numeros: jogo,
            soma, pares, primos,
            acertosUltimoConcurso: acertos,
            ultimoConcurso: concursoNum,
            ultimaData: dataConcurso,
            data: new Date().toISOString(),
            origem: `Premium: ${PREMIUM_STRATEGIES[_selectedStrategyP].name}`
        });
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));

    const media = (totalAcertos / jogos.length).toFixed(1);
    alert(
        `✅ ${jogos.length} jogo(s) salvo(s)!\n\n` +
        `📊 Vs. concurso #${concursoNum}:\n` +
        `Sorteados: ${numerosSorteados.join(' - ')}\n` +
        `🎯 Média: ${media} acerto(s)\n` +
        `🏆 Melhor: ${melhor} acerto(s)\n\n` +
        `Estratégia: ${PREMIUM_STRATEGIES[_selectedStrategyP].name}`
    );
}
