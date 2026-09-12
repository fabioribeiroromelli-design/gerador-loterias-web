/* ============================================================
   estrategias.js — 12 PREMIUM + WhatsApp + PDF + Salvar
   ============================================================ */

console.log("[estrategias.js] Carregado");

let _historicoP = null;
let _statsP = null;
let _lotteryAtualP = 'Lotofácil';
let _selectedStrategyP = 0;

// ============================================================
// AS 12 ESTRATÉGIAS PREMIUM
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
// UTILITÁRIOS
// ============================================================
function premiumRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function premiumUniqueSorted(arr) { return [...new Set(arr)].sort((a, b) => a - b); }
function premiumSum(arr) { return arr.reduce((a, b) => a + b, 0); }
function premiumRange(cfg) {
    return cfg.startNumber === 0
        ? Array.from({ length: cfg.maxNumber + 1 }, (_, i) => i)
        : Array.from({ length: cfg.maxNumber }, (_, i) => i + 1);
}
function premiumEven(nums) { return nums.filter(n => n % 2 === 0).length; }
function premiumPrime(nums) { return nums.filter(n => isPremiumPrime(n)).length; }

// ============================================================
// 1. BOLTZMANN PREMIUM
// ============================================================
function gerarBoltzmann(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max(...Object.values(freq), 1);
    const T = 0.5;
    const pesos = range.map(n => Math.exp(((freq[n] || 0) / maxFreq) / T));
    const somaPesos = pesos.reduce((a, b) => a + b, 0);
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
// 2. REGRESSÃO DE TENDÊNCIA
// ============================================================
function gerarRegressao(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const n = range.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    range.forEach(x => {
        const y = freq[x] || 0;
        sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
    });
    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
    const a = (sumY - b * sumX) / n;
    const scored = range.map(x => ({ num: x, residuo: (freq[x] || 0) - (a + b * x) }))
        .sort((a, b) => b.residuo - a.residuo);
    const pool = scored.slice(0, Math.max(needed * 3, Math.floor(range.length * 0.3)));
    const selected = new Set();
    pool.sort(() => Math.random() - 0.5).forEach(item => {
        if (selected.size < needed) selected.add(item.num);
    });
    const restantes = range.filter(x => !selected.has(x)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 3. MONTE CARLO PONDERADO
// ============================================================
function gerarMonteCarlo(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const pesos = range.map(n => (freq[n] || 0) + 1);
    const somaPesos = pesos.reduce((a, b) => a + b, 0);
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
// ============================================================
function gerarClusters(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
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
// 5. SEQUÊNCIA DOURADA
// ============================================================
function gerarSequenciaDourada(cfg) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const phi = 1.618033988749895;
    const goldenOffset = Math.random();
    const pontos = [];
    for (let i = 0; i < 200; i++) {
        const vdc = vanDerCorput(i + 1, 2);
        pontos.push((vdc + goldenOffset * phi) % 1);
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
// ============================================================
function gerarSoftmax(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max(...Object.values(freq), 1);
    const T = 0.3 + Math.random() * 0.4;
    const expValores = range.map(n => Math.exp(((freq[n] || 0) / maxFreq) / T));
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
// ============================================================
function gerarVariancia(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const freqEsperada = (stats.total || 1) * (needed / range.length);
    const scored = range.map(n => ({ num: n, desvio: Math.abs((freq[n] || 0) - freqEsperada) }))
        .sort((a, b) => b.desvio - a.desvio);
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
// ============================================================
function gerarMarkov(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const lambda = range.length / needed;
    let atual = range[premiumRandomInt(0, range.length - 1)];
    const selected = new Set([atual]);
    while (selected.size < needed) {
        const pesos = range.map(j => {
            if (selected.has(j)) return 0;
            const dist = Math.abs(j - atual);
            return ((freq[j] || 0) + 1) * Math.exp(-dist / lambda);
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
// ============================================================
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
    const fitness = (jogo) => jogo.reduce((acc, n) => acc + (freq[n] || 0), 0);
    for (let iter = 0; iter < 50; iter++) {
        particulas.forEach(jogo => {
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
        const val = Math.abs(x + y + z);
        selected.add(range[Math.floor(val) % range.length]);
        iter++;
    }
    const restantes = range.filter(v => !selected.has(v)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return premiumUniqueSorted([...selected]);
}

// ============================================================
// 11. NÚMEROS QUENTES PREMIUM
// ============================================================
function gerarQuentesPremium(cfg, stats) {
    const range = premiumRange(cfg);
    const needed = cfg.defaultNumbersToSelect;
    const freq = stats.freq || {};
    const maxFreq = Math.max(...Object.values(freq), 1);
    const pesos = range.map(n => Math.pow((freq[n] || 0) / maxFreq, 2));
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

function gerarJogoPremium(cfg, stats, idx) {
    switch (idx) {
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

function validaFiltrosP(game, even, odd, prime) {
    if (even != null && premiumEven(game) !== even) return false;
    if (odd != null && (game.length - premiumEven(game)) !== odd) return false;
    if (prime != null && premiumPrime(game) !== prime) return false;
    return true;
}

// ============================================================
// INICIALIZAÇÃO
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
    console.log(`[${_lotteryAtualP}] ${_historicoP.length} concursos carregados. Soma média: ${_statsP.avgSum.toFixed(1)}`);
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
    for (let i = 0; i < gameCount; i++) {
        let jogo = null;
        for (let t = 0; t < 500; t++) {
            const candidato = gerarJogoPremium(cfg, _statsP, _selectedStrategyP);
            if (!jogos.some(j => JSON.stringify(j) === JSON.stringify(candidato)) && validaFiltrosP(candidato, even, odd, prime)) {
                jogo = candidato;
                break;
            }
        }
        if (!jogo) jogo = gerarJogoPremium(cfg, _statsP, _selectedStrategyP);
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
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <button onclick="compartilharWhatsAppP([${jogo.join(',')}], ${i+1})" style="background:#25D366;color:white;border:none;padding:8px 14px;border-radius:40px;font-weight:700;cursor:pointer;font-size:0.8rem;">
                    <i class="fa-brands fa-whatsapp"></i> Enviar
                </button>
                <button onclick="imprimirJogoP([${jogo.join(',')}], ${i+1})" style="background:#dc2626;color:white;border:none;padding:8px 14px;border-radius:40px;font-weight:700;cursor:pointer;font-size:0.8rem;">
                    <i class="fa-solid fa-file-pdf"></i> PDF
                </button>
                <button class="btn-save" onclick="salvarJogoPremium([${jogo.join(',')}], ${i+1})">
                    <i class="fa-solid fa-bookmark"></i> Salvar
                </button>
            </div>
        </div>`;
    }).join('');

    window._ultimosJogosP = jogos;
    window._ultimaConfigP = cfg;
}

// ============================================================
// WHATSAPP
// ============================================================
function compartilharWhatsAppP(jogo, numero) {
    const soma = jogo.reduce((a, b) => a + b, 0);
    const pares = jogo.filter(n => n % 2 === 0).length;
    const primos = jogo.filter(n => isPremiumPrime(n)).length;
    const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
    const estrategia = PREMIUM_STRATEGIES[_selectedStrategyP]?.name || 'Estratégia Premium';
    const emoji = PREMIUM_STRATEGIES[_selectedStrategyP]?.emoji || '👑';
    const mensagem = `${emoji} *Meu jogo da ${_lotteryAtualP}* (Premium)\n\n📋 Estratégia: *${estrategia}*\n🎯 Jogo ${numero}: *${nums}*\n\n📊 Estatísticas:\n• Soma: ${soma}\n• Pares: ${pares} | Ímpares: ${jogo.length - pares}\n• Primos: ${primos}\n\n🍀 Gerado em: https://geradordejogosloterias.com.br`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
}

function compartilharTodosWhatsAppP() {
    const jogos = window._ultimosJogosP || [];
    if (jogos.length === 0) { alert('Nenhum jogo para compartilhar.'); return; }
    const estrategia = PREMIUM_STRATEGIES[_selectedStrategyP]?.name || 'Estratégia Premium';
    const emoji = PREMIUM_STRATEGIES[_selectedStrategyP]?.emoji || '👑';
    let mensagem = `${emoji} *Meus ${jogos.length} jogos da ${_lotteryAtualP}* (Premium)\n📋 Estratégia: *${estrategia}*\n\n`;
    jogos.forEach((jogo, i) => {
        const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
        mensagem += `🎯 *Jogo ${i+1}:* ${nums}\n`;
    });
    const somaTotal = jogos.reduce((acc, j) => acc + j.reduce((a, b) => a + b, 0), 0);
    mensagem += `\n📊 *Soma média:* ${(somaTotal / jogos.length).toFixed(1)}\n\n🍀 https://geradordejogosloterias.com.br`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
}

// ============================================================
// IMPRIMIR PDF
// ============================================================
function imprimirJogoP(jogo, numero) {
    const soma = jogo.reduce((a, b) => a + b, 0);
    const pares = jogo.filter(n => n % 2 === 0).length;
    const primos = jogo.filter(n => isPremiumPrime(n)).length;
    const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
    const estrategia = PREMIUM_STRATEGIES[_selectedStrategyP]?.name || 'Estratégia Premium';
    const emoji = PREMIUM_STRATEGIES[_selectedStrategyP]?.emoji || '👑';
    const dataHora = new Date().toLocaleString('pt-BR');

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Jogo ' + numero + ' - ' + _lotteryAtualP + '</title><style>' +
        'body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }' +
        '.header { text-align: center; border-bottom: 3px solid #7b1fa2; padding-bottom: 15px; margin-bottom: 25px; }' +
        '.header h1 { color: #7b1fa2; }' +
        '.jogo { border: 2px solid #7b1fa2; border-radius: 12px; padding: 20px; background: #faf5ff; }' +
        '.numeros { font-size: 20px; font-weight: bold; text-align: center; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }' +
        '.estatisticas { display: flex; justify-content: space-around; gap: 10px; }' +
        '.estatistica { background: white; padding: 8px; border-radius: 8px; text-align: center; flex: 1; }' +
        '.estatistica .valor { font-size: 18px; font-weight: bold; color: #7b1fa2; }' +
        '.footer { text-align: center; margin-top: 25px; color: #94a3b8; }' +
        '</style></head><body>' +
        '<div class="header"><h1>👑 Gerador Premium</h1><p>' + emoji + ' ' + _lotteryAtualP + ' — ' + estrategia + '</p><p>' + dataHora + '</p></div>' +
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
    setTimeout(() => w.print(), 500);
}

function imprimirTodosP() {
    const jogos = window._ultimosJogosP || [];
    if (jogos.length === 0) { alert('Nenhum jogo para imprimir.'); return; }
    const estrategia = PREMIUM_STRATEGIES[_selectedStrategyP]?.name || 'Estratégia Premium';
    const emoji = PREMIUM_STRATEGIES[_selectedStrategyP]?.emoji || '👑';
    const dataHora = new Date().toLocaleString('pt-BR');
    const totalJogos = jogos.length;
    const somaTotal = jogos.reduce((acc, j) => acc + j.reduce((a, b) => a + b, 0), 0);
    const somaMedia = (somaTotal / totalJogos).toFixed(1);

    let jogosHtml = '';
    jogos.forEach((jogo, i) => {
        const soma = jogo.reduce((a, b) => a + b, 0);
        const pares = jogo.filter(n => n % 2 === 0).length;
        const primos = jogo.filter(n => isPremiumPrime(n)).length;
        const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
        jogosHtml += '<div class="jogo-card">' +
            '<div class="jogo-header">' +
                '<span class="jogo-num">JOGO ' + (i + 1) + '</span>' +
                '<span class="jogo-meta">Soma: ' + soma + ' | P: ' + pares + ' | I: ' + (jogo.length - pares) + ' | Pr: ' + primos + '</span>' +
            '</div>' +
            '<div class="numeros">' + nums + '</div>' +
        '</div>';
    });

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Meus Jogos Premium - ' + _lotteryAtualP + '</title><style>' +
        '@page { margin: 10mm; }' +
        'body { font-family: Arial, sans-serif; padding: 15px; color: #1e293b; }' +
        '.header { text-align: center; border-bottom: 3px solid #7b1fa2; padding-bottom: 12px; margin-bottom: 18px; }' +
        '.header h1 { color: #7b1fa2; font-size: 20px; }' +
        '.stats-gerais { display: flex; justify-content: center; gap: 25px; margin: 12px 0 18px 0; padding: 10px; background: #f3e8ff; border-radius: 8px; font-size: 12px; }' +
        '.stats-gerais strong { color: #7b1fa2; font-size: 14px; }' +
        '.jogos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }' +
        '.jogo-card { border: 1.5px solid #7b1fa2; border-radius: 8px; padding: 10px 12px; background: #faf5ff; page-break-inside: avoid; }' +
        '.jogo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #d8b4fe; }' +
        '.jogo-num { color: #7b1fa2; font-size: 12px; font-weight: bold; }' +
        '.jogo-meta { font-size: 10px; color: #64748b; font-family: Courier New, monospace; }' +
        '.numeros { font-size: 14px; font-weight: bold; text-align: center; letter-spacing: 1px; line-height: 1.8; }' +
        '.footer { text-align: center; margin-top: 20px; padding-top: 12px; border-top: 2px dashed #e2e8f0; color: #94a3b8; font-size: 10px; }' +
        '.footer strong { color: #7b1fa2; }' +
        '</style></head><body>' +
        '<div class="header">' +
            '<h1>👑 Gerador Premium - Loterias</h1>' +
            '<div>' + emoji + ' ' + _lotteryAtualP + ' — ' + estrategia + '</div>' +
            '<div>' + dataHora + '</div>' +
        '</div>' +
        '<div class="stats-gerais">' +
            '<span><strong>' + totalJogos + '</strong> jogo(s)</span>' +
            '<span>Soma média: <strong>' + somaMedia + '</strong></span>' +
            '<span>Números por jogo: <strong>' + jogos[0].length + '</strong></span>' +
        '</div>' +
        '<div class="jogos-grid">' + jogosHtml + '</div>' +
        '<div class="footer"><strong>🍀 geradordejogosloterias.com.br</strong></div>' +
        '</body></html>';

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
}

// ============================================================
// SALVAR
// ============================================================
function salvarJogoPremium(jogo, numero) {
    const ultimo = _statsP?.ordenadoDesc?.[0];
    let acertos = 0, numerosSorteados = [], concursoNum = '--', dataConcurso = '--';
    if (ultimo) {
        numerosSorteados = (ultimo.dezenas || ultimo.listaDezenas || []).map(n => parseInt(n, 10));
        concursoNum = ultimo.concurso || ultimo.numero || '--';
        dataConcurso = ultimo.data || ultimo.dataApuracao || '--';
        acertos = jogo.filter(n => numerosSorteados.includes(n)).length;
    }
    const soma = jogo.reduce((a, b) => a + b, 0);
    const pares = jogo.filter(n => n % 2 === 0).length;
    const primos = jogo.filter(n => isPremiumPrime(n)).length;

    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
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
    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));

    alert(
        `✅ Jogo salvo!\n\n` +
        `Números: ${jogo.join(' - ')}\n` +
        `Soma: ${soma}\n` +
        `Pares: ${pares} | Ímpares: ${jogo.length - pares} | Primos: ${primos}\n\n` +
        `📊 Comparação com último concurso (#${concursoNum} - ${dataConcurso}):\n` +
        `Números sorteados: ${numerosSorteados.join(' - ')}\n` +
        `🎯 Você acertaria ${acertos} número(s)!`
    );
}

function salvarTodosPremium() {
    const jogos = window._ultimosJogosP || [];
    if (jogos.length === 0) { alert('Nenhum jogo para salvar.'); return; }

    const ultimo = _statsP?.ordenadoDesc?.[0];
    const numerosSorteados = ultimo ? (ultimo.dezenas || ultimo.listaDezenas || []).map(n => parseInt(n, 10)) : [];
    const concursoNum = ultimo?.concurso || ultimo?.numero || '--';
    const dataConcurso = ultimo?.data || ultimo?.dataApuracao || '--';

    let totalAcertos = 0, melhor = 0;
    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');

    jogos.forEach(jogo => {
        const acertos = numerosSorteados.length > 0 ? jogo.filter(n => numerosSorteados.includes(n)).length : 0;
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
        `📊 Análise geral vs. último concurso (#${concursoNum}):\n` +
        `Números sorteados: ${numerosSorteados.join(' - ')}\n` +
        `🎯 Média de acertos: ${media}\n` +
        `🏆 Melhor jogo: ${melhor} acerto(s)\n\n` +
        `Estratégia: ${PREMIUM_STRATEGIES[_selectedStrategyP].name}`
    );
}
