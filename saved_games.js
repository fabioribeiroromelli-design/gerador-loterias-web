let currentFilter = 'MEGA_SENA';

const LOTTERY_NAMES = {
    MEGA_SENA: 'Mega-Sena',
    LOTOFACIL: 'Lotofácil',
    QUINA: 'Quina',
    LOTOMANIA: 'Lotomania',
    TIMEMANIA: 'Timemania',
    DUPLA_SENA: 'Dupla Sena',
    DIA_DE_SORTE: 'Dia de Sorte',
    SUPER_SETE: 'Super Sete',
    MAIS_MILIONARIA: '+Milionária'
};

document.addEventListener('DOMContentLoaded', () => {
    garantirBotoesAcao();
    initEvents();
    renderSavedGames();
});

function garantirBotoesAcao() {
    let btnConferir = document.getElementById('btn-conferir');
    let btnDeleteAll = document.getElementById('btn_clear_everything');
    const btnClear = document.getElementById('btn_clear_all_saved');

    if (!btnConferir && btnClear) {
        btnConferir = document.createElement('button');
        btnConferir.id = 'btn-conferir';
        btnConferir.innerHTML = '<i class="fa-solid fa-circle-check"></i> Conferir Jogos';
        btnConferir.style.cssText = "background: #27ae60; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 0.95rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-right: 10px;";
        
        btnClear.parentNode.insertBefore(btnConferir, btnClear);
    }

    if (!btnDeleteAll && btnClear) {
        btnDeleteAll = document.createElement('button');
        btnDeleteAll.id = 'btn_clear_everything';
        btnDeleteAll.innerHTML = '<i class="fa-solid fa-dumpster"></i> Apagar TUDO (Reset)';
        btnDeleteAll.style.cssText = "background: #7f1d1d; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 0.95rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-left: 10px;";
        
        btnClear.parentNode.appendChild(btnDeleteAll);
    }
}

function initEvents() {
    document.querySelectorAll('.lottery-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.lottery-card-btn').forEach(b => b.classList.remove('active'));
            
            const target = e.currentTarget;
            target.classList.add('active');
            currentFilter = target.getAttribute('data-type') || 'MEGA_SENA';
            
            const titleElement = document.getElementById('selected_title');
            if (titleElement) {
                titleElement.textContent = `Exibindo: ${LOTTERY_NAMES[currentFilter] || currentFilter}`;
            }
            
            // Remove o painel do concurso anterior ao trocar de aba
            const painelAntigo = document.getElementById('painel-ultimo-concurso');
            if (painelAntigo) painelAntigo.remove();

            renderSavedGames();
        });
    });

    const btnClear = document.getElementById('btn_clear_all_saved');
    if (btnClear) btnClear.addEventListener('click', clearCurrentLotteryGames);

    const btnDeleteAll = document.getElementById('btn_clear_everything');
    if (btnDeleteAll) btnDeleteAll.addEventListener('click', clearAllGamesGlobally);

    const btnConferir = document.getElementById('btn-conferir');
    if (btnConferir) btnConferir.addEventListener('click', conferirJogosSalvos);
}

function normalizarNomeLoteria(nome) {
    if (!nome) return '';
    let limpo = nome.toString()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');

    if (limpo.includes('MEGA') || limpo.includes('SENA')) return 'MEGASENA';
    if (limpo.includes('LOTOFACIL')) return 'LOTOFACIL';
    if (limpo.includes('QUINA')) return 'QUINA';
    if (limpo.includes('LOTOMANIA')) return 'LOTOMANIA';
    if (limpo.includes('TIMEMANIA')) return 'TIMEMANIA';
    if (limpo.includes('DUPLA')) return 'DUPLASENA';
    if (limpo.includes('DIA') || limpo.includes('SORTE')) return 'DIADESORTE';
    if (limpo.includes('SUPER') || limpo.includes('SETE')) return 'SUPERSETE';
    if (limpo.includes('MILIONARIA')) return 'MAISMILIONARIA';

    return limpo;
}

function ObterTodosJogosSalvos() {
    let todos = [];

    // 1. Varre o localStorage inteiro procurando por qualquer chave que pareça conter jogos salvos
    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);
        
        // Verifica chaves comuns de salvamento no seu projeto
        if (chave && (chave.includes('saved') || chave.includes('jogo') || chave.includes('loter'))) {
            const raw = localStorage.getItem(chave);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    // Se for um array de jogos
                    if (Array.isArray(parsed)) {
                        parsed.forEach(item => {
                            if (item) {
                                todos.push({
                                    id: item.id || (Date.now() + Math.random()),
                                    loteria: item.loteria || item.modalidade || chave,
                                    data: item.data || new Date().toLocaleDateString('pt-BR'),
                                    numeros: item.numeros || item.dezenas || item.jogo || []
                                });
                            }
                        });
                    } else if (typeof parsed === 'object' && parsed !== null) {
                        // Caso seja salvo como objeto único ou dicionário
                        todos.push({
                            id: parsed.id || (Date.now() + Math.random()),
                            loteria: parsed.loteria || parsed.modalidade || chave,
                            data: parsed.data || new Date().toLocaleDateString('pt-BR'),
                            numeros: parsed.numeros || parsed.dezenas || parsed.jogo || []
                        });
                    }
                } catch (e) {
                    // Ignora se não for JSON válido
                }
            }
        }
    }

    // 2. Remove duplicatas baseadas no ID
    const unicos = new Map();
    todos.forEach(item => {
        if (item.numeros && item.numeros.length > 0) {
            unicos.set(String(item.id), item);
        }
    });

    return Array.from(unicos.values());
}

function renderSavedGames() {
    const container = document.getElementById('saved_games_list') || document.getElementById('container-salvos');
    if (!container) return;
    container.innerHTML = '';

    const allSaved = ObterTodosJogosSalvos();
    const filterKey = normalizarNomeLoteria(currentFilter);

    const filtered = allSaved.filter(item => normalizarNomeLoteria(item.loteria) === filterKey);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <i class="fa-regular fa-folder-open" style="font-size: 44px; color: #cbd5e1; margin-bottom: 12px;"></i>
                <p style="color: #64748b; margin: 0; font-size: 1rem;">Nenhum jogo salvo para <strong>${LOTTERY_NAMES[currentFilter] || currentFilter}</strong>.</p>
            </div>
        `;
        return;
    }

    filtered.forEach((item, index) => {
        const numerosArray = item.numeros || [];
        let htmlDezenas = numerosArray.map(n => 
            `<span style="background:#f1f5f9; color:#1e293b; border: 1px solid #cbd5e1; border-radius:50%; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; font-weight:bold; font-size:0.95rem; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">${String(n).padStart(2, '0')}</span>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'game-item-card';
        card.style.cssText = "background: #ffffff; color: #1e293b; border-radius: 12px; padding: 18px; margin-bottom: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);";

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                <div>
                    <strong style="color: #0f766e; font-size: 1.05rem;">Jogo ${index + 1} (${numerosArray.length} Dezenas)</strong>
                    <div style="font-size: 0.85rem; color: #64748b; margin-top: 2px;"><i class="fa-regular fa-calendar"></i> ${item.data || 'Data indisponível'}</div>
                </div>
                <button onclick="removeSingleGame('${item.id}')" style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.85rem; transition: 0.2s;">
                    <i class="fa-solid fa-trash-can"></i> Excluir
                </button>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;" id="grid-jogo-${item.id}">
                ${htmlDezenas}
            </div>
            <div id="info-acertos-${item.id}" style="font-size: 0.95rem; margin-top: 12px; font-weight: bold;"></div>
        `;

        container.appendChild(card);
    });
}

function removeSingleGame(gameId) {
    let allSaved = ObterTodosJogosSalvos();
    const updated = allSaved.filter(item => String(item.id) !== String(gameId));

    localStorage.setItem('saved_games_list', JSON.stringify(updated));
    localStorage.removeItem('jogos_salvos');
    localStorage.removeItem('jogos_salvos_megasena');
    renderSavedGames();
}

function clearCurrentLotteryGames() {
    let allSaved = ObterTodosJogosSalvos();
    const filterKey = normalizarNomeLoteria(currentFilter);
    const remaining = allSaved.filter(item => normalizarNomeLoteria(item.loteria) !== filterKey);

    if (allSaved.length === remaining.length) {
        alert("Não há jogos salvos para apagar nesta loteria.");
        return;
    }

    if (confirm(`Tem certeza que deseja apagar todos os jogos salvos de ${LOTTERY_NAMES[currentFilter] || currentFilter}?`)) {
        localStorage.setItem('saved_games_list', JSON.stringify(remaining));
        localStorage.removeItem('jogos_salvos');
        localStorage.removeItem('jogos_salvos_megasena');
        renderSavedGames();
    }
}

function clearAllGamesGlobally() {
    const allSaved = ObterTodosJogosSalvos();
    if (allSaved.length === 0) {
        alert("Não há nenhum jogo salvo no navegador para deletar.");
        return;
    }

    if (confirm("⚠️ ATENÇÃO: Deseja apagar TODOS os jogos salvos de TODAS as loterias do seu computador? Esta ação não pode ser desfeita.")) {
        localStorage.removeItem('saved_games_list');
        localStorage.removeItem('jogos_salvos');
        localStorage.removeItem('jogos_salvos_megasena');

        Object.keys(localStorage).forEach(key => {
            if (key.includes('jogo') || key.includes('saved')) {
                localStorage.removeItem(key);
            }
        });

        alert("Todos os jogos foram excluídos com sucesso do seu PC!");
        renderSavedGames();
    }
}

function exibirPainelUltimoConcurso(numConcurso, dezenasArray) {
    const container = document.getElementById('saved_games_list') || document.getElementById('container-salvos');
    if (!container) return;

    let painel = document.getElementById('painel-ultimo-concurso');
    if (!painel) {
        painel = document.createElement('div');
        painel.id = 'painel-ultimo-concurso';
        container.parentNode.insertBefore(painel, container);
    }

    const htmlResultado = dezenasArray.map(d => 
        `<span style="background: #1e293b; color: #f8fafc; border-radius: 50%; width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem;">${String(d).padStart(2, '0')}</span>`
    ).join('');

    painel.style.cssText = "background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);";
    painel.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div>
                <strong style="color: #166534; font-size: 1rem;"><i class="fa-solid fa-trophy" style="color: #eab308;"></i> ${LOTTERY_NAMES[currentFilter] || currentFilter} - ${numConcurso}</strong>
                <div style="font-size: 0.8rem; color: #15803d; margin-top: 2px;">Dezenas sorteadas para conferência:</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${htmlResultado}
            </div>
        </div>
    `;
}

function conferirJogosSalvos() {
    const filterKey = normalizarNomeLoteria(currentFilter);
    let historico = null;

    const buscas = [
        window[`HISTORICO_${filterKey}`],
        window[`historico_${filterKey.toLowerCase()}`],
        window[`${filterKey.toLowerCase()}Data`],
        window.HISTORICO_MEGASENA,
        window.HISTORICO_DUPLASENA,
        window.HISTORICO_DIADESORTE,
        window.HISTORICO_SUPERSETE,
        window.HISTORICO_MILIONARIA,
        window.HISTORICO_MAISMILIONARIA
    ];

    for (let h of buscas) {
        if (h && Array.isArray(h) && h.length > 0) {
            historico = h;
            break;
        }
    }

    if (!historico) {
        const localKeys = [`historico_${filterKey.toLowerCase()}`, `historico_${filterKey}`, 'historico_loterias'];
        for (let key of localKeys) {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        historico = parsed;
                        break;
                    }
                } catch (e) {}
            }
        }
    }

    let dezenasSorteadas = new Set();
    let dezenasArraySorteio = [];
    let numConcurso = '';

    if (historico && Array.isArray(historico) && historico.length > 0) {
        const ultimoConcurso = [...historico].sort((a, b) => Number(b.concurso || b.numero || 0) - Number(a.concurso || a.numero || 0))[0];
        
        const dezenasRaw = ultimoConcurso.dezenas || ultimoConcurso.dezenasSorteadas || ultimoConcurso.numeros || ultimoConcurso.resultado || [];
        dezenasArraySorteio = dezenasRaw.map(n => Number(n)).sort((a, b) => a - b);
        dezenasSorteadas = new Set(dezenasArraySorteio);
        numConcurso = `Concurso ${ultimoConcurso.concurso || ultimoConcurso.numero || 'Último Salvo'}`;
    } else {
        alert(`Não foi encontrado nenhum histórico salvo para ${LOTTERY_NAMES[currentFilter] || currentFilter}. Abra a tela de resultados/histórico desta loteria primeiro para carregar os dados no navegador.`);
        return;
    }

    // Exibe o painel visual com o último concurso sorteado
    exibirPainelUltimoConcurso(numConcurso, dezenasArraySorteio);

    const allSaved = ObterTodosJogosSalvos();
    let jogosConferidos = 0;

    // Renderiza primeiro na tela
    allSaved.forEach(item => {
        if (normalizarNomeLoteria(item.loteria) !== filterKey) return;

        jogosConferidos++;
        const dezenasJogo = item.numeros || [];
        const gridElement = document.getElementById(`grid-jogo-${item.id}`);
        const infoElement = document.getElementById(`info-acertos-${item.id}`);

        if (!gridElement) return;

        let acertosCount = 0;
        let htmlDezenas = '';

        dezenasJogo.forEach(dez => {
            const numDezena = Number(dez);
            const ehAcerto = dezenasSorteadas.has(numDezena);
            
            if (ehAcerto) {
                acertosCount++;
                htmlDezenas += `<span style="background: #22c55e; color: #ffffff; border-radius: 50%; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; box-shadow: 0 3px 8px rgba(34,197,94,0.5); border: 2px solid #16a34a;">${String(dez).padStart(2, '0')}</span>`;
            } else {
                htmlDezenas += `<span style="background: #f8fafc; color: #cbd5e1; border: 1px dashed #e2e8f0; border-radius: 50%; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; font-weight: normal; font-size: 0.85rem;">${String(dez).padStart(2, '0')}</span>`;
            }
        });

        gridElement.innerHTML = htmlDezenas;

        if (infoElement) {
            infoElement.innerHTML = `
                <span style="color: #15803d; background: #dcfce7; padding: 6px 14px; border-radius: 8px; border: 1px solid #bbf7d0; display: inline-block; margin-top: 8px; font-weight: bold;">
                    🎯 ${acertosCount} acertos (${numConcurso})
                </span>
            `;
        }
    });

    // O setTimeout de 50ms garante que o navegador renderize as cores e o painel na tela ANTES de bloquear a tela com o alert
    if (jogosConferidos > 0) {
        setTimeout(() => {
            alert(`Conferência realizada com sucesso para ${numConcurso}! Os acertos estão destacados em verde.`);
        }, 50);
    }
}