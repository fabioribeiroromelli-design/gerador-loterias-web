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
    initEvents();
    renderSavedGames();
});

function initEvents() {
    document.querySelectorAll('.lottery-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.lottery-card-btn').forEach(b => b.classList.remove('active'));
            
            const target = e.currentTarget;
            target.classList.add('active');
            currentFilter = target.getAttribute('data-type');
            
            document.getElementById('selected_title').textContent = `Exibindo: ${LOTTERY_NAMES[currentFilter] || currentFilter}`;
            renderSavedGames();
        });
    });

    document.getElementById('btn_clear_all_saved').addEventListener('click', clearCurrentLotteryGames);
}

function renderSavedGames() {
    const container = document.getElementById('saved_games_list');
    container.innerHTML = '';

    const allSaved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');

    // Filtra os jogos tratando tanto as chaves como o nome direto da loteria
    const filtered = allSaved.filter(item => {
        const lot = (item.loteria || '').toUpperCase().replace(/\s+/g, '_');
        return lot === currentFilter || item.loteria === LOTTERY_NAMES[currentFilter];
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                <i class="fa-regular fa-folder-open" style="font-size: 40px; color: #bdc3c7; margin-bottom: 10px;"></i>
                <p style="color: #7f8c8d; margin: 0;">Nenhum jogo salvo para <strong>${LOTTERY_NAMES[currentFilter]}</strong>.</p>
            </div>
        `;
        return;
    }

    filtered.forEach((item, index) => {
        let gameFormatted = "";

        if (currentFilter === 'SUPER_SETE' && Array.isArray(item.numeros)) {
            gameFormatted = item.numeros.map((val, idx) => `[C${idx + 1}: ${val}]`).join(' ');
        } else if (Array.isArray(item.numeros)) {
            gameFormatted = item.numeros.map(n => String(n).padStart(2, '0')).join(' - ');
        } else {
            gameFormatted = item.numeros;
        }

        const card = document.createElement('div');
        card.className = 'game-item-card';
        card.innerHTML = `
            <div>
                <div class="game-numbers">Jogo ${index + 1}: ${gameFormatted}</div>
                <div class="game-date"><i class="fa-regular fa-calendar"></i> Salvo em: ${item.data || 'Data indisponível'}</div>
            </div>
            <button onclick="removeSingleGame(${allSaved.indexOf(item)})" style="background: #ffecb3; color: #c0392b; border: 1px solid #ffe082; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;">
                <i class="fa-solid fa-trash-can"></i> Excluir
            </button>
        `;
        container.appendChild(card);
    });
}

function removeSingleGame(globalIndex) {
    let allSaved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
    if (globalIndex >= 0 && globalIndex < allSaved.length) {
        allSaved.splice(globalIndex, 1);
        localStorage.setItem('saved_games_list', JSON.stringify(allSaved));
        renderSavedGames();
    }
}

function clearCurrentLotteryGames() {
    let allSaved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
    
    const remaining = allSaved.filter(item => {
        const lot = (item.loteria || '').toUpperCase().replace(/\s+/g, '_');
        return lot !== currentFilter && item.loteria !== LOTTERY_NAMES[currentFilter];
    });

    if (allSaved.length === remaining.length) {
        alert("Não há jogos salvos para apagar nesta loteria.");
        return;
    }

    if (confirm(`Tem certeza que deseja apagar todos os jogos salvos de ${LOTTERY_NAMES[currentFilter]}?`)) {
        localStorage.setItem('saved_games_list', JSON.stringify(remaining));
        renderSavedGames();
    }
}