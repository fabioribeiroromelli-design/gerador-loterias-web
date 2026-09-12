/* ============================================================
   gerador-avancado.js — 12 estratégias + WhatsApp + PDF
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
        ? Array.from({ length: cfg.maxNumber + 1 }, (_, i) => i)
        : Array.from({ length: cfg.maxNumber }, (_, i) => i + 1);
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
    const restantes = range.filter(n => !selected.has(n)).sort(() => Math.random() - 0.5);
    let i = 0;
    while (selected.size < needed && i < restantes.length) selected.add(restantes[i++]);
    return uniqueSorted([...selected]);
}

function gerarAtrasoPonderado(cfg, stats) {
    const range = getValidRange(cfg);
    const needed = cfg.numbersToSelect;
    const delayData = stats.delay || {};

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
    pool.slice(0, needed).sort(() => Math.random() - 0.5)
        .slice(0, Math.max(1, Math.floor(needed * 0.3)))
        .forEach(n => selected.add(n));

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

    cfg.numbersToSelect = Math.max(cfg.minSel, Math.min(cfg.maxSel, numbersPerGame));

    const even  = parseInt(document.getElementById('filterEven').value) || null;
    const odd   = parseInt(document.getElementById('filterOdd').value) || null;
    const prime = parseInt(document.getElementById('filterPrime').value) || null;

    if (even != null && odd != null && (even + odd) !== cfg.numbersToSelect) {
        alert(`A soma de Pares (${even}) + Ímpares (${odd}) deve ser exatamente ${cfg.numbersToSelect}.`);
        return;
    }

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
        if (!jogo) {
            jogo = cfg.name === 'Super Sete' ? gerarSuperSete() : gerarAleatorio(cfg);
        }
        jogos.push(jogo);
    }

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
                <span class="game-numbers">Jogo ${i+1}: ${nums}</span>
                <div style="font-size:0.75rem;color:#64748b;margin-top:4px;">
                    Soma: <strong>${soma}</strong> · Pares: <strong>${pares}</strong> · Ímpares: <strong>${jogo.length - pares}</strong> · Primos: <strong>${primos}</strong>
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

    window._ultimosJogos = jogos;
    window._ultimaConfig = cfg;
}

// ============================================================
// COMPARTILHAR 1 JOGO NO WHATSAPP
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

// ============================================================
// COMPARTILHAR TODOS NO WHATSAPP
// ============================================================
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
// IMPRIMIR 1 JOGO EM PDF
// ============================================================
function imprimirJogo(jogo, numero) {
    const soma = jogo.reduce((a, b) => a + b, 0);
    const pares = jogo.filter(n => n % 2 === 0).length;
    const primos = jogo.filter(n => isPrime(n)).length;
    const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
    const estrategia = ESTRATEGIAS[_selectedStrategy]?.name || 'Estratégia';
    const emoji = ESTRATEGIAS[_selectedStrategy]?.emoji || '🎲';
    const dataHora = new Date().toLocaleString('pt-BR');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Jogo ${numero} - ${_lotteryAtual}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
                .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
                .header h1 { color: #2563eb; font-size: 22px; margin-bottom: 6px; }
                .header .subtitle { color: #64748b; font-size: 14px; margin-bottom: 4px; }
                .header .meta { color: #94a3b8; font-size: 11px; }
                .jogo { border: 2px solid #2563eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #f8fafc; }
                .jogo-titulo { color: #2563eb; font-size: 16px; font-weight: bold; margin-bottom: 12px; text-align: center; }
                .numeros { font-size: 20px; font-weight: bold; text-align: center; color: #1e293b; letter-spacing: 2px; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; line-height: 1.6; }
                .estatisticas { display: flex; justify-content: space-around; gap: 10px; margin-top: 12px; }
                .estatistica { background: white; padding: 8px 15px; border-radius: 8px; text-align: center; flex: 1; border: 1px solid #e2e8f0; }
                .estatistica .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; }
                .estatistica .valor { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 3px; }
                .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 2px dashed #e2e8f0; color: #94a3b8; font-size: 11px; }
                .footer strong { color: #2563eb; }
                @media print { body { padding: 15px; } .jogo { page-break-inside: avoid; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎯 Gerador de Jogos - Loterias</h1>
                <div class="subtitle">${emoji} ${_lotteryAtual} — Estratégia: ${estrategia}</div>
                <div class="meta">Gerado em: ${dataHora}</div>
            </div>
            <div class="jogo">
                <div class="jogo-titulo">JOGO ${numero}</div>
                <div class="numeros">${nums}</div>
                <div class="estatisticas">
                    <div class="estatistica"><div class="label">Soma</div><div class="valor">${soma}</div></div>
                    <div class="estatistica"><div class="label">Pares</div><div class="valor">${pares}</div></div>
                    <div class="estatistica"><div class="label">Ímpares</div><div class="valor">${jogo.length - pares}</div></div>
                    <div class="estatistica"><div class="label">Primos</div><div class="valor">${primos}</div></div>
                </div>
            </div>
            <div class="footer">
                <strong>🍀 geradordejogosloterias.com.br</strong><br>
                Boa sorte! Os jogos são gerados a partir de análise estatística.
            </div>
        </body>
        </html>`;

    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(html);
    novaJanela.document.close();
    setTimeout(() => novaJanela.print(), 500);
}

// ============================================================
// IMPRIMIR TODOS OS JOGOS EM PDF
// ============================================================
function imprimirTodos() {
    const jogos = window._ultimosJogos || [];
    if (jogos.length === 0) {
        alert('Nenhum jogo para imprimir.');
        return;
    }

    const estrategia = ESTRATEGIAS[_selectedStrategy]?.name || 'Estratégia';
    const emoji = ESTRATEGIAS[_selectedStrategy]?.emoji || '🎲';
    const dataHora = new Date().toLocaleString('pt-BR');

    let jogosHtml = '';
    jogos.forEach((jogo, i) => {
        const soma = jogo.reduce((a, b) => a + b, 0);
        const pares = jogo.filter(n => n % 2 === 0).length;
        const primos = jogo.filter(n => isPrime(n)).length;
        const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');

        jogosHtml += `
            <div class="jogo">
                <div class="jogo-titulo">JOGO ${i + 1}</div>
                <div class="numeros">${nums}</div>
                <div class="estatisticas">
                    <div class="estatistica"><div class="label">Soma</div><div class="valor">${soma}</div></div>
                    <div class="estatistica"><div class="label">Pares</div><div class="valor">${pares}</div></div>
                    <div class="estatistica"><div class="label">Ímpares</div><div class="valor">${jogo.length - pares}</div></div>
                    <div class="estatistica"><div class="label">Primos</div><div class="valor">${primos}</div></div>
                </div>
            </div>`;
    });

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Meus Jogos - ${_lotteryAtual}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
                .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
                .header h1 { color: #2563eb; font-size: 22px; margin-bottom: 6px; }
                .header .subtitle { color: #64748b; font-size: 14px; margin-bottom: 4px; }
                .header .meta { color: #94a3b8; font-size: 11px; }
                .jogo { border: 2px solid #2563eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #f8fafc; page-break-inside: avoid; }
                .jogo-titulo { color: #2563eb; font-size: 16px; font-weight: bold; margin-bottom: 12px; text-align: center; }
                .numeros { font-size: 20px; font-weight: bold; text-align: center; color: #1e293b; letter-spacing: 2px; margin: 15px 0; padding: 15px; background: white; border-radius: 8px; line-height: 1.6; }
                .estatisticas { display: flex; justify-content: space-around; gap: 10px; margin-top: 12px; }
                .estatistica { background: white; padding: 8px 15px; border-radius: 8px; text-align: center; flex: 1; border: 1px solid #e2e8f0; }
                .estatistica .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; }
                .estatistica .valor { font-size: 18px; font-weight: bold; color: #2563eb; margin-top: 3px; }
                .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 2px dashed #e2e8f0; color: #94a3b8; font-size: 11px; }
                .footer strong { color: #2563eb; }
                @media print { body { padding: 15px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎯 Gerador de Jogos - Loterias</h1>
                <div class="subtitle">${emoji} ${_lotteryAtual} — Estratégia: ${estrategia}</div>
                <div class="meta">${jogos.length} jogo(s) • Gerado em: ${dataHora}</div>
            </div>
            ${jogosHtml}
            <div class="footer">
                <strong>🍀 geradordejogosloterias.com.br</strong><br>
                Boa sorte! Os jogos são gerados a partir de análise estatística.
            </div>
        </body>
        </html>`;

    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(html);
    novaJanela.document.close();
    setTimeout(() => novaJanela.print(), 500);
}

// ============================================================
// SALVAR 1 JOGO COM ANÁLISE
// ============================================================
function salvarJogoComAnalise(jogo, numero) {
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

// ============================================================
// SALVAR TODOS COM ANÁLISE
// ============================================================
function salvarTodos() {
    const jogos = window._ultimosJogos || [];
    if (jogos.length === 0) {
        alert('Nenhum jogo para salvar.');
        return;
    }

    const ultimoConcurso = _stats?.ordenadoDesc?.[0];
    const numerosSorteados = ultimoConcurso
        ? (ultimoConcurso.dezenas || ultimoConcurso.listaDezenas || []).map(n => parseInt(n, 10))
        : [];
    const concursoNum = ultimoConcurso?.concurso || ultimoConcurso?.numero || '--';
    const dataConcurso = ultimoConcurso?.data || ultimoConcurso?.dataApuracao || '--';

    let totalAcertos = 0;
    let melhorAcertos = 0;

    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');

    jogos.forEach(jogo => {
        const acertos = numerosSorteados.length > 0
            ? jogo.filter(n => numerosSorteados.includes(n)).length
            : 0;
        totalAcertos += acertos;
        melhorAcertos = Math.max(melhorAcertos, acertos);

        const soma = jogo.reduce((a, b) => a + b, 0);
        const pares = jogo.filter(n => n % 2 === 0).length;
        const primos = jogo.filter(n => isPrime(n)).length;

        salvos.push({
            loteria: _lotteryAtual,
            numeros: jogo,
            soma, pares, primos,
            acertosUltimoConcurso: acertos,
            ultimoConcurso: concursoNum,
            ultimaData: dataConcurso,
            data: new Date().toISOString(),
            origem: `Avancado: ${ESTRATEGIAS[_selectedStrategy].name}`
        });
    });

    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));

    const media = (totalAcertos / jogos.length).toFixed(1);

    alert(
        `✅ ${jogos.length} jogo(s) salvo(s)!\n\n` +
        `📊 Análise geral vs. último concurso (#${concursoNum}):\n` +
        `Números sorteados: ${numerosSorteados.join(' - ')}\n` +
        `🎯 Média de acertos: ${media}\n` +
        `🏆 Melhor jogo: ${melhorAcertos} acerto(s)\n\n` +
        `Estratégia: ${ESTRATEGIAS[_selectedStrategy].name}`
    );
}
