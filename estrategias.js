/* ============================================================
   estrategias.js — 12 PREMIUM + WhatsApp + PDF (VERSÃO CORRIGIDA)
   ✅ Filtros respeitados de verdade (ajuste por swap)
   ✅ Auto-sync pares ↔ ímpares
   ✅ Validação de filtros impossíveis
   ✅ Mensagens claras de erro
   ============================================================ */

console.log("[estrategias.js] Carregado");

let _historicoP = null;
let _statsP = null;
let _lotteryAtualP = 'Lotofácil';
let _selectedStrategyP = 0;
let _avisosUltimaGeracao = []; // avisos sobre filtros não atendidos

const PREMIUM_STRATEGIES = [
    { emoji: '🌡️', name: 'Boltzmann Premium',      desc: 'Probabilidade exponencial baseada em temperatura', shortName: 'Boltzmann' },
    { emoji: '📈', name: 'Regressão de Tendência',  desc: 'Reta de mínimos quadrados',                       shortName: 'Regressão' },
    { emoji: '🎲', name: 'Monte Carlo Ponderado',   desc: 'Simula sorteios com pesos reais',                 shortName: 'MonteCarlo' },
    { emoji: '🔮', name: 'Clusters de Frequência',  desc: 'Zonas: quente/médio/frio',                        shortName: 'Clusters' },
    { emoji: '✨', name: 'Sequência Dourada',       desc: 'Van der Corput × phi',                            shortName: 'Dourada' },
    { emoji: '🧠', name: 'Softmax Adaptativo',      desc: 'Normalização exponencial',                        shortName: 'Softmax' },
    { emoji: '📐', name: 'Eixos de Variância',      desc: 'Maior desvio da média',                           shortName: 'Variância' },
    { emoji: '⛓️', name: 'Markov Ponderado',        desc: 'Passeio com saltos ponderados',                   shortName: 'Markov' },
    { emoji: '🐝', name: 'Enxame Inteligente',      desc: '20 partículas (PSO)',                             shortName: 'Swarm' },
    { emoji: '🌌', name: 'Atrator de Lorenz',       desc: 'Sistema caótico',                                 shortName: 'Lorenz' },
    { emoji: '🔥', name: 'Números Quentes',         desc: 'Top frequentes',                                  shortName: 'Quentes' },
    { emoji: '⚡', name: 'Harmônico Freq+Atraso',   desc: '60% freq + 40% atraso',                           shortName: 'Harmônico' }
];

function isPremiumPrime(n) {
    if (n < 2) return false;
    if (n === 2 || n === 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    let i = 5;
    while (i * i <= n) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
        i += 6;
    }
    return true;
}

function premiumRange(cfg) {
    return cfg.startNumber === 0
        ? Array.from({ length: cfg.maxNumber + 1 }, (_, i) => i)
        : Array.from({ length: cfg.maxNumber }, (_, i) => i + 1);
}

function premiumUniqueSorted(arr) { return [...new Set(arr)].sort((a, b) => a - b); }
function premiumRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function contarPares(jogo) { return jogo.filter(n => n % 2 === 0).length; }
function contarPrimos(jogo) { return jogo.filter(isPremiumPrime).length; }

// ============================================================
// RENDER ESTRATÉGIAS
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
// 12 ESTRATÉGIAS PREMIUM (inalteradas)
// ============================================================
function gerarBoltzmann(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max.apply(null, Object.values(freq).concat([1]));
    const T = 0.5;
    const pesos = range.map(function(n) { return Math.exp(((freq[n] || 0) / maxFreq) / T); });
    const somaPesos = pesos.reduce(function(a, b) { return a + b; }, 0);
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

function gerarRegressao(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const n = range.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    range.forEach(function(x) {
        const y = freq[x] || 0;
        sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
    });
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
    const a = (sumY - b * sumX) / n;
    const scored = range.map(function(x) { return { num: x, residuo: (freq[x] || 0) - (a + b * x) }; });
    scored.sort(function(a, b) { return b.residuo - a.residuo; });
    const pool = scored.slice(0, Math.max(needed * 3, Math.floor(range.length * 0.3)));
    const selected = new Set();
    pool.sort(function() { return Math.random() - 0.5; }).forEach(function(item) {
        if (selected.size < needed) selected.add(item.num);
    });
    const restantes = range.filter(function(x) { return !selected.has(x); });
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

function gerarMonteCarlo(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const pesos = range.map(function(n) { return (freq[n] || 0) + 1; });
    const somaPesos = pesos.reduce(function(a, b) { return a + b; }, 0);
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

function gerarClusters(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const sorted = range.slice().sort(function(a, b) { return (freq[b] || 0) - (freq[a] || 0); });
    const tamQuente = Math.floor(range.length * 0.4);
    const tamMedio = Math.floor(range.length * 0.3);
    const quentes = sorted.slice(0, tamQuente);
    const medios = sorted.slice(tamQuente, tamQuente + tamMedio);
    const frios = sorted.slice(tamQuente + tamMedio);
    const qtdQuente = Math.round(needed * 0.4);
    const qtdMedio = Math.round(needed * 0.3);
    const qtdFrio = needed - qtdQuente - qtdMedio;
    const selected = new Set();
    quentes.sort(function() { return Math.random() - 0.5; }).slice(0, qtdQuente).forEach(function(n) { selected.add(n); });
    medios.sort(function() { return Math.random() - 0.5; }).slice(0, qtdMedio).forEach(function(n) { selected.add(n); });
    frios.sort(function() { return Math.random() - 0.5; }).slice(0, qtdFrio).forEach(function(n) { selected.add(n); });
    const restantes = range.filter(function(x) { return !selected.has(x); });
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

function gerarSequenciaDourada(cfg) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const phi = 1.618033988749895;
    const goldenOffset = Math.random();
    const pontos = [];
    for (let i = 0; i < 200; i++) {
        let n = i + 1, result = 0, denom = 1;
        while (n > 0) { denom *= 2; result += (n % 2) / denom; n = Math.floor(n / 2); }
        pontos.push((result + goldenOffset * phi) % 1);
    }
    const selected = new Set();
    for (let i = 0; i < pontos.length; i++) {
        if (selected.size >= needed) break;
        const idx = Math.floor(pontos[i] * range.length);
        if (idx >= 0 && idx < range.length) selected.add(range[idx]);
    }
    const restantes = range.filter(function(x) { return !selected.has(x); });
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

function gerarSoftmax(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max.apply(null, Object.values(freq).concat([1]));
    const T = 0.3 + Math.random() * 0.4;
    const expVal = range.map(function(n) { return Math.exp(((freq[n] || 0) / maxFreq) / T); });
    const somaExp = expVal.reduce(function(a, b) { return a + b; }, 0);
    const selected = new Set();
    while (selected.size < needed) {
        let r = Math.random() * somaExp;
        let acc = 0;
        for (let i = 0; i < range.length; i++) {
            acc += expVal[i];
            if (r <= acc) { selected.add(range[i]); break; }
        }
    }
    return premiumUniqueSorted([...selected]);
}

function gerarVariancia(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const freqEsperada = (stats.total || 1) * (needed / range.length);
    const scored = range.map(function(n) { return { num: n, desvio: Math.abs((freq[n] || 0) - freqEsperada) }; });
    scored.sort(function(a, b) { return b.desvio - a.desvio; });
    const selected = new Set();
    scored.slice(0, Math.floor(needed * 2)).sort(function() { return Math.random() - 0.5; }).forEach(function(item) {
        if (selected.size < needed) selected.add(item.num);
    });
    const restantes = range.filter(function(x) { return !selected.has(x); });
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

function gerarMarkov(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const lambda = range.length / needed;
    let atual = range[premiumRandomInt(0, range.length - 1)];
    const selected = new Set([atual]);
    while (selected.size < needed) {
        const pesos = range.map(function(j) {
            if (selected.has(j)) return 0;
            const dist = Math.abs(j - atual);
            return ((freq[j] || 0) + 1) * Math.exp(-dist / lambda);
        });
        const somaPesos = pesos.reduce(function(a, b) { return a + b; }, 0);
        if (somaPesos === 0) break;
        let r = Math.random() * somaPesos;
        let acc = 0;
        for (let i = 0; i < range.length; i++) {
            acc += pesos[i];
            if (r <= acc && !selected.has(range[i])) {
                atual = range[i]; selected.add(atual); break;
            }
        }
    }
    const restantes = range.filter(function(x) { return !selected.has(x); });
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

function gerarSwarm(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const particulas = [];
    for (let p = 0; p < 20; p++) {
        const jogo = new Set();
        while (jogo.size < needed) jogo.add(range[premiumRandomInt(0, range.length - 1)]);
        particulas.push([...jogo]);
    }
    function fitness(jogo) { return jogo.reduce(function(acc, n) { return acc + (freq[n] || 0); }, 0); }
    for (let iter = 0; iter < 50; iter++) {
        particulas.forEach(function(jogo) {
            const idx = premiumRandomInt(0, jogo.length - 1);
            const novo = range[premiumRandomInt(0, range.length - 1)];
            const copia = [...jogo];
            copia[idx] = novo;
            if (new Set(copia).size === copia.length && fitness(copia) > fitness(jogo)) jogo[idx] = novo;
        });
    }
    let melhor = particulas[0];
    particulas.forEach(function(p) { if (fitness(p) > fitness(melhor)) melhor = p; });
    return premiumUniqueSorted(melhor);
}

function gerarLorenz(cfg) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const sigma = 10, rho = 28, beta = 8 / 3;
    let x = 0.1, y = 0, z = 0;
    const dt = 0.01;
    const selected = new Set();
    let iter = 0;
    while (selected.size < needed && iter < 10000) {
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;
        x += dx * dt; y += dy * dt; z += dz * dt;
        selected.add(range[Math.floor(Math.abs(x + y + z)) % range.length]);
        iter++;
    }
    const restantes = range.filter(function(v) { return !selected.has(v); });
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

function gerarQuentesPremium(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max.apply(null, Object.values(freq).concat([1]));
    const pesos = range.map(function(n) { return Math.pow((freq[n] || 0) / maxFreq, 2); });
    const somaPesos = pesos.reduce(function(a, b) { return a + b; }, 0) || 1;
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

function gerarHarmonico(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const delay = stats.delay || {};
    const maxFreq = Math.max.apply(null, Object.values(freq).concat([1]));
    const maxDelay = Math.max.apply(null, Object.values(delay).concat([1]));
    const scored = range.map(function(n) {
        const f = (freq[n] || 0) / maxFreq;
        const d = (delay[n] || 0) / maxDelay;
        return { num: n, score: 0.6 * f + 0.4 * d };
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    const selected = new Set();
    scored.slice(0, Math.floor(needed * 2)).sort(function() { return Math.random() - 0.5; }).forEach(function(item) {
        if (selected.size < needed) selected.add(item.num);
    });
    const restantes = range.filter(function(x) { return !selected.has(x); });
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

function gerarJogoPremium(cfg, stats, idx) {
    switch (idx) {
        case 0: return gerarBoltzmann(cfg, stats);
        case 1: return gerarRegressao(cfg, stats);
        case 2: return gerarMonteCarlo(cfg, stats);
        case 3: return gerarClusters(cfg, stats);
        case 4: return gerarSequenciaDourada(cfg);
        case 5: return gerarSoftmax(cfg, stats);
        case 6: return gerarVariancia(cfg, stats);
        case 7: return gerarMarkov(cfg, stats);
        case 8: return gerarSwarm(cfg, stats);
        case 9: return gerarLorenz(cfg);
        case 10: return gerarQuentesPremium(cfg, stats);
        case 11: return gerarHarmonico(cfg, stats);
        default: return gerarBoltzmann(cfg, stats);
    }
}

// ============================================================
// ✅ NOVO — CÁLCULO DE ERRO DE FILTROS
// ============================================================
function _calcFilterError(jogo, alvoPares, alvoImpares, alvoPrimos) {
    const total = jogo.length;
    let pares = 0, primos = 0;
    for (const n of jogo) {
        if (n % 2 === 0) pares++;
        if (isPremiumPrime(n)) primos++;
    }
    const impares = total - pares;
    let err = 0;
    if (alvoPares != null) err += Math.abs(pares - alvoPares);
    if (alvoImpares != null) err += Math.abs(impares - alvoImpares);
    if (alvoPrimos != null) err += Math.abs(primos - alvoPrimos);
    return err;
}

// ============================================================
// ✅ NOVO — AJUSTE POR SWAP (garante respeitar os filtros)
// ============================================================
function ajustarParaFiltros(jogo, cfg, alvoPares, alvoImpares, alvoPrimos) {
    if (alvoPares == null && alvoImpares == null && alvoPrimos == null) {
        return [...jogo].sort((a, b) => a - b);
    }

    const range = premiumRange(cfg);
    let atual = [...jogo];
    let errAtual = _calcFilterError(atual, alvoPares, alvoImpares, alvoPrimos);
    if (errAtual === 0) return atual.sort((a, b) => a - b);

    const inGame = new Set(atual);
    const fora = range.filter(n => !inGame.has(n));

    const MAX_ITER = 500;
    for (let iter = 0; iter < MAX_ITER && errAtual > 0; iter++) {
        let melhorErr = errAtual;
        let melhorIdx = -1;
        let melhorVal = null;

        for (let i = 0; i < atual.length; i++) {
            const valorAtual = atual[i];
            for (let j = 0; j < fora.length; j++) {
                const v = fora[j];
                if (v === valorAtual) continue;
                const teste = [...atual];
                teste[i] = v;
                const err = _calcFilterError(teste, alvoPares, alvoImpares, alvoPrimos);
                if (err < melhorErr) {
                    melhorErr = err;
                    melhorIdx = i;
                    melhorVal = v;
                    if (err === 0) break;
                }
            }
            if (melhorErr === 0) break;
        }

        if (melhorIdx === -1) break; // não dá mais pra melhorar

        const valorAntigo = atual[melhorIdx];
        atual[melhorIdx] = melhorVal;
        const pos = fora.indexOf(melhorVal);
        if (pos !== -1) fora.splice(pos, 1);
        fora.push(valorAntigo);
        errAtual = melhorErr;
    }

    return atual.sort((a, b) => a - b);
}

// ============================================================
// ✅ NOVO — VALIDAÇÃO DE FILTROS IMPOSSÍVEIS
// ============================================================
function validarFiltrosPossiveis(cfg, alvoPares, alvoImpares, alvoPrimos) {
    const range = premiumRange(cfg);
    const total = cfg.defaultNumbersToSelect;

    const paresRange = range.filter(n => n % 2 === 0);
    const imparesRange = range.filter(n => n % 2 !== 0);
    const primosRange = range.filter(isPremiumPrime);
    const primosParesRange = primosRange.filter(n => n % 2 === 0);
    const primosImparesRange = primosRange.filter(n => n % 2 !== 0);

    if (alvoPares != null && alvoPares > paresRange.length) {
        return `Você pediu ${alvoPares} pares, mas só existem ${paresRange.length} pares no universo da ${_lotteryAtualP} (${range.length} números).`;
    }
    if (alvoImpares != null && alvoImpares > imparesRange.length) {
        return `Você pediu ${alvoImpares} ímpares, mas só existem ${imparesRange.length} ímpares no universo da ${_lotteryAtualP} (${range.length} números).`;
    }
    if (alvoPrimos != null && alvoPrimos > primosRange.length) {
        return `Você pediu ${alvoPrimos} primos, mas só existem ${primosRange.length} primos no universo da ${_lotteryAtualP} (${range.length} números).`;
    }

    if (alvoPares != null && alvoImpares != null && (alvoPares + alvoImpares) !== total) {
        return `Pares (${alvoPares}) + Ímpares (${alvoImpares}) = ${alvoPares + alvoImpares}. Deve ser exatamente ${total} (total de dezenas).`;
    }

    // Verifica compatibilidade primos × pares/ímpares
    if (alvoPrimos != null) {
        const targetPares = alvoPares != null ? alvoPares : (alvoImpares != null ? total - alvoImpares : null);
        const targetImpares = alvoImpares != null ? alvoImpares : (alvoPares != null ? total - alvoPares : null);

        if (targetImpares != null) {
            const minPrimosImpares = Math.max(0, alvoPrimos - primosParesRange.length);
            if (minPrimosImpares > targetImpares) {
                return `Combinação impossível: você pediu ${alvoPrimos} primos e ${targetImpares} ímpares, mas no máximo ${primosParesRange.length} primo(s) podem ser par(es) (o 2). Seriam necessários ${minPrimosImpares} primos ímpares, mas só há ${targetImpares} vagas ímpares.`;
            }
        }
        if (targetPares != null) {
            const minPrimosPares = Math.max(0, alvoPrimos - primosImparesRange.length);
            if (minPrimosPares > targetPares) {
                return `Combinação impossível: você pediu ${alvoPrimos} primos e ${targetPares} pares, mas no máximo ${primosImparesRange.length} primo(s) podem ser ímpar(es). Seriam necessários ${minPrimosPares} primos pares, mas só há ${targetPares} vagas pares.`;
            }
        }
    }

    return null; // OK
}

// ============================================================
// VALIDAÇÃO LEGADA (mantida para compatibilidade)
// ============================================================
function validaFiltrosP(game, even, odd, prime) {
    if (even != null && contarPares(game) !== even) return false;
    if (odd != null && (game.length - contarPares(game)) !== odd) return false;
    if (prime != null && contarPrimos(game) !== prime) return false;
    return true;
}

// ============================================================
// ✅ NOVO — AUTO-SYNC PARES ↔ ÍMPARES
// ============================================================
function setupFilterAutoSync() {
    const evenInput = document.getElementById('filterEven');
    const oddInput = document.getElementById('filterOdd');
    const totalInput = document.getElementById('numbersPerGame');
    if (!evenInput || !oddInput) return;

    let lastEdited = 'even';

    evenInput.addEventListener('input', () => {
        lastEdited = 'even';
        const total = parseInt(totalInput?.value, 10) || 15;
        const even = parseInt(evenInput.value, 10);
        if (!isNaN(even) && even >= 0 && even <= total) {
            oddInput.value = total - even;
        }
    });

    oddInput.addEventListener('input', () => {
        lastEdited = 'odd';
        const total = parseInt(totalInput?.value, 10) || 15;
        const odd = parseInt(oddInput.value, 10);
        if (!isNaN(odd) && odd >= 0 && odd <= total) {
            evenInput.value = total - odd;
        }
    });

    totalInput?.addEventListener('input', () => {
        const total = parseInt(totalInput.value, 10) || 15;
        if (lastEdited === 'odd') {
            const odd = parseInt(oddInput.value, 10);
            if (!isNaN(odd) && odd >= 0 && odd <= total) {
                evenInput.value = total - odd;
            } else {
                oddInput.value = '';
                evenInput.value = '';
            }
        } else {
            const even = parseInt(evenInput.value, 10);
            if (!isNaN(even) && even >= 0 && even <= total) {
                oddInput.value = total - even;
            } else {
                evenInput.value = '';
                oddInput.value = '';
            }
        }
    });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
    renderPremiumStrategiesGrid();
    setupFilterAutoSync();

    const select = document.getElementById('lotterySelect');
    if (select) {
        select.addEventListener('change', async function() {
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
    console.log('[' + _lotteryAtualP + '] ' + _historicoP.length + ' concursos. Soma média: ' + _statsP.avgSum.toFixed(1));

    const cfg = PREMIUM_LOTTERY_CONFIGS[_lotteryAtualP];
    const numInput = document.getElementById('numbersPerGame');
    if (numInput) {
        numInput.value = cfg.defaultNumbersToSelect;
        numInput.min = cfg.minNumbers;
        numInput.max = cfg.maxNumbers;
    }

    // Limpa filtros ao trocar de loteria
    const evenInput = document.getElementById('filterEven');
    const oddInput = document.getElementById('filterOdd');
    const primeInput = document.getElementById('filterPrime');
    if (evenInput) evenInput.value = '';
    if (oddInput) oddInput.value = '';
    if (primeInput) primeInput.value = '';

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Gerar Jogos';
    }
}

// ============================================================
// ✅ GERAR JOGOS — FILTROS RESPEITADOS DE VERDADE
// ============================================================
function gerarJogosPremium() {
    const cfg = Object.assign({}, PREMIUM_LOTTERY_CONFIGS[_lotteryAtualP]);
    cfg.name = _lotteryAtualP;

    const gameCount = parseInt(document.getElementById('gameCount').value) || 1;
    const numbersPerGame = parseInt(document.getElementById('numbersPerGame').value) || cfg.defaultNumbersToSelect;
    cfg.defaultNumbersToSelect = Math.max(cfg.minNumbers, Math.min(cfg.maxNumbers, numbersPerGame));

    // ✅ Leitura correta dos filtros (0 também é válido)
    const evenInput = document.getElementById('filterEven');
    const oddInput = document.getElementById('filterOdd');
    const primeInput = document.getElementById('filterPrime');

    const evenVal = evenInput ? evenInput.value.trim() : '';
    const oddVal = oddInput ? oddInput.value.trim() : '';
    const primeVal = primeInput ? primeInput.value.trim() : '';

    const even = evenVal === '' ? null : parseInt(evenVal, 10);
    const odd = oddVal === '' ? null : parseInt(oddVal, 10);
    const prime = primeVal === '' ? null : parseInt(primeVal, 10);

    // ✅ Valida se os filtros são possíveis
    const erroFiltros = validarFiltrosPossiveis(cfg, even, odd, prime);
    if (erroFiltros) {
        alert('⚠️ Filtros impossíveis\n\n' + erroFiltros);
        return;
    }

    _avisosUltimaGeracao = [];

    const jogos = [];
    const MAX_RETRIES_ESTRATEGIA = 300;

    for (let i = 0; i < gameCount; i++) {
        let jogo = null;
        let tentativas = 0;

        // Etapa 1: tentar gerar direto da estratégia
        while (tentativas < MAX_RETRIES_ESTRATEGIA) {
            tentativas++;
            const candidato = gerarJogoPremium(cfg, _statsP, _selectedStrategyP);
            if (validaFiltrosP(candidato, even, odd, prime) &&
                !jogos.some(j => JSON.stringify(j) === JSON.stringify(candidato))) {
                jogo = candidato;
                break;
            }
        }

        // Etapa 2: se falhou, ajusta por swap
        if (!jogo) {
            const base = gerarJogoPremium(cfg, _statsP, _selectedStrategyP);
            const ajustado = ajustarParaFiltros(base, cfg, even, odd, prime);
            const valido = validaFiltrosP(ajustado, even, odd, prime);

            if (!valido) {
                // Registra aviso
                const p = contarPares(ajustado);
                const pr = contarPrimos(ajustado);
                _avisosUltimaGeracao.push(
                    `Jogo ${i + 1}: pedido (P:${even ?? '-'} I:${odd ?? '-'} Pr:${prime ?? '-'}) — obtido (P:${p} I:${ajustado.length - p} Pr:${pr})`
                );
            }

            // Evita duplicados
            if (!jogos.some(j => JSON.stringify(j) === JSON.stringify(ajustado))) {
                jogo = ajustado;
            } else {
                // Força variação mínima
                const variacao = [...ajustado];
                const fora = premiumRange(cfg).filter(n => !variacao.includes(n));
                if (fora.length > 0) {
                    variacao[0] = fora[premiumRandomInt(0, fora.length - 1)];
                    jogo = variacao.sort((a, b) => a - b);
                } else {
                    jogo = ajustado;
                }
            }
        }

        jogos.push(jogo);
    }

    // Renderiza
    const area = document.getElementById('resultsArea');
    const lista = document.getElementById('gamesList');
    area.classList.add('visible');

    lista.innerHTML = jogos.map(function(jogo, i) {
        const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
        const pares = contarPares(jogo);
        const primos = contarPrimos(jogo);
        const nums = jogo.map(function(n) { return String(n).padStart(2, '0'); }).join(' - ');

        // Destaca se o jogo bate com os filtros
        const bateuPares = even == null || pares === even;
        const bateuImpares = odd == null || (jogo.length - pares) === odd;
        const bateuPrimos = prime == null || primos === prime;
        const bateuTudo = bateuPares && bateuImpares && bateuPrimos;

        const corAviso = bateuTudo ? '#059669' : '#dc2626';
        const iconeAviso = bateuTudo ? '✅' : '⚠️';

        return '<div class="game-row">' +
            '<div>' +
                '<span class="game-numbers">Jogo ' + (i + 1) + ': ' + nums + '</span>' +
                '<div style="font-size:0.75rem;color:#64748b;margin-top:4px;">' +
                    'Soma: <strong>' + soma + '</strong> · Pares: <strong>' + pares + '</strong> · Ímpares: <strong>' + (jogo.length - pares) + '</strong> · Primos: <strong>' + primos + '</strong> ' +
                    '<span style="color:' + corAviso + ';font-weight:700;">' + iconeAviso + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
                '<button onclick="compartilharWhatsAppP([' + jogo.join(',') + '], ' + (i + 1) + ')" style="background:#25D366;color:white;border:none;padding:8px 14px;border-radius:40px;font-weight:700;cursor:pointer;font-size:0.8rem;"><i class="fa-brands fa-whatsapp"></i> Enviar</button>' +
                '<button onclick="imprimirJogoP([' + jogo.join(',') + '], ' + (i + 1) + ')" style="background:#dc2626;color:white;border:none;padding:8px 14px;border-radius:40px;font-weight:700;cursor:pointer;font-size:0.8rem;"><i class="fa-solid fa-file-pdf"></i> PDF</button>' +
                '<button class="btn-save" onclick="salvarJogoPremium([' + jogo.join(',') + '], ' + (i + 1) + ')"><i class="fa-solid fa-bookmark"></i> Salvar</button>' +
            '</div>' +
        '</div>';
    }).join('');

    // Aviso final se algum jogo não bateu 100%
    if (_avisosUltimaGeracao.length > 0) {
        console.warn('[Filtros] Avisos:\n' + _avisosUltimaGeracao.join('\n'));
        setTimeout(() => {
            alert('⚠️ Atenção\n\nAlguns jogos não conseguiram atender 100% dos filtros pedidos (limitação matemática da ' + _lotteryAtualP + '):\n\n' + _avisosUltimaGeracao.slice(0, 5).join('\n') + (_avisosUltimaGeracao.length > 5 ? '\n...' : ''));
        }, 100);
    }

    window._ultimosJogosP = jogos;
    window._ultimaConfigP = cfg;
}

// ============================================================
// WHATSAPP (inalterado)
// ============================================================
function compartilharWhatsAppP(jogo, numero) {
    const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
    const pares = contarPares(jogo);
    const primos = contarPrimos(jogo);
    const nums = jogo.map(function(n) { return String(n).padStart(2, '0'); }).join(' - ');
    const est = PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].name : 'Premium';
    const emoji = PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].emoji : '👑';
    const msg = emoji + ' *Meu jogo da ' + _lotteryAtualP + '* (Premium)\n\n📋 Estratégia: *' + est + '*\n🎯 Jogo ' + numero + ': *' + nums + '*\n\n📊 Soma: ' + soma + '\nPares: ' + pares + ' | Ímpares: ' + (jogo.length - pares) + '\nPrimos: ' + primos + '\n\n🍀 geradordejogosloterias.com.br';
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

function compartilharTodosWhatsAppP() {
    const jogos = window._ultimosJogosP || [];
    if (jogos.length === 0) { alert('Nenhum jogo para compartilhar.'); return; }
    const est = PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].name : 'Premium';
    const emoji = PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].emoji : '👑';
    let msg = emoji + ' *Meus ' + jogos.length + ' jogos da ' + _lotteryAtualP + '* (Premium)\n📋 ' + est + '\n\n';
    jogos.forEach(function(jogo, i) {
        msg += '🎯 *Jogo ' + (i + 1) + ':* ' + jogo.map(function(n) { return String(n).padStart(2, '0'); }).join(' - ') + '\n';
    });
    msg += '\n🍀 geradordejogosloterias.com.br';
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

// ============================================================
// PDF (inalterado)
// ============================================================
function imprimirJogoP(jogo, numero) {
    const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
    const pares = contarPares(jogo);
    const primos = contarPrimos(jogo);
    const nums = jogo.map(function(n) { return String(n).padStart(2, '0'); }).join(' - ');
    const est = PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].name : 'Premium';
    const emoji = PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].emoji : '👑';
    const dataHora = new Date().toLocaleString('pt-BR');

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Jogo ' + numero + '</title><style>' +
        'body { font-family: Arial, sans-serif; padding: 30px; }' +
        '.header { text-align: center; border-bottom: 3px solid #7b1fa2; padding-bottom: 15px; margin-bottom: 25px; }' +
        '.header h1 { color: #7b1fa2; }' +
        '.jogo { border: 2px solid #7b1fa2; border-radius: 12px; padding: 20px; background: #faf5ff; }' +
        '.numeros { font-size: 20px; font-weight: bold; text-align: center; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }' +
        '.estatisticas { display: flex; justify-content: space-around; }' +
        '.estatistica { background: white; padding: 8px; border-radius: 8px; text-align: center; flex: 1; }' +
        '.estatistica .valor { font-size: 18px; font-weight: bold; color: #7b1fa2; }' +
        '.footer { text-align: center; margin-top: 25px; color: #94a3b8; }' +
        '</style></head><body>' +
        '<div class="header"><h1>👑 Gerador Premium</h1><p>' + emoji + ' ' + _lotteryAtualP + ' — ' + est + '</p><p>' + dataHora + '</p></div>' +
        '<div class="jogo"><h3 style="text-align:center;color:#7b1fa2;">JOGO ' + numero + '</h3>' +
        '<div class="numeros">' + nums + '</div>' +
        '<div class="estatisticas">' +
        '<div class="estatistica"><div>Soma</div><div class="valor">' + soma + '</div></div>' +
        '<div class="estatistica"><div>Pares</div><div class="valor">' + pares + '</div></div>' +
        '<div class="estatistica"><div>Ímpares</div><div class="valor">' + (jogo.length - pares) + '</div></div>' +
        '<div class="estatistica"><div>Primos</div><div class="valor">' + primos + '</div></div>' +
        '</div></div>' +
        '<div class="footer"><strong>🍀 geradordejogosloterias.com.br</strong></div>' +
        '</body></html>';

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(function() { w.print(); }, 500);
}

function imprimirTodosP() {
    const jogos = window._ultimosJogosP || [];
    if (jogos.length === 0) { alert('Nenhum jogo para imprimir.'); return; }
    const est = PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].name : 'Premium';
    const emoji = PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].emoji : '👑';
    const dataHora = new Date().toLocaleString('pt-BR');
    const totalJogos = jogos.length;
    const somaTotal = jogos.reduce(function(acc, j) { return acc + j.reduce(function(a, b) { return a + b; }, 0); }, 0);
    const somaMedia = (somaTotal / totalJogos).toFixed(1);

    let jogosHtml = '';
    jogos.forEach(function(jogo, i) {
        const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
        const pares = contarPares(jogo);
        const primos = contarPrimos(jogo);
        const nums = jogo.map(function(n) { return String(n).padStart(2, '0'); }).join(' - ');
        jogosHtml += '<div class="jogo-card"><div class="jogo-header"><span class="jogo-num">JOGO ' + (i + 1) + '</span><span class="jogo-meta">Soma: ' + soma + ' | P: ' + pares + ' | I: ' + (jogo.length - pares) + ' | Pr: ' + primos + '</span></div><div class="numeros">' + nums + '</div></div>';
    });

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Meus Jogos Premium</title><style>' +
        '@page { margin: 10mm; }' +
        'body { font-family: Arial, sans-serif; padding: 15px; }' +
        '.header { text-align: center; border-bottom: 3px solid #7b1fa2; padding-bottom: 12px; margin-bottom: 18px; }' +
        '.header h1 { color: #7b1fa2; font-size: 20px; }' +
        '.stats-gerais { display: flex; justify-content: center; gap: 25px; margin: 12px 0 18px 0; padding: 10px; background: #f3e8ff; border-radius: 8px; font-size: 12px; }' +
        '.stats-gerais strong { color: #7b1fa2; font-size: 14px; }' +
        '.jogos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }' +
        '.jogo-card { border: 1.5px solid #7b1fa2; border-radius: 8px; padding: 10px 12px; background: #faf5ff; page-break-inside: avoid; }' +
        '.jogo-header { display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #d8b4fe; }' +
        '.jogo-num { color: #7b1fa2; font-size: 12px; font-weight: bold; }' +
        '.jogo-meta { font-size: 10px; color: #64748b; }' +
        '.numeros { font-size: 14px; font-weight: bold; text-align: center; }' +
        '.footer { text-align: center; margin-top: 20px; padding-top: 12px; border-top: 2px dashed #e2e8f0; color: #94a3b8; font-size: 10px; }' +
        '</style></head><body>' +
        '<div class="header"><h1>👑 Gerador Premium</h1><div>' + emoji + ' ' + _lotteryAtualP + ' — ' + est + '</div><div>' + dataHora + '</div></div>' +
        '<div class="stats-gerais"><span><strong>' + totalJogos + '</strong> jogo(s)</span><span>Soma média: <strong>' + somaMedia + '</strong></span></div>' +
        '<div class="jogos-grid">' + jogosHtml + '</div>' +
        '<div class="footer"><strong>🍀 geradordejogosloterias.com.br</strong></div>' +
        '</body></html>';

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(function() { w.print(); }, 500);
}

// ============================================================
// SALVAR (inalterado)
// ============================================================
function salvarJogoPremium(jogo, numero) {
    const ultimo = _statsP && _statsP.ordenadoDesc ? _statsP.ordenadoDesc[0] : null;
    let acertos = 0, numerosSorteados = [], concursoNum = '--', dataConcurso = '--';
    if (ultimo) {
        numerosSorteados = (ultimo.dezenas || ultimo.listaDezenas || []).map(function(n) { return parseInt(n, 10); });
        concursoNum = ultimo.concurso || ultimo.numero || '--';
        dataConcurso = ultimo.data || ultimo.dataApuracao || '--';
        acertos = jogo.filter(function(n) { return numerosSorteados.includes(n); }).length;
    }
    const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
    const pares = contarPares(jogo);
    const primos = contarPrimos(jogo);

    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
    salvos.push({
        loteria: _lotteryAtualP, numeros: jogo, soma: soma, pares: pares, primos: primos,
        acertosUltimoConcurso: acertos, ultimoConcurso: concursoNum, ultimaData: dataConcurso,
        data: new Date().toISOString(),
        origem: 'Premium: ' + (PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].name : 'Estrategia')
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));

    alert('✅ Jogo salvo!\n\nNúmeros: ' + jogo.join(' - ') + '\nSoma: ' + soma + '\nPares: ' + pares + ' | Ímpares: ' + (jogo.length - pares) + ' | Primos: ' + primos + '\n\n📊 Vs. #' + concursoNum + ':\nSorteados: ' + numerosSorteados.join(' - ') + '\n🎯 Acertos: ' + acertos);
}

function salvarTodosPremium() {
    const jogos = window._ultimosJogosP || [];
    if (jogos.length === 0) { alert('Nenhum jogo para salvar.'); return; }

    const ultimo = _statsP && _statsP.ordenadoDesc ? _statsP.ordenadoDesc[0] : null;
    const numerosSorteados = ultimo ? (ultimo.dezenas || ultimo.listaDezenas || []).map(function(n) { return parseInt(n, 10); }) : [];
    const concursoNum = ultimo ? (ultimo.concurso || ultimo.numero || '--') : '--';

    let totalAcertos = 0, melhor = 0;
    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');

    jogos.forEach(function(jogo) {
        const acertos = numerosSorteados.length > 0 ? jogo.filter(function(n) { return numerosSorteados.includes(n); }).length : 0;
        totalAcertos += acertos;
        melhor = Math.max(melhor, acertos);
        const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
        const pares = contarPares(jogo);
        const primos = contarPrimos(jogo);
        salvos.push({
            loteria: _lotteryAtualP, numeros: jogo, soma: soma, pares: pares, primos: primos,
            acertosUltimoConcurso: acertos, ultimoConcurso: concursoNum,
            data: new Date().toISOString(),
            origem: 'Premium: ' + (PREMIUM_STRATEGIES[_selectedStrategyP] ? PREMIUM_STRATEGIES[_selectedStrategyP].name : 'Estrategia')
        });
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));

    const media = (totalAcertos / jogos.length).toFixed(1);
    alert('✅ ' + jogos.length + ' jogo(s) salvo(s)!\n\n📊 Vs. #' + concursoNum + ':\nSorteados: ' + numerosSorteados.join(' - ') + '\n🎯 Média: ' + media + '\n🏆 Melhor: ' + melhor);
}

console.log("[estrategias.js] TUDO carregado — versão corrigida");
