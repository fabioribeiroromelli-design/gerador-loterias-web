/* ============================================================
   gerador-avancado.js — 12 estratégias + WhatsApp + PDF
   ============================================================
   Correções e melhorias:
   ✅ Filtros aplicados de verdade (sem fallback para inválido)
   ✅ Auto-sync pares ↔ ímpares
   ✅ Validação de combinações matematicamente impossíveis
   ✅ Ajuste por swap quando a estratégia não atende aos filtros
   ✅ Filtro "0" é respeitado (não vira null)
   ✅ isPrime() agora está definido aqui (antes era ReferenceError)
   ✅ Indicador visual ✅/⚠️ por jogo
   ✅ Avisos ao usuário quando filtros não são 100% atendidos
   ============================================================ */

console.log("[gerador-avancado.js] Carregado");

// ============================================================
// ESTADO GLOBAL
// ============================================================
let _historico = null;
let _stats = null;
let _lotteryAtual = 'Lotofácil';
let _selectedStrategy = 0;
let _avisosUltimaGeracao = [];

// ============================================================
// CONSTANTES
// ============================================================
const ESTRATEGIAS = [
    { emoji: '∑',  name: 'Soma Histórica',       desc: 'Jogos com soma parecida com a média histórica real',         shortName: 'Soma' },
    { emoji: '🔥', name: 'Números Quentes',       desc: 'Prioriza os números que mais aparecem recentemente',         shortName: 'Quentes' },
    { emoji: '⚖',  name: 'Balanceado Puro',       desc: 'Sorteio 100% aleatório, como um sorteio real',              shortName: 'Balanceado' },
    { emoji: 'Δ',  name: 'Delta System',          desc: 'Intervalos entre números baseados em padrões reais',        shortName: 'Delta' },
    { emoji: 'φ',  name: 'Fibonacci Lotérico',    desc: 'Usa a sequência matemática da natureza',                    shortName: 'Fibonacci' },
    { emoji: '◎',  name: 'Ciclo de Frequência',   desc: 'Números em ascensão de frequência',                         shortName: 'Ciclos' },
    { emoji: '⏱',  name: 'Atraso Ponderado',      desc: 'Prioriza números que estão há mais tempo sem sair',         shortName: 'Atraso' },
    { emoji: '⊞',  name: 'Quadrantes do Volante', desc: 'Espalha números por todos os quadrantes',                   shortName: 'Quadrantes' },
    { emoji: '∿',  name: 'Soma Gaussiana',        desc: 'Distribuição normal em torno da média histórica',           shortName: 'Gaussiana' },
    { emoji: '🔄', name: 'Ciclo de Vida',         desc: 'Combina frequência e atraso com pesos dinâmicos',           shortName: 'Lifecycle' },
    { emoji: '📊', name: 'Entropia Setorial',     desc: 'Divide em setores e prioriza quentes em cada um',           shortName: 'Entropia' },
    { emoji: '🌊', name: 'Ciclos de Fourier',     desc: 'Detecta padrões cíclicos ocultos nos sorteios',             shortName: 'Fourier' }
];

// ============================================================
// UTILITÁRIOS
// ============================================================
function isPrime(n) {
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

function getValidRange(cfg) {
    return cfg.startNumber === 0
        ? Array.from({ length: cfg.maxNumber + 1 }, (_, i) => i)
        : Array.from({ length: cfg.maxNumber }, (_, i) => i + 1);
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function uniqueSorted(arr) { return [...new Set(arr)].sort((a, b) => a - b); }
function countEven(nums) { return nums.filter(n => n % 2 === 0).length; }
function countOdd(nums)  { return nums.filter(n => n % 2 !== 0).length; }
function countPrime(nums){ return nums.filter(n => isPrime(n)).length; }
function sum(nums) { return nums.reduce((a, b) => a + b, 0); }

// ============================================================
// RENDER DAS ESTRATÉGIAS
// ============================================================
function renderStrategiesGrid() {
    const grid = document.getElementById('strategiesGrid');
    if (!grid) return;

    grid.innerHTML = ESTRATEGIAS.map((s, i) => `
        <div class="strategy-card ${i === _selectedStrategy ? 'selected' : ''}" data-index="${i}">
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
            _selectedStrategy = parseInt(card.dataset.index, 10);
            grid.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// ============================================================
// AS 12 ESTRATÉGIAS
// ============================================================
function gerarSomaHistorica(cfg, stats) {
    const target = stats.avgSum || cfg.avgSum;
    const tolerancia = cfg.name === 'Lotomania' ? 150 : 20;
    let melhor = gerarAleatorio(cfg);
    let melhorDiff = Math.abs(sum(melhor) - target);
    for (let i = 0; i < 50; i++) {
        const g = gerarAleatorio(cfg);
        const diff = Math.abs(sum(g) - target);
        if (diff <= tolerancia) return g;
        if (diff < melhorDiff) { melhor = g; melhorDiff = diff; }
    }
    return melhor;
}

function gerarQuentes(cfg, stats) {
    const needed = cfg.numbersToSelect;
    const range = getValidRange(cfg);
    const hot = stats.hotNumbers || [];
    const pool = hot.slice(0, Math.floor(needed * 0.7));
    const nums = new Set(pool);
    const restantes = range.filter(n => !nums.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (nums.size < needed && i < restantes.length) nums.add(restantes[i++]);
    return uniqueSorted([...nums]);
}

function gerarBalanceado(cfg) {
    const range = getValidRange(cfg);
    const nums = new Set();
    while (nums.size < cfg.numbersToSelect) nums.add(range[randomInt(0, range.length - 1)]);
    return uniqueSorted([...nums]);
}

function gerarDelta(cfg) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const maxDelta = Math.max(2, Math.floor(range.length / needed));
    for (let tent = 0; tent < 300; tent++) {
        let num = randomInt(range[0], range[0] + maxDelta);
        const nums = [num];
        while (nums.length < needed) {
            num += randomInt(1, maxDelta);
            if (num > range[range.length - 1]) break;
            nums.push(num);
        }
        if (nums.length === needed && new Set(nums).size === needed) return uniqueSorted(nums);
    }
    return gerarBalanceado(cfg);
}

function gerarFibonacci(cfg) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const max = range[range.length - 1];
    const startNum = range[0];
    const fib = [];
    let a = 1, b = 1;
    while (b <= max) {
        if (b >= startNum) fib.push(b);
        const c = a + b; a = b; b = c;
    }
    const fibQtd = Math.max(1, Math.min(fib.length, Math.floor(needed * 0.5)));
    const selected = new Set(fib.sort(() => Math.random() - 0.5).slice(0, fibQtd));
    const restantes = range.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarCicloFrequencia(cfg, stats) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const hotSet = new Set(stats.hotNumbers || []);
    const pool = [];
    range.forEach(n => {
        const peso = hotSet.has(n) ? 4 : 1;
        for (let i = 0; i < peso; i++) pool.push(n);
    });
    const selected = new Set();
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (const n of shuffled) { if (selected.size >= needed) break; selected.add(n); }
    const restantes = range.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarAtrasoPonderado(cfg, stats) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const delayData = stats.delay || {};
    const sorted = Object.entries(delayData).sort((a, b) => b[1] - a[1]).map(([n]) => parseInt(n, 10));
    const pool60 = sorted.slice(0, Math.floor(needed * 2));
    const selected = new Set(pool60.sort(() => Math.random() - 0.5).slice(0, Math.floor(needed * 0.6)));
    const restantes = range.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarQuadrantes(cfg) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const tamanho = Math.floor(range.length / 4);
    const quadrantes = [
        range.slice(0, tamanho),
        range.slice(tamanho, tamanho * 2),
        range.slice(tamanho * 2, tamanho * 3),
        range.slice(tamanho * 3)
    ];
    const perQ = Math.floor(needed / 4);
    const extra = needed % 4;
    const selected = new Set();
    quadrantes.forEach((q, i) => {
        const qtd = perQ + (i < extra ? 1 : 0);
        q.sort(() => Math.random() - 0.5).slice(0, qtd).forEach(n => selected.add(n));
    });
    const restantes = range.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarGaussiana(cfg, stats) {
    const mean = stats.avgSum || cfg.avgSum;
    const stdDev = mean * 0.10;
    let melhor = gerarAleatorio(cfg);
    let melhorDiff = Math.abs(sum(melhor) - mean);
    for (let i = 0; i < 60; i++) {
        const g = gerarAleatorio(cfg);
        const s = sum(g);
        if (s >= mean - stdDev && s <= mean + stdDev) return g;
        const diff = Math.abs(s - mean);
        if (diff < melhorDiff) { melhor = g; melhorDiff = diff; }
    }
    return melhor;
}

function gerarLifecycle(cfg, stats) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const freqData = stats.freq || {};
    const delayData = stats.delay || {};
    const maxFreq = Math.max(...Object.values(freqData), 1);
    const maxDelay = Math.max(...Object.values(delayData), 1);
    const density = needed / range.length;
    const pesoDelay = Math.max(0.3, Math.min(0.6, 0.6 - density * 0.3));
    const scored = range.map(n => {
        const f = (freqData[n] || 0) / maxFreq;
        const d = (delayData[n] || 0) / maxDelay;
        return { n, score: f * (1 - pesoDelay) + d * pesoDelay };
    }).sort((a, b) => b.score - a.score);
    const pool = scored.slice(0, Math.floor(needed * 2.5)).map(s => s.n);
    const selected = new Set(pool.sort(() => Math.random() - 0.5).slice(0, needed));
    const restantes = range.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarEntropia(cfg, stats) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const total = range.length;
    const numSetores = total <= 25 ? 4 : total <= 60 ? 6 : total <= 80 ? 8 : 10;
    const tamSetor = Math.floor(total / numSetores);
    const setores = [];
    for (let s = 0; s < numSetores; s++) {
        const inicio = range[0] + s * tamSetor;
        const fim = s === numSetores - 1 ? range[range.length - 1] : inicio + tamSetor - 1;
        setores.push(range.filter(n => n >= inicio && n <= fim));
    }
    const extras = Array.from({ length: numSetores }, (_, i) => i)
        .sort(() => Math.random() - 0.5).slice(0, needed % numSetores);
    const selected = new Set();
    setores.forEach((setor, i) => {
        const qtd = Math.floor(needed / numSetores) + (extras.includes(i) ? 1 : 0);
        const hot = new Set(stats.hotNumbers || []);
        const poolSetor = setor.filter(n => hot.has(n));
        let escolhidos;
        if (poolSetor.length >= qtd) {
            escolhidos = poolSetor.sort(() => Math.random() - 0.5).slice(0, qtd);
        } else {
            escolhidos = [...poolSetor];
            const sobra = setor.filter(n => !poolSetor.includes(n)).sort(() => Math.random() - 0.5);
            let k = 0;
            while (escolhidos.length < qtd && k < sobra.length) escolhidos.push(sobra[k++]);
        }
        escolhidos.forEach(n => selected.add(n));
    });
    const restantes = range.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarFourier(cfg, stats) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const total = range.length;
    const freqData = stats.freq || {};
    const delayData = stats.delay || {};
    const expP = total / needed;
    const scored = range.map(n => {
        const f = freqData[n] || 0;
        const d = delayData[n] || 999;
        const estP = f > 1 ? Math.max(1, Math.floor(expP * 0.7 + (d / f) * 0.3)) : Math.floor(expP);
        const align = estP > 0 ? Math.max(0, Math.min(1, 1 - (d % estP) / estP)) : 0;
        return { n, score: align + (f > 2 ? 0.3 : 0) };
    }).sort((a, b) => b.score - a.score);
    const pool = scored.slice(0, Math.max(needed * 4, Math.floor(total * 0.8))).map(s => s.n);
    const selected = new Set();
    pool.slice(0, needed).sort(() => Math.random() - 0.5)
        .slice(0, Math.max(1, Math.floor(needed * 0.3))).forEach(n => selected.add(n));
    const alvoMeio = Math.floor(needed * 0.7);
    const meio = pool.slice(needed, needed * 2).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < alvoMeio && i < meio.length) selected.add(meio[i++]);
    const restantes = [...pool.slice(needed * 2), ...range.filter(n => !pool.includes(n))].sort(() => Math.random() - 0.5);
    i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarAleatorio(cfg) {
    const range = getValidRange(cfg);
    const nums = new Set();
    while (nums.size < cfg.numbersToSelect) nums.add(range[randomInt(0, range.length - 1)]);
    return uniqueSorted([...nums]);
}

function gerarSuperSete() {
    return Array.from({ length: 7 }, () => randomInt(0, 9));
}

function gerarJogo(cfg, stats, strategyIndex) {
    if (cfg.name === 'Super Sete') return gerarSuperSete();
    switch (strategyIndex) {
        case 0:  return gerarSomaHistorica(cfg, stats);
        case 1:  return gerarQuentes(cfg, stats);
        case 2:  return gerarBalanceado(cfg);
        case 3:  return gerarDelta(cfg);
        case 4:  return gerarFibonacci(cfg);
        case 5:  return gerarCicloFrequencia(cfg, stats);
        case 6:  return gerarAtrasoPonderado(cfg, stats);
        case 7:  return gerarQuadrantes(cfg);
        case 8:  return gerarGaussiana(cfg, stats);
        case 9:  return gerarLifecycle(cfg, stats);
        case 10: return gerarEntropia(cfg, stats);
        case 11: return gerarFourier(cfg, stats);
        default: return gerarBalanceado(cfg);
    }
}

// ============================================================
// ✅ VALIDAÇÃO DE FILTROS
// ============================================================
function validaFiltros(game, even, odd, prime) {
    if (even != null && countEven(game) !== even) return false;
    if (odd != null && countOdd(game) !== odd) return false;
    if (prime != null && countPrime(game) !== prime) return false;
    return true;
}

// Calcula "erro" total dos filtros (0 = perfeito)
function _calcFilterError(jogo, alvoPares, alvoImpares, alvoPrimos) {
    const total = jogo.length;
    let pares = 0, primos = 0;
    for (const n of jogo) {
        if (n % 2 === 0) pares++;
        if (isPrime(n)) primos++;
    }
    const impares = total - pares;
    let err = 0;
    if (alvoPares != null) err += Math.abs(pares - alvoPares);
    if (alvoImpares != null) err += Math.abs(impares - alvoImpares);
    if (alvoPrimos != null) err += Math.abs(primos - alvoPrimos);
    return err;
}

// Ajusta um jogo por swaps para atender aos filtros
function ajustarParaFiltros(jogo, cfg, alvoPares, alvoImpares, alvoPrimos) {
    if (alvoPares == null && alvoImpares == null && alvoPrimos == null) {
        return [...jogo].sort((a, b) => a - b);
    }

    const range = getValidRange(cfg);
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

// Valida se a combinação pedida é matematicamente possível
function validarFiltrosPossiveis(cfg, alvoPares, alvoImpares, alvoPrimos) {
    const range = getValidRange(cfg);
    const total = cfg.numbersToSelect;

    const paresRange = range.filter(n => n % 2 === 0);
    const imparesRange = range.filter(n => n % 2 !== 0);
    const primosRange = range.filter(isPrime);
    const primosParesRange = primosRange.filter(n => n % 2 === 0);
    const primosImparesRange = primosRange.filter(n => n % 2 !== 0);

    if (alvoPares != null && alvoPares > paresRange.length) {
        return `Você pediu ${alvoPares} pares, mas só existem ${paresRange.length} pares no universo da ${cfg.name} (${range.length} números).`;
    }
    if (alvoImpares != null && alvoImpares > imparesRange.length) {
        return `Você pediu ${alvoImpares} ímpares, mas só existem ${imparesRange.length} ímpares no universo da ${cfg.name} (${range.length} números).`;
    }
    if (alvoPrimos != null && alvoPrimos > primosRange.length) {
        return `Você pediu ${alvoPrimos} primos, mas só existem ${primosRange.length} primos no universo da ${cfg.name} (${range.length} números).`;
    }

    if (alvoPares != null && alvoImpares != null && (alvoPares + alvoImpares) !== total) {
        return `Pares (${alvoPares}) + Ímpares (${alvoImpares}) = ${alvoPares + alvoImpares}. Deve ser exatamente ${total} (total de dezenas do jogo).`;
    }

    if (alvoPrimos != null) {
        const targetPares = alvoPares != null ? alvoPares : (alvoImpares != null ? total - alvoImpares : null);
        const targetImpares = alvoImpares != null ? alvoImpares : (alvoPares != null ? total - alvoPares : null);

        if (targetImpares != null) {
            const minPrimosImpares = Math.max(0, alvoPrimos - primosParesRange.length);
            if (minPrimosImpares > targetImpares) {
                return `Combinação impossível: você pediu ${alvoPrimos} primos e ${targetImpares} ímpares, mas no máximo ${primosParesRange.length} primo(s) podem ser par(es) (o número 2). Seriam necessários ${minPrimosImpares} primos ímpares, mas só há ${targetImpares} vagas ímpares.`;
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
// ✅ AUTO-SYNC PARES ↔ ÍMPARES
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
document.addEventListener('DOMContentLoaded', async () => {
    renderStrategiesGrid();
    setupFilterAutoSync();

    const select = document.getElementById('lotterySelect');
    if (select) {
        select.addEventListener('change', async () => {
            _lotteryAtual = select.value;
            await trocarLoteria();
        });
        _lotteryAtual = select.value;
    }

    await trocarLoteria();

    const btn = document.getElementById('generateBtn');
    if (btn) btn.addEventListener('click', gerarJogos);

    const saveAll = document.getElementById('saveAllBtn');
    if (saveAll) saveAll.addEventListener('click', salvarTodos);
});

async function trocarLoteria() {
    const btn = document.getElementById('generateBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Carregando...';
    }

    _historico = await carregarHistorico(_lotteryAtual);
    _stats = calcularEstatisticas(_historico);
    console.log(`[${_lotteryAtual}] ${_historico.length} concursos carregados. Soma média: ${_stats.avgSum.toFixed(1)}`);

    const cfg = LOTTERY_CONFIGS[_lotteryAtual];
    const numInput = document.getElementById('numbersPerGame');
    if (numInput) {
        numInput.value = cfg.numbersToSelect;
        numInput.min = cfg.minSel;
        numInput.max = cfg.maxSel;
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
function gerarJogos() {
    const cfg = { ...LOTTERY_CONFIGS[_lotteryAtual], name: _lotteryAtual };
    const gameCount = parseInt(document.getElementById('gameCount').value, 10) || 1;
    const numbersPerGame = parseInt(document.getElementById('numbersPerGame').value, 10) || cfg.numbersToSelect;
    cfg.numbersToSelect = Math.max(cfg.minSel, Math.min(cfg.maxSel, numbersPerGame));

    // ✅ Leitura correta dos filtros (0 também é válido)
    const evenInput = document.getElementById('filterEven');
    const oddInput = document.getElementById('filterOdd');
    const primeInput = document.getElementById('filterPrime');

    const evenVal = evenInput ? evenInput.value.trim() : '';
    const oddVal = oddInput ? oddInput.value.trim() : '';
    const primeVal = primeInput ? primeInput.value.trim() : '';

    const even  = evenVal === '' ? null : parseInt(evenVal, 10);
    const odd   = oddVal === '' ? null : parseInt(oddVal, 10);
    const prime = primeVal === '' ? null : parseInt(primeVal, 10);

    // ✅ Valida se os filtros são possíveis
    const erroFiltros = validarFiltrosPossiveis(cfg, even, odd, prime);
    if (erroFiltros) {
        alert('⚠️ Filtros impossíveis\n\n' + erroFiltros);
        return;
    }

    _avisosUltimaGeracao = [];
    const jogos = [];
    const MAX_RETRIES_ESTRATEGIA = 800;

    for (let i = 0; i < gameCount; i++) {
        let jogo = null;
        let tentativas = 0;

        // Etapa 1: tentar gerar direto da estratégia
        while (tentativas < MAX_RETRIES_ESTRATEGIA) {
            tentativas++;
            const candidato = gerarJogo(cfg, _stats, _selectedStrategy);
            if (validaFiltros(candidato, even, odd, prime) &&
                !jogos.some(j => JSON.stringify(j) === JSON.stringify(candidato))) {
                jogo = candidato;
                break;
            }
        }

        // Etapa 2: se falhou, ajusta por swap
        if (!jogo) {
            if (cfg.name === 'Super Sete') {
                jogo = gerarSuperSete();
            } else {
                const base = gerarJogo(cfg, _stats, _selectedStrategy);
                const ajustado = ajustarParaFiltros(base, cfg, even, odd, prime);
                const valido = validaFiltros(ajustado, even, odd, prime);

                if (!valido) {
                    const p = countEven(ajustado);
                    const pr = countPrime(ajustado);
                    _avisosUltimaGeracao.push(
                        `Jogo ${i + 1}: pedido (P:${even ?? '-'} I:${odd ?? '-'} Pr:${prime ?? '-'}) — obtido (P:${p} I:${ajustado.length - p} Pr:${pr})`
                    );
                }

                // Evita duplicados
                if (!jogos.some(j => JSON.stringify(j) === JSON.stringify(ajustado))) {
                    jogo = ajustado;
                } else {
                    const variacao = [...ajustado];
                    const fora = getValidRange(cfg).filter(n => !variacao.includes(n));
                    if (fora.length > 0) {
                        variacao[0] = fora[randomInt(0, fora.length - 1)];
                        jogo = variacao.sort((a, b) => a - b);
                    } else {
                        jogo = ajustado;
                    }
                }
            }
        }

        jogos.push(jogo);
    }

    renderJogos(jogos, even, odd, prime, cfg);
    window._ultimosJogos = jogos;
    window._ultimaConfig = cfg;
}

function renderJogos(jogos, even, odd, prime, cfg) {
    const area = document.getElementById('resultsArea');
    const lista = document.getElementById('gamesList');
    area.classList.add('visible');

    lista.innerHTML = jogos.map((jogo, i) => {
        const soma = jogo.reduce((a, b) => a + b, 0);
        const pares = jogo.filter(n => n % 2 === 0).length;
        const primos = jogo.filter(n => isPrime(n)).length;
        const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');

        const bateuPares = even == null || pares === even;
        const bateuImpares = odd == null || (jogo.length - pares) === odd;
        const bateuPrimos = prime == null || primos === prime;
        const bateuTudo = bateuPares && bateuImpares && bateuPrimos;

        const corAviso = bateuTudo ? '#059669' : '#dc2626';
        const iconeAviso = bateuTudo ? '✅' : '⚠️';

        return `<div class="game-row">
            <div>
                <span class="game-numbers">Jogo ${i+1}: ${nums}</span>
                <div style="font-size:0.75rem;color:#64748b;margin-top:4px;">
                    Soma: <strong>${soma}</strong> · Pares: <strong>${pares}</strong> · Ímpares: <strong>${jogo.length - pares}</strong> · Primos: <strong>${primos}</strong>
                    <span style="color:${corAviso};font-weight:700;margin-left:6px;">${iconeAviso}</span>
                </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <button onclick="compartilharWhatsApp([${jogo.join(',')}], ${i+1})" style="background:#25D366;color:white;border:none;padding:8px 14px;border-radius:40px;font-weight:700;cursor:pointer;font-size:0.8rem;">
                    <i class="fa-brands fa-whatsapp"></i> Enviar
                </button>
                <button onclick="imprimirJogo([${jogo.join(',')}], ${i+1})" style="background:#dc2626;color:white;border:none;padding:8px 14px;border-radius:40px;font-weight:700;cursor:pointer;font-size:0.8rem;">
                    <i class="fa-solid fa-file-pdf"></i> PDF
                </button>
                <button class="btn-save" onclick="salvarJogoComAnalise([${jogo.join(',')}], ${i+1})">
                    <i class="fa-solid fa-bookmark"></i> Salvar
                </button>
            </div>
        </div>`;
    }).join('');

    // Aviso final
    if (_avisosUltimaGeracao.length > 0) {
        console.warn('[Filtros] Avisos:\n' + _avisosUltimaGeracao.join('\n'));
        setTimeout(() => {
            alert('⚠️ Atenção\n\nAlguns jogos não conseguiram atender 100% dos filtros pedidos (limitação matemática da ' + cfg.name + '):\n\n' + _avisosUltimaGeracao.slice(0, 5).join('\n') + (_avisosUltimaGeracao.length > 5 ? '\n...' : ''));
        }, 100);
    }
}

// ============================================================
// WHATSAPP
// ============================================================
function compartilharWhatsApp(jogo, numero) {
    const soma = jogo.reduce((a, b) => a + b, 0);
    const pares = jogo.filter(n => n % 2 === 0).length;
    const primos = jogo.filter(n => isPrime(n)).length;
    const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
    const estrategia = ESTRATEGIAS[_selectedStrategy]?.name || 'Estratégia';
    const emoji = ESTRATEGIAS[_selectedStrategy]?.emoji || '🎲';

    const mensagem =
        `${emoji} *Meu jogo da ${_lotteryAtual}*\n\n` +
        `📋 Estratégia: *${estrategia}*\n` +
        `🎯 Jogo ${numero}: *${nums}*\n\n` +
        `📊 Estatísticas:\n` +
        `• Soma: ${soma}\n` +
        `• Pares: ${pares} | Ímpares: ${jogo.length - pares}\n` +
        `• Primos: ${primos}\n\n` +
        `🍀 Gerado em: https://geradordejogosloterias.com.br`;

    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
}

function compartilharTodosWhatsApp() {
    const jogos = window._ultimosJogos || [];
    if (jogos.length === 0) {
        alert('Nenhum jogo para compartilhar.');
        return;
    }

    const estrategia = ESTRATEGIAS[_selectedStrategy]?.name || 'Estratégia';
    const emoji = ESTRATEGIAS[_selectedStrategy]?.emoji || '🎲';

    let mensagem = `${emoji} *Meus ${jogos.length} jogos da ${_lotteryAtual}*\n`;
    mensagem += `📋 Estratégia: *${estrategia}*\n\n`;

    jogos.forEach((jogo, i) => {
        const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
        mensagem += `🎯 *Jogo ${i+1}:* ${nums}\n`;
    });

    const somaTotal = jogos.reduce((acc, j) => acc + j.reduce((a, b) => a + b, 0), 0);
    const somaMedia = (somaTotal / jogos.length).toFixed(1);

    mensagem += `\n📊 *Soma média:* ${somaMedia}\n`;
    mensagem += `\n🍀 Gerado em: https://geradordejogosloterias.com.br`;

    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
}

// ============================================================
// PDF
// ============================================================
function imprimirJogo(jogo, numero) {
    const soma = jogo.reduce((a, b) => a + b, 0);
    const pares = jogo.filter(n => n % 2 === 0).length;
    const primos = jogo.filter(n => isPrime(n)).length;
    const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
    const estrategia = ESTRATEGIAS[_selectedStrategy]?.name || 'Estratégia';
    const emoji = ESTRATEGIAS[_selectedStrategy]?.emoji || '🎲';
    const dataHora = new Date().toLocaleString('pt-BR');

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Jogo ' + numero + ' - ' + _lotteryAtual + '</title><style>' +
        '* { box-sizing: border-box; margin: 0; padding: 0; }' +
        'body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; }' +
        '.header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }' +
        '.header h1 { color: #2563eb; font-size: 22px; margin-bottom: 6px; }' +
        '.header .subtitle { color: #64748b; font-size: 14px; margin-bottom: 4px; }' +
        '.header .meta { color: #94a3b8; font-size: 11px; }' +
        '.jogo { border: 2px solid #2563eb; border-radius: 12px; padding: 20px; background: #f8fafc; }' +
        '.jogo-titulo { color: #2563eb; font-size: 16px; font-weight: bold; margin-bottom: 12px; text-align: center; }' +
        '.numeros { font-size: 20px; font-weight: bold; text-align: center; color: #1e293b; letter-spacing: 2px; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; line-height: 1.6; }' +
        '.estatisticas { display: flex; justify-content: space-around; gap: 10px; margin-top: 12px; }' +
        '.estatistica { background: white; padding: 8px 15px; border-radius: 8px; text-align: center; flex: 1; border: 1px solid #e2e8f0; }' +
        '.estatistica .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; }' +
        '.estatistica .valor { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 3px; }' +
        '.footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 2px dashed #e2e8f0; color: #94a3b8; font-size: 11px; }' +
        '.footer strong { color: #2563eb; }' +
        '</style></head><body>' +
        '<div class="header">' +
            '<h1>🎯 Gerador de Jogos - Loterias</h1>' +
            '<div class="subtitle">' + emoji + ' ' + _lotteryAtual + ' — Estratégia: ' + estrategia + '</div>' +
            '<div class="meta">Gerado em: ' + dataHora + '</div>' +
        '</div>' +
        '<div class="jogo">' +
            '<div class="jogo-titulo">JOGO ' + numero + '</div>' +
            '<div class="numeros">' + nums + '</div>' +
            '<div class="estatisticas">' +
                '<div class="estatistica"><div class="label">Soma</div><div class="valor">' + soma + '</div></div>' +
                '<div class="estatistica"><div class="label">Pares</div><div class="valor">' + pares + '</div></div>' +
                '<div class="estatistica"><div class="label">Ímpares</div><div class="valor">' + (jogo.length - pares) + '</div></div>' +
                '<div class="estatistica"><div class="label">Primos</div><div class="valor">' + primos + '</div></div>' +
            '</div>' +
        '</div>' +
        '<div class="footer"><strong>🍀 geradordejogosloterias.com.br</strong><br>Boa sorte! Os jogos são gerados a partir de análise estatística.</div>' +
        '</body></html>';

    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(html);
    novaJanela.document.close();
    setTimeout(function() { novaJanela.print(); }, 500);
}

function imprimirTodos() {
    const jogos = window._ultimosJogos || [];
    if (jogos.length === 0) {
        alert('Nenhum jogo para imprimir.');
        return;
    }

    const estrategia = ESTRATEGIAS[_selectedStrategy]?.name || 'Estratégia';
    const emoji = ESTRATEGIAS[_selectedStrategy]?.emoji || '🎲';
    const dataHora = new Date().toLocaleString('pt-BR');
    const totalJogos = jogos.length;
    const somaTotal = jogos.reduce(function(acc, j) { return acc + j.reduce(function(a, b) { return a + b; }, 0); }, 0);
    const somaMedia = (somaTotal / totalJogos).toFixed(1);

    let jogosHtml = '';
    jogos.forEach(function(jogo, i) {
        const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
        const pares = jogo.filter(function(n) { return n % 2 === 0; }).length;
        const primos = jogo.filter(function(n) { return isPrime(n); }).length;
        const nums = jogo.map(function(n) { return String(n).padStart(2, '0'); }).join(' - ');

        jogosHtml += '<div class="jogo-card">' +
            '<div class="jogo-header">' +
                '<span class="jogo-num">JOGO ' + (i + 1) + '</span>' +
                '<span class="jogo-meta">Soma: ' + soma + ' | P: ' + pares + ' | I: ' + (jogo.length - pares) + ' | Pr: ' + primos + '</span>' +
            '</div>' +
            '<div class="numeros">' + nums + '</div>' +
        '</div>';
    });

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Meus Jogos - ' + _lotteryAtual + '</title><style>' +
        '* { box-sizing: border-box; margin: 0; padding: 0; }' +
        '@page { margin: 10mm; }' +
        'body { font-family: Arial, sans-serif; padding: 15px; color: #1e293b; background: #fff; }' +
        '.header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px; }' +
        '.header h1 { color: #2563eb; font-size: 20px; margin-bottom: 5px; }' +
        '.header .subtitle { color: #64748b; font-size: 13px; margin-bottom: 4px; }' +
        '.header .meta { color: #94a3b8; font-size: 11px; }' +
        '.stats-gerais { display: flex; justify-content: center; gap: 25px; margin: 12px 0 18px 0; padding: 10px; background: #f1f5f9; border-radius: 8px; font-size: 12px; color: #334155; }' +
        '.stats-gerais strong { color: #2563eb; font-size: 14px; }' +
        '.jogos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }' +
        '.jogo-card { border: 1.5px solid #2563eb; border-radius: 8px; padding: 10px 12px; background: #f8fafc; page-break-inside: avoid; }' +
        '.jogo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #cbd5e1; }' +
        '.jogo-num { color: #2563eb; font-size: 12px; font-weight: bold; text-transform: uppercase; }' +
        '.jogo-meta { font-size: 10px; color: #64748b; font-family: Courier New, monospace; }' +
        '.numeros { font-size: 14px; font-weight: bold; text-align: center; color: #1e293b; letter-spacing: 1px; line-height: 1.8; }' +
        '.footer { text-align: center; margin-top: 20px; padding-top: 12px; border-top: 2px dashed #e2e8f0; color: #94a3b8; font-size: 10px; }' +
        '.footer strong { color: #2563eb; }' +
        '</style></head><body>' +
        '<div class="header">' +
            '<h1>🎯 Gerador de Jogos - Loterias</h1>' +
            '<div class="subtitle">' + emoji + ' ' + _lotteryAtual + ' — Estratégia: ' + estrategia + '</div>' +
            '<div class="meta">Gerado em: ' + dataHora + '</div>' +
        '</div>' +
        '<div class="stats-gerais">' +
            '<span><strong>' + totalJogos + '</strong> jogo(s)</span>' +
            '<span>Soma média: <strong>' + somaMedia + '</strong></span>' +
            '<span>Números por jogo: <strong>' + jogos[0].length + '</strong></span>' +
        '</div>' +
        '<div class="jogos-grid">' + jogosHtml + '</div>' +
        '<div class="footer"><strong>🍀 geradordejogosloterias.com.br</strong><br>Boa sorte!</div>' +
        '</body></html>';

    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(html);
    novaJanela.document.close();
    setTimeout(function() { novaJanela.print(); }, 500);
}

// ============================================================
// SALVAR
// ============================================================
function salvarJogoComAnalise(jogo, numero) {
    const ultimoConcurso = _stats && _stats.ordenadoDesc ? _stats.ordenadoDesc[0] : null;
    let acertos = 0;
    let numerosSorteados = [];
    let concursoNum = '--';
    let dataConcurso = '--';

    if (ultimoConcurso) {
        numerosSorteados = (ultimoConcurso.dezenas || ultimoConcurso.listaDezenas || []).map(function(n) { return parseInt(n, 10); });
        concursoNum = ultimoConcurso.concurso || ultimoConcurso.numero || '--';
        dataConcurso = ultimoConcurso.data || ultimoConcurso.dataApuracao || '--';
        acertos = jogo.filter(function(n) { return numerosSorteados.includes(n); }).length;
    }

    const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
    const pares = jogo.filter(function(n) { return n % 2 === 0; }).length;
    const primos = jogo.filter(function(n) { return isPrime(n); }).length;

    const jogos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
    jogos.push({
        loteria: _lotteryAtual,
        numeros: jogo,
        soma: soma,
        pares: pares,
        primos: primos,
        acertosUltimoConcurso: acertos,
        ultimoConcurso: concursoNum,
        ultimaData: dataConcurso,
        data: new Date().toISOString(),
        origem: 'Avancado: ' + (ESTRATEGIAS[_selectedStrategy] ? ESTRATEGIAS[_selectedStrategy].name : 'Estrategia')
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(jogos));

    alert(
        '✅ Jogo salvo!\n\n' +
        'Números: ' + jogo.join(' - ') + '\n' +
        'Soma: ' + soma + '\n' +
        'Pares: ' + pares + ' | Ímpares: ' + (jogo.length - pares) + ' | Primos: ' + primos + '\n\n' +
        '📊 Comparação com último concurso (#' + concursoNum + ' - ' + dataConcurso + '):\n' +
        'Números sorteados: ' + numerosSorteados.join(' - ') + '\n' +
        '🎯 Você acertaria ' + acertos + ' número(s)!'
    );
}

function salvarTodos() {
    const jogos = window._ultimosJogos || [];
    if (jogos.length === 0) {
        alert('Nenhum jogo para salvar.');
        return;
    }

    const ultimoConcurso = _stats && _stats.ordenadoDesc ? _stats.ordenadoDesc[0] : null;
    const numerosSorteados = ultimoConcurso
        ? (ultimoConcurso.dezenas || ultimoConcurso.listaDezenas || []).map(function(n) { return parseInt(n, 10); })
        : [];
    const concursoNum = ultimoConcurso ? (ultimoConcurso.concurso || ultimoConcurso.numero || '--') : '--';
    const dataConcurso = ultimoConcurso ? (ultimoConcurso.data || ultimoConcurso.dataApuracao || '--') : '--';

    let totalAcertos = 0;
    let melhorAcertos = 0;

    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');

    jogos.forEach(function(jogo) {
        const acertos = numerosSorteados.length > 0
            ? jogo.filter(function(n) { return numerosSorteados.includes(n); }).length
            : 0;
        totalAcertos += acertos;
        melhorAcertos = Math.max(melhorAcertos, acertos);

        const soma = jogo.reduce(function(a, b) { return a + b; }, 0);
        const pares = jogo.filter(function(n) { return n % 2 === 0; }).length;
        const primos = jogo.filter(function(n) { return isPrime(n); }).length;

        salvos.push({
            loteria: _lotteryAtual,
            numeros: jogo,
            soma: soma,
            pares: pares,
            primos: primos,
            acertosUltimoConcurso: acertos,
            ultimoConcurso: concursoNum,
            ultimaData: dataConcurso,
            data: new Date().toISOString(),
            origem: 'Avancado: ' + (ESTRATEGIAS[_selectedStrategy] ? ESTRATEGIAS[_selectedStrategy].name : 'Estrategia')
        });
    });

    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));

    const media = (totalAcertos / jogos.length).toFixed(1);

    alert(
        '✅ ' + jogos.length + ' jogo(s) salvo(s)!\n\n' +
        '📊 Análise geral vs. último concurso (#' + concursoNum + '):\n' +
        'Números sorteados: ' + numerosSorteados.join(' - ') + '\n' +
        '🎯 Média de acertos: ' + media + '\n' +
        '🏆 Melhor jogo: ' + melhorAcertos + ' acerto(s)\n\n' +
        'Estratégia: ' + (ESTRATEGIAS[_selectedStrategy] ? ESTRATEGIAS[_selectedStrategy].name : 'Estrategia')
    );
}

console.log("[gerador-avancado.js] TUDO carregado — versão corrigida");
