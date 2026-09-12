/* ============================================================
   fechamento.js
   Lógica completa do Fechamento Matemático
   ============================================================ */

console.log("[fechamento.js] Carregado");

let _fLoteriaAtual = 'Mega-Sena';
let _fObjetivoAtual = null;
let _fNumerosSelecionados = new Set();
let _fSuperSeteSelecionados = {}; // { coluna: Set(numeros) }
let _fJogosGerados = [];

// ============================================================
// RENDER PASSO 1 — Cards de loteria
// ============================================================
function renderLoteriaGrid() {
    const grid = document.getElementById('loteriaGrid');
    if (!grid) return;

    grid.innerHTML = Object.keys(FECHAMENTO_LOTERIAS).map(nome => {
        const cfg = FECHAMENTO_LOTERIAS[nome];
        return `<button class="loteria-btn ${nome === _fLoteriaAtual ? 'selected' : ''}"
                        data-nome="${nome}"
                        style="background:${cfg.color};">
                    ${nome}
                </button>`;
    }).join('');

    grid.querySelectorAll('.loteria-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            _fLoteriaAtual = btn.dataset.nome;
            _fNumerosSelecionados.clear();
            _fSuperSeteSelecionados = {};
            _fJogosGerados = [];
            // Seleciona primeiro objetivo
            const cfg = FECHAMENTO_LOTERIAS[_fLoteriaAtual];
            _fObjetivoAtual = cfg.objetivos[0].id;
            renderLoteriaGrid();
            renderObjetivoGrid();
            renderVolante();
            atualizarPreview();
            document.getElementById('resultsArea').classList.remove('visible');
        });
    });
}

// ============================================================
// RENDER PASSO 2 — Objetivos
// ============================================================
function renderObjetivoGrid() {
    const grid = document.getElementById('objetivoGrid');
    if (!grid) return;

    const cfg = FECHAMENTO_LOTERIAS[_fLoteriaAtual];
    if (!cfg) return;

    grid.innerHTML = cfg.objetivos.map(obj => `
        <button class="objetivo-btn ${obj.id === _fObjetivoAtual ? 'selected' : ''}"
                data-id="${obj.id}">
            ${obj.label}
        </button>
    `).join('');

    grid.querySelectorAll('.objetivo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            _fObjetivoAtual = btn.dataset.id;
            renderObjetivoGrid();
            atualizarPreview();
        });
    });
}

// ============================================================
// RENDER PASSO 3 — Volante
// ============================================================
function renderVolante() {
    const container = document.getElementById('volanteContainer');
    if (!container) return;

    if (_fLoteriaAtual === 'Super Sete') {
        renderVolanteSuperSete(container);
    } else {
        renderVolanteNormal(container);
    }
}

function renderVolanteNormal(container) {
    const cfg = FECHAMENTO_LOTERIAS[_fLoteriaAtual];
    const total = cfg.maxNumber - cfg.minNumber + 1;

    // Colunas: 10 padrão, Lotofácil 5, Dia de Sorte 7
    let cols = 10;
    if (_fLoteriaAtual === 'Lotofácil') cols = 5;
    if (_fLoteriaAtual === 'Dia de Sorte') cols = 7;

    let html = `<div class="volante-grid" style="grid-template-columns: repeat(${cols}, 1fr);">`;
    for (let i = 0; i < total; i++) {
        const num = cfg.minNumber + i;
        const sel = _fNumerosSelecionados.has(num);
        html += `<div class="numero-cell ${sel ? 'selected' : ''}" data-num="${num}">${String(num).padStart(2, '0')}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.numero-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const num = parseInt(cell.dataset.num, 10);
            if (_fNumerosSelecionados.has(num)) {
                _fNumerosSelecionados.delete(num);
            } else {
                _fNumerosSelecionados.add(num);
            }
            cell.classList.toggle('selected');
            atualizarPreview();
        });
    });
}

function renderVolanteSuperSete(container) {
    // 7 colunas × 10 linhas (0-9)
    let html = '<div class="supersete-grid">';
    // Cabeçalho (linha 0)
    html += '<div></div>'; // canto vazio
    for (let c = 0; c < 7; c++) {
        html += `<div class="col-label">C${c + 1}</div>`;
    }
    // Linhas 0-9
    for (let num = 0; num <= 9; num++) {
        html += `<div class="row-label">${num}</div>`;
        for (let c = 0; c < 7; c++) {
            const sel = _fSuperSeteSelecionados[c] && _fSuperSeteSelecionados[c].has(num);
            html += `<div class="cell ${sel ? 'selected' : ''}" data-col="${c}" data-num="${num}">${num}</div>`;
        }
    }
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const col = parseInt(cell.dataset.col, 10);
            const num = parseInt(cell.dataset.num, 10);
            if (!_fSuperSeteSelecionados[col]) _fSuperSeteSelecionados[col] = new Set();
            if (_fSuperSeteSelecionados[col].has(num)) {
                _fSuperSeteSelecionados[col].delete(num);
            } else {
                _fSuperSeteSelecionados[col].add(num);
            }
            cell.classList.toggle('selected');
            atualizarPreview();
        });
    });
}

// ============================================================
// PREVIEW EM TEMPO REAL
// ============================================================
function atualizarPreview() {
    const tvSel = document.getElementById('tvSelecionados');
    const tvComb = document.getElementById('tvCombinacoes');
    const aviso = document.getElementById('avisoLimite');
    const avisoTxt = document.getElementById('avisoLimiteTexto');
    const btn = document.getElementById('btnGerar');

    if (!tvSel || !tvComb || !btn) return;

    let totalSel = 0;
    let totalJogos = 0;

    if (_fLoteriaAtual === 'Super Sete') {
        // Soma total de escolhas
        let escolhas = 0;
        let colunasComEscolha = 0;
        for (let c = 0; c < 7; c++) {
            const set = _fSuperSeteSelecionados[c];
            if (set && set.size > 0) {
                escolhas += set.size;
                colunasComEscolha++;
            }
        }
        totalSel = escolhas;
        tvSel.textContent = totalSel;

        if (colunasComEscolha === 0) {
            tvComb.textContent = 'Selecione números';
            tvComb.className = 'combinacoes';
            btn.disabled = true;
            aviso.classList.remove('visible');
            return;
        }

        if (colunasComEscolha < 7) {
            tvComb.textContent = '⚠ Selecione em todas as 7 colunas';
            tvComb.className = 'combinacoes warning';
            btn.disabled = true;
            aviso.classList.remove('visible');
            return;
        }

        // Total de combinações = produto das escolhas por coluna
        totalJogos = 1;
        for (let c = 0; c < 7; c++) {
            totalJogos *= _fSuperSeteSelecionados[c].size;
        }
    } else {
        totalSel = _fNumerosSelecionados.size;
        tvSel.textContent = totalSel;

        const cfg = FECHAMENTO_LOTERIAS[_fLoteriaAtual];
        if (!cfg) return;

        if (totalSel < cfg.numerosSorteados) {
            tvComb.textContent = 'Selecione pelo menos ' + cfg.numerosSorteados + ' números';
            tvComb.className = 'combinacoes';
            btn.disabled = true;
            aviso.classList.remove('visible');
            return;
        }

        totalJogos = calcularJogosNecessarios(_fLoteriaAtual, null, totalSel);
    }

    // Verifica limite
    if (totalJogos > FECHAMENTO_LIMITE_JOGOS) {
        tvComb.textContent = totalJogos.toLocaleString('pt-BR') + ' jogos (acima do limite)';
        tvComb.className = 'combinacoes danger';
        aviso.classList.add('visible');
        avisoTxt.textContent =
            'Este fechamento exige ' + totalJogos.toLocaleString('pt-BR') +
            ' jogos, acima do limite de ' + FECHAMENTO_LIMITE_JOGOS.toLocaleString('pt-BR') +
            '. Reduza a quantidade de números para continuar.';
        btn.disabled = true;
    } else {
        tvComb.textContent = totalJogos.toLocaleString('pt-BR') + ' jogos';
        tvComb.className = 'combinacoes ok';
        aviso.classList.remove('visible');
        btn.disabled = totalJogos <= 0;
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const cfg = FECHAMENTO_LOTERIAS[_fLoteriaAtual];
    _fObjetivoAtual = cfg.objetivos[0].id;

    renderLoteriaGrid();
    renderObjetivoGrid();
    renderVolante();
    atualizarPreview();

    const btn = document.getElementById('btnGerar');
    if (btn) btn.addEventListener('click', gerarFechamento);

    const saveAll = document.getElementById('saveAllBtn');
    if (saveAll) saveAll.addEventListener('click', salvarTodosF);
});

// ============================================================
// GERAÇÃO DO FECHAMENTO
// ============================================================
function gerarFechamento() {
    const btn = document.getElementById('btnGerar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando...';

    setTimeout(() => {
        if (_fLoteriaAtual === 'Super Sete') {
            _fJogosGerados = gerarFechamentoSuperSete();
        } else {
            _fJogosGerados = gerarFechamentoNormal();
        }

        renderJogosGerados();
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Gerar Fechamento';

        console.log('[fechamento] ' + _fJogosGerados.length + ' jogos gerados');
    }, 50);
}

function gerarFechamentoNormal() {
    const cfg = FECHAMENTO_LOTERIAS[_fLoteriaAtual];
    const S = cfg.numerosSorteados;
    const nums = Array.from(_fNumerosSelecionados).sort((a, b) => a - b);

    // Gera TODAS as combinações de S números dos N selecionados
    const combinacoes = [];
    function combinar(inicio, atual) {
        if (atual.length === S) {
            combinacoes.push([...atual]);
            return;
        }
        for (let i = inicio; i < nums.length; i++) {
            atual.push(nums[i]);
            combinar(i + 1, atual);
            atual.pop();
        }
    }
    combinar(0, []);

    // Limita (não vai ultrapassar pois já validamos antes)
    return combinacoes.slice(0, FECHAMENTO_LIMITE_JOGOS);
}

function gerarFechamentoSuperSete() {
    const colunas = [];
    for (let c = 0; c < 7; c++) {
        colunas.push(Array.from(_fSuperSeteSelecionados[c] || []));
    }

    // Produto cartesiano das 7 colunas
    const jogos = [];
    function combinar(colIdx, atual) {
        if (jogos.length >= FECHAMENTO_LIMITE_JOGOS) return;
        if (colIdx === 7) {
            jogos.push([...atual]);
            return;
        }
        for (const num of colunas[colIdx]) {
            atual.push(num);
            combinar(colIdx + 1, atual);
            atual.pop();
            if (jogos.length >= FECHAMENTO_LIMITE_JOGOS) return;
        }
    }
    combinar(0, []);
    return jogos;
}

// ============================================================
// RENDERIZAR JOGOS
// ============================================================
function renderJogosGerados() {
    const area = document.getElementById('resultsArea');
    const lista = document.getElementById('gamesList');
    const tvQtd = document.getElementById('tvQtdJogos');
    const cfg = FECHAMENTO_LOTERIAS[_fLoteriaAtual];

    if (!area || !lista) return;

    area.classList.add('visible');
    tvQtd.textContent = _fJogosGerados.length;

    if (_fLoteriaAtual === 'Super Sete') {
        lista.innerHTML = _fJogosGerados.map((jogo, i) => {
            const nums = jogo.map((n, c) => `<span style="display:inline-flex;flex-direction:column;align-items:center;margin:0 4px;">
                <span style="font-size:9px;color:#94a3b8;">C${c+1}</span>
                <span style="font-weight:700;">${n}</span>
            </span>`).join('');
            return `<div class="game-row">
                <div>
                    <span class="game-numbers">Jogo ${i+1}:</span>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${nums}</div>
                </div>
                <button class="btn-save" onclick="salvarJogoF([${jogo.join(',')}], ${i+1})">
                    <i class="fa-solid fa-bookmark"></i> Salvar
                </button>
            </div>`;
        }).join('');
    } else {
        lista.innerHTML = _fJogosGerados.map((jogo, i) => {
            const soma = jogo.reduce((a, b) => a + b, 0);
            const pares = jogo.filter(n => n % 2 === 0).length;
            const nums = jogo.map(n => String(n).padStart(2, '0')).join(' - ');
            return `<div class="game-row">
                <div>
                    <span class="game-numbers">Jogo ${i+1}: ${nums}</span>
                    <div style="font-size:0.75rem;color:#64748b;margin-top:4px;">
                        Soma: <strong>${soma}</strong> · Pares: <strong>${pares}</strong> · Ímpares: <strong>${jogo.length - pares}</strong>
                    </div>
                </div>
                <button class="btn-save" onclick="salvarJogoF([${jogo.join(',')}], ${i+1})">
                    <i class="fa-solid fa-bookmark"></i> Salvar
                </button>
            </div>`;
        }).join('');
    }

    // Rola até os resultados
    setTimeout(() => {
        area.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ============================================================
// SALVAR
// ============================================================
function salvarJogoF(jogo, numero) {
    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
    salvos.push({
        loteria: _fLoteriaAtual,
        numeros: jogo,
        data: new Date().toISOString(),
        origem: 'Fechamento: ' + _fLoteriaAtual
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));
    alert('✅ Jogo ' + numero + ' salvo!');
}

function salvarTodosF() {
    if (_fJogosGerados.length === 0) return;
    const salvos = JSON.parse(localStorage.getItem('jogos_salvos') || '[]');
    _fJogosGerados.forEach(jogo => {
        salvos.push({
            loteria: _fLoteriaAtual,
            numeros: jogo,
            data: new Date().toISOString(),
            origem: 'Fechamento'
        });
    });
    localStorage.setItem('jogos_salvos', JSON.stringify(salvos));
    alert('✅ ' + _fJogosGerados.length + ' jogos salvos!');
}

// ============================================================
// WHATSAPP
// ============================================================
function compartilharTodosWhatsAppF() {
    if (_fJogosGerados.length === 0) { alert('Nenhum jogo.'); return; }
    let msg = '🔮 *Fechamento Matemático - ' + _fLoteriaAtual + '*\n';
    msg += '📊 ' + _fJogosGerados.length + ' jogos\n\n';
    _fJogosGerados.slice(0, 30).forEach((jogo, i) => {
        msg += '🎯 Jogo ' + (i+1) + ': ' + jogo.map(n => String(n).padStart(2, '0')).join(' - ') + '\n';
    });
    if (_fJogosGerados.length > 30) {
        msg += '\n... e mais ' + (_fJogosGerados.length - 30) + ' jogos.';
    }
    msg += '\n\n🍀 geradordejogosloterias.com.br';
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

// ============================================================
// IMPRIMIR PDF
// ============================================================
function imprimirTodosF() {
    if (_fJogosGerados.length === 0) { alert('Nenhum jogo.'); return; }
    const dataHora = new Date().toLocaleString('pt-BR');
    const total = _fJogosGerados.length;

    let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fechamento - ' + _fLoteriaAtual + '</title><style>' +
        '@page { margin: 10mm; }' +
        'body { font-family: Arial, sans-serif; padding: 15px; }' +
        '.header { text-align: center; border-bottom: 3px solid #7b1fa2; padding-bottom: 12px; margin-bottom: 18px; }' +
        '.header h1 { color: #7b1fa2; }' +
        '.stats-gerais { display: flex; justify-content: center; gap: 25px; padding: 10px; background: #f3e8ff; border-radius: 8px; font-size: 12px; margin-bottom: 18px; }' +
        '.stats-gerais strong { color: #7b1fa2; font-size: 14px; }' +
        '.jogos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }' +
        '.jogo-card { border: 1.5px solid #7b1fa2; border-radius: 6px; padding: 8px 10px; background: #faf5ff; page-break-inside: avoid; }' +
        '.jogo-num { color: #7b1fa2; font-size: 11px; font-weight: bold; }' +
        '.numeros { font-size: 13px; font-weight: bold; text-align: center; margin-top: 4px; }' +
        '.footer { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 10px; }' +
        '</style></head><body>' +
        '<div class="header"><h1>🔮 Fechamento Matemático</h1><p>' + _fLoteriaAtual + ' — ' + dataHora + '</p></div>' +
        '<div class="stats-gerais"><span><strong>' + total + '</strong> jogos</span><span>Garantia 100%</span></div>' +
        '<div class="jogos-grid">';

    _fJogosGerados.forEach((jogo, i) => {
        const nums = _fLoteriaAtual === 'Super Sete'
            ? jogo.join(' - ')
            : jogo.map(n => String(n).padStart(2, '0')).join(' - ');
        html += '<div class="jogo-card"><div class="jogo-num">JOGO ' + (i+1) + '</div><div class="numeros">' + nums + '</div></div>';
    });

    html += '</div><div class="footer"><strong>🍀 geradordejogosloterias.com.br</strong></div></body></html>';

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
}

// ============================================================
// CONFERIR COM HISTÓRICO
// ============================================================
async function conferirHistoricoF() {
    if (_fJogosGerados.length === 0) { alert('Nenhum jogo.'); return; }

    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conferindo...';

    try {
        const historico = await carregarHistoricoFechamento(_fLoteriaAtual);
        if (historico.length === 0) {
            alert('Histórico não disponível.');
            btn.disabled = false;
            btn.innerHTML = originalText;
            return;
        }

        const cfg = FECHAMENTO_LOTERIAS[_fLoteriaAtual];
        const objetivoAcertos = cfg.objetivos.find(o => o.id === _fObjetivoAtual)?.acertos || 0;

        let jogosComAcerto = 0;
        let melhorAcerto = 0;
        let totalAcertos = 0;

        historico.forEach(draw => {
            const dezenas = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
            _fJogosGerados.forEach(jogo => {
                let acertos = 0;
                if (_fLoteriaAtual === 'Super Sete') {
                    // Compara por coluna
                    for (let c = 0; c < 7; c++) {
                        if (jogo[c] === dezenas[c]) acertos++;
                    }
                } else {
                    acertos = jogo.filter(n => dezenas.includes(n)).length;
                }
                if (acertos >= objetivoAcertos) jogosComAcerto++;
                if (acertos > melhorAcerto) melhorAcerto = acertos;
                totalAcertos += acertos;
            });
        });

        const msg =
            '🔍 CONFERÊNCIA COM HISTÓRICO\n\n' +
            '🎲 Loteria: ' + _fLoteriaAtual + '\n' +
            '🎯 Objetivo: ' + objetivoAcertos + ' acertos\n' +
            '📊 Jogos analisados: ' + _fJogosGerados.length + '\n' +
            '📅 Concursos no histórico: ' + historico.length + '\n\n' +
            '🏆 Melhor acerto: ' + melhorAcerto + '\n' +
            '🎉 Total de acertos ≥ objetivo: ' + jogosComAcerto + '\n' +
            '📈 Média de acertos: ' + (totalAcertos / (_fJogosGerados.length * historico.length)).toFixed(2);

        alert(msg);
    } catch (e) {
        console.error(e);
        alert('Erro ao conferir: ' + e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// ============================================================
// Deixa as funções globais para onclick
// ============================================================
window.salvarJogoF = salvarJogoF;
window.compartilharTodosWhatsAppF = compartilharTodosWhatsAppF;
window.imprimirTodosF = imprimirTodosF;
window.conferirHistoricoF = conferirHistoricoF;
window.salvarTodosF = salvarTodosF;