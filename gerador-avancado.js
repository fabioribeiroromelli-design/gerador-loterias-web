/* ============================================================
   gerador-avancado.js — 12 estratégias portadas do app
   ============================================================ */

// Estado global
let _historico = null;
let _stats = null;
let _lotteryAtual = 'Lotofácil';
let _selectedStrategy = 0;

// ============================================================
// RENDER DAS ESTRATÉGIAS
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
            _selectedStrategy = parseInt(card.dataset.index);
            grid.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function getValidRange(cfg) {
    return cfg.startNumber === 0
        ? Array.from({ length: cfg.maxNumber + 1 }, (_, i) => i)          // 0..99 para Lotomania
        : Array.from({ length: cfg.maxNumber }, (_, i) => i + 1);         // 1..60 para Mega
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uniqueSorted(arr) {
    return [...new Set(arr)].sort((a, b) => a - b);
}

function countEven(nums) { return nums.filter(n => n % 2 === 0).length; }
function countOdd(nums)  { return nums.filter(n => n % 2 !== 0).length; }
function countPrime(nums){ return nums.filter(n => isPrime(n)).length; }
function sum(nums) { return nums.reduce((a, b) => a + b, 0); }

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
    while (nums.size < cfg.numbersToSelect) {
        nums.add(range[randomInt(0, range.length - 1)]);
    }
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

    // Cria pool ponderado
    const pool = [];
    range.forEach(n => {
        const peso = hotSet.has(n) ? 4 : 1;
        for (let i = 0; i < peso; i++) pool.push(n);
    });

    const selected = new Set();
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (const n of shuffled) {
        if (selected.size >= needed) break;
        selected.add(n);
    }
    // Completa se necessário
    const restantes = range.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarAtrasoPonderado(cfg, stats) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const delayData = stats.delay || {};

    // Ordena por atraso
    const sorted = Object.entries(delayData)
        .sort((a, b) => b[1] - a[1])
        .map(([n]) => parseInt(n));

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
        .sort(() => Math.random() - 0.5)
        .slice(0, needed % numSetores);

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
    // 30% dos melhores
    pool.slice(0, needed).sort(() => Math.random() - 0.5)
        .slice(0, Math.max(1, Math.floor(needed * 0.3)))
        .forEach(n => selected.add(n));

    // 40% dos seguintes
    const alvoMeio = Math.floor(needed * 0.7);
    const meio = pool.slice(needed, needed * 2).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < alvoMeio && i < meio.length) selected.add(meio[i++]);

    // Resto
    const restantes = [...pool.slice(needed * 2), ...range.filter(n => !pool.includes(n))].sort(() => Math.random() - 0.5);
    i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);

    return uniqueSorted([...selected]);
}

function gerarAleatorio(cfg) {
    const range = getValidRange(cfg);
    const nums = new Set();
    while (nums.size < cfg.numbersToSelect) {
        nums.add(range[randomInt(0, range.length - 1)]);
    }
    return uniqueSorted([...nums]);
}

function gerarSuperSete() {
    return Array.from({ length: 7 }, () => randomInt(0, 9));
}

// ============================================================
// DISPATCHER
// ============================================================
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
// VALIDAÇÃO DE FILTROS
// ============================================================
function validaFiltros(game, even, odd, prime) {
    if (even != null && countEven(game) !== even) return false;
    if (odd != null && countOdd(game) !== odd) return false;
    if (prime != null && countPrime(game) !== prime) return false;
    return true;
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    renderStrategiesGrid();

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

    // Ajusta "números por jogo" ao trocar de loteria
    const cfg = LOTTERY_CONFIGS[_lotteryAtual];
    const numInput = document.getElementById('numbersPerGame');
    if (numInput) {
        numInput.value = cfg.numbersToSelect;
        numInput.min = cfg.minSel;
        numInput.max = cfg.maxSel;
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Gerar Jogos';
    }
}

// ============================================================
// GERAÇÃO
// ============================================================
function gerarJogos() {
    const cfg = { ...LOTTERY_CONFIGS[_lotteryAtual], name: _lotteryAtual };
    const gameCount = parseInt(document.getElementById('gameCount').value) || 1;
    const numbersPerGame = parseInt(document.getElementById('numbersPerGame').value) || cfg.numbersToSelect;

    // Sobrescreve a quantidade de números
    cfg.numbersToSelect = Math.max(cfg.minSel, Math.min(cfg.maxSel, numbersPerGame));

    // Filtros
    const even  = parseInt(document.getElementById('filterEven').value) || null;
    const odd   = parseInt(document.getElementById('filterOdd').value) || null;
    const prime = parseInt(document.getElementById('filterPrime').value) || null;

    // Validação
    if (even != null && odd != null && (even + odd) !== cfg.numbersToSelect) {
        alert(`A soma de Pares (${even}) + Ímpares (${odd}) deve ser exatamente ${cfg.numbersToSelect}.`);
        return;
    }

    // Gera
    const jogos = [];
    const maxTentativas = 800;

    for (let i = 0; i < gameCount; i++) {
        let jogo = null;
        for (let t = 0; t < maxTentativas; t++) {
            const candidato = gerarJogo(cfg, _stats, _selectedStrategy);
            if (!jogos.some(j => JSON.stringify(j) === JSON.stringify(candidato)) && validaFiltros(candidato, even, odd, prime)) {
                jogo = candidato;
                break;
            }
        }
        // Fallback
        if (!jogo) {
            jogo = cfg.name === 'Super Sete' ? gerarSuperSete() : gerarAleatorio(cfg);
        }
        jogos.push(jogo);
    }

    // Renderiza
    const area = document.getElementById('resultsArea');
    const lista = document.getElementById('gamesList');
    area.classList.add('visible');

    lista.innerHTML = jogos.map((jogo, i) => {
    const soma = jogo.reduce((a, b) => a + b, 0);
    const pares = jogo.filter(n => n % 2 === 0).length;
    const primos = jogo.filter(n => isPrime(n)).length;
    const nums = cfg.name === 'Super Sete'
        ? jogo.map((n, col) => `<span style="display:inline-flex;flex-direction:column;align-items:center;margin:0 3px;">
            <span style="font-size:9px;color:#94a3b8;">C${col+1}</span>
            <span style="font-weight:700;">${n}</span>
          </span>`).join('')
        : jogo.map(n => String(n).padStart(2, '0')).join(' - ');

    return `<div class="game-row">
        <div>
            <span class="game-numbers">${cfg.name === 'Super Sete' ? nums : `Jogo ${i+1}: ${nums}`}</span>
            ${cfg.name !== 'Super Sete' ? `
                <div style="font-size:0.75rem;color:#64748b;margin-top:4px;">
                    Soma: <strong>${soma}</strong> · Pares: <strong>${pares}</strong> · Ímpares: <strong>${jogo.length - pares}</strong> · Primos: <strong>${primos}</strong>
                </div>
            ` : ''}
        </div>
        <button class="btn-save" onclick="salvarJogo([${jogo.join(',')}], ${i+1})">
            <i class="fa-solid fa-bookmark"></i> Salvar
        </button>
    </div>`;
}).join('');

    // Guarda para salvar depois
    window._ultimosJogos = jogos;
    window._ultimaConfig = cfg;
}

function salvarJogo(jogo, numero) {
    const cfg = window._ultimaConfig;
    const jogos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
    jogos.push({
        loteria: _lotteryAtual,
        numeros: jogo,
        data: new Date().toISOString(),
        origem: `Avancado: ${ESTRATEGIAS[_selectedStrategy].name}`
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(jogos));
    alert('Jogo salvo!');
}

function salvarTodos() {
    const jogos = window._ultimosJogos || [];
    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
    jogos.forEach(jogo => {
        salvos.push({
            loteria: _lotteryAtual,
            numeros: jogo,
            data: new Date().toISOString(),
            origem: `Avancado: ${ESTRATEGIAS[_selectedStrategy].name}`
        });
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));
    alert(`${jogos.length} jogo(s) salvos!`);
}

// ============================================================
// COMPARA COM O ÚLTIMO CONCURSO E SALVA COM ESTATÍSTICAS
// ============================================================
async function salvarJogoComAnalise(jogo, numero) {
    const cfg = window._ultimaConfig;

    // Pega o último concurso do histórico em memória
    const ultimoConcurso = _stats?.ordenadoDesc?.[0];
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
    const primos = jogo.filter(n => isPrime(n)).length;

    // Salva no localStorage
    const jogos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
    jogos.push({
        loteria: _lotteryAtual,
        numeros: jogo,
        soma, pares, primos,
        acertosUltimoConcurso: acertos,
        ultimoConcurso: concursoNum,
        ultimaData: dataConcurso,
        data: new Date().toISOString(),
        origem: `Avancado: ${ESTRATEGIAS[_selectedStrategy].name}`
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(jogos));

    // Mostra um alerta com as estatísticas
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
