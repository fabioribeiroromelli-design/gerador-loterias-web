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
    garantirBotaoConferir();
    initEvents();
    renderSavedGames();
});

function garantirBotaoConferir() {
    let btnConferir = document.getElementById('btn-conferir');
    const btnClear = document.getElementById('btn_clear_all_saved');

    if (!btnConferir && btnClear) {
        btnConferir = document.createElement('button');
        btnConferir.id = 'btn-conferir';
        btnConferir.innerHTML = '<i class="fa-solid fa-circle-check"></i> Conferir Jogos';
        btnConferir.style.cssText = "background: #27ae60; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 0.95rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-right: 10px;";
        
        btnClear.parentNode.insertBefore(btnConferir, btnClear);
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
            renderSavedGames();
        });
    });

    const btnClear = document.getElementById('btn_clear_all_saved');
    if (btnClear) {
        btnClear.addEventListener('click', clearCurrentLotteryGames);
    }

    const btnConferir = document.getElementById('btn-conferir');
    if (btnConferir) {
        btnConferir.addEventListener('click', conferirJogosSalvos);
    }
}

function normalizarNomeLoteria(nome) {
    if (!nome) return '';
    return nome.toString()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '');
}

function ObterTodosJogosSalvos() {
    const listaGeral = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
    const listaLotomania = JSON.parse(localStorage.getItem('jogos_salvos_lotomania') || '[]');
    const listaLotofacil = JSON.parse(localStorage.getItem('jogos_salvos_lotofacil') || '[]');

    const lotofacilNormalizada = listaLotofacil.map(item => ({
        id: item.id || Date.now() + Math.random(),
        loteria: 'Lotofácil',
        data: item.data || new Date().toLocaleDateString('pt-BR'),
        numeros: item.numeros || item.dezenas || []
    }));

    const lotomaniaNormalizada = listaLotomania.map(item => ({
        id: item.id || Date.now() + Math.random(),
        loteria: 'Lotomania',
        data: item.data || new Date().toLocaleDateString('pt-BR'),
        numeros: item.numeros || item.dezenas || []
    }));

    const geralNormalizada = listaGeral.map(item => ({
        id: item.id || Date.now() + Math.random(),
        loteria: item.loteria || item.modalidade || 'Lotofácil',
        data: item.data || new Date().toLocaleDateString('pt-BR'),
        numeros: item.numeros || item.dezenas || []
    }));

    return [...geralNormalizada, ...lotomaniaNormalizada, ...lotofacilNormalizada];
}

function renderSavedGames() {
    const container = document.getElementById('saved_games_list') || document.getElementById('container-salvos');
    if (!container) return;
    container.innerHTML = '';

    const allSaved = ObterTodosJogosSalvos();
    const filterKey = normalizarNomeLoteria(currentFilter);

    const filtered = allSaved.filter(item => {
        const lotKey = normalizarNomeLoteria(item.loteria);
        return lotKey === filterKey || lotKey.includes(filterKey) || filterKey.includes(lotKey);
    });

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

        let htmlDezenas = '';
        
        if (filterKey === 'SUPER_SETE' && Array.isArray(numerosArray)) {
            htmlDezenas = numerosArray.map((val, idx) => `<span style="background:#e0f2fe; color:#0369a1; padding:6px 10px; border-radius:6px; font-weight:bold; font-size:0.9rem;">C${idx + 1}:${val}</span>`).join(' ');
        } else if (Array.isArray(numerosArray)) {
            htmlDezenas = numerosArray.map(n => 
                `<span style="background:#f1f5f9; color:#1e293b; border: 1px solid #cbd5e1; border-radius:50%; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; font-weight:bold; font-size:0.95rem; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">${String(n).padStart(2, '0')}</span>`
            ).join('');
        }

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
    localStorage.removeItem('jogos_salvos_lotomania');
    localStorage.removeItem('jogos_salvos_lotofacil');

    renderSavedGames();
}

function clearCurrentLotteryGames() {
    let allSaved = ObterTodosJogosSalvos();
    const filterKey = normalizarNomeLoteria(currentFilter);
    
    const remaining = allSaved.filter(item => {
        const lotKey = normalizarNomeLoteria(item.loteria);
        return lotKey !== filterKey && !lotKey.includes(filterKey);
    });

    if (allSaved.length === remaining.length) {
        alert("Não há jogos salvos para apagar nesta loteria.");
        return;
    }

    if (confirm(`Tem certeza que deseja apagar todos os jogos salvos de ${LOTTERY_NAMES[currentFilter] || currentFilter}?`)) {
        localStorage.setItem('saved_games_list', JSON.stringify(remaining));
        localStorage.removeItem('jogos_salvos_lotomania');
        localStorage.removeItem('jogos_salvos_lotofacil');
        renderSavedGames();
    }
}

function conferirJogosSalvos() {
    const filterKey = normalizarNomeLoteria(currentFilter);
    
    const historicosGlobais = {
        LOTOFACIL: window.HISTORICO_LOTOFACIL || window.historicoLotofacil || window.lotofacilData,
        LOTOMANIA: window.HISTORICO_LOTOMANIA || window.historicoLotomania || window.lotomaniaData,
        MEGA_SENA: window.HISTORICO_MEGASENA || window.historicoMegasena || window.megasenaData,
        QUINA: window.HISTORICO_QUINA || window.historicoQuina || window.quinaData,
        TIMEMANIA: window.HISTORICO_TIMEMANIA || window.historicoTimemania,
        DUPLA_SENA: window.HISTORICO_DUPLASENA || window.historicoDuplasena,
        DIA_DE_SORTE: window.HISTORICO_DIADESORTE || window.historicoDiadesorte,
        SUPER_SETE: window.HISTORICO_SUPERSETE || window.historicoSupersete,
        MAIS_MILIONARIA: window.HISTORICO_MILIONARIA || window.historicoMilionaria
    };

    let historico = historicosGlobais[filterKey];

    if (!historico || !Array.isArray(historico) || historico.length === 0) {
        const chaveStorage = `historico_${filterKey.toLowerCase()}`;
        const dadosStorage = localStorage.getItem(chaveStorage) || localStorage.getItem('historico_loterias') || localStorage.getItem('ultimos_resultados');
        if (dadosStorage) {
            try {
                const parsed = JSON.parse(dadosStorage);
                historico = Array.isArray(parsed) ? parsed : (parsed[filterKey] || parsed[filterKey.toLowerCase()]);
            } catch (e) {
                console.warn('Erro ao ler histórico do localStorage:', e);
            }
        }
    }

    let dezenasSorteadas = new Set();
    let numConcurso = '';

    if (historico && Array.isArray(historico) && historico.length > 0) {
        const ultimoConcurso = [...historico].sort((a, b) => Number(b.concurso || b.numero) - Number(a.concurso || a.numero))[0];
        
        const dezenasRaw = ultimoConcurso.dezenas || ultimoConcurso.dezenasSorteadas || ultimoConcurso.numeros || [];
        // Converte tudo para número para comparação limpa
        dezenasSorteadas = new Set(dezenasRaw.map(n => Number(n)));
        numConcurso = `Concurso ${ultimoConcurso.concurso || ultimoConcurso.numero || 'Último Salvo'}`;
    } else {
        alert(`Não foi encontrado nenhum histórico salvo para ${LOTTERY_NAMES[currentFilter] || currentFilter}. Carregue os resultados na tela principal primeiro.`);
        return;
    }

    const allSaved = ObterTodosJogosSalvos();
    let jogosConferidos = 0;

    allSaved.forEach(item => {
        const lotKey = normalizarNomeLoteria(item.loteria);
        if (lotKey !== filterKey && !lotKey.includes(filterKey)) return;

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
                // Bola VERDE para acerto
                htmlDezenas += `<span style="background: #22c55e; color: #ffffff; border-radius: 50%; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; box-shadow: 0 3px 8px rgba(34,197,94,0.5); border: 2px solid #16a34a;">${String(dez).padStart(2, '0')}</span>`;
            } else {
                // Bola CINZA apagada para erro
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

    // Renderiza primeiro os elementos na tela antes de disparar a mensagem final
    setTimeout(() => {
        if (jogosConferidos > 0) {
            alert(`Conferência realizada com sucesso com base no ${numConcurso}! Os acertos estão destacados em verde.`);
        }
    }, 100);
}