document.addEventListener('DOMContentLoaded', () => {
    const selectType = document.getElementById('select_saved_type');
    const btnClearAll = document.getElementById('btn_clear_all_saved');

    const urlParams = new URLSearchParams(window.location.search);
    let currentLottery = (urlParams.get('type') || (selectType ? selectType.value : 'LOTOFACIL')).toUpperCase();

    if (selectType) {
        selectType.value = currentLottery;
        selectType.addEventListener('change', (e) => {
            currentLottery = e.target.value;
            loadSavedGames(currentLottery);
        });
    }

    if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
            const savedKey = `saved_games_${currentLottery}`;
            if (confirm(`Tem certeza que deseja apagar todos os jogos salvos da ${currentLottery.replace(/_/g, ' ')}?`)) {
                localStorage.removeItem(savedKey);
                loadSavedGames(currentLottery);
            }
        });
    }

    loadSavedGames(currentLottery);
});

function loadSavedGames(lotteryType) {
    const gamesListEl = document.getElementById('saved_games_list');
    if (!gamesListEl) return;

    const savedKey = `saved_games_${lotteryType}`;
    let savedGames = [];

    try {
        const rawData = localStorage.getItem(savedKey);
        savedGames = rawData ? JSON.parse(rawData) : [];
    } catch (err) {
        savedGames = [];
    }

    if (!Array.isArray(savedGames) || savedGames.length === 0) {
        gamesListEl.innerHTML = `
            <div style="background: #ffffff; padding: 25px; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0; margin-top: 15px; color: #555;">
                <i class="fa-solid fa-folder-open" style="font-size: 2rem; color: #ccc; margin-bottom: 10px; display: block;"></i>
                Nenhum jogo salvo para a loteria <strong>${lotteryType.replace(/_/g, ' ')}</strong>.
            </div>`;
        return;
    }

    gamesListEl.innerHTML = savedGames.map((gameData, index) => {
        let formattedNumbers = '';

        if (Array.isArray(gameData)) {
            formattedNumbers = gameData.map(n => String(n).padStart(2, '0')).join(' - ');
        } else if (gameData && typeof gameData === 'object') {
            if (gameData.numbers) {
                const nums = gameData.numbers.map(n => String(n).padStart(2, '0')).join(' - ');
                const trevos = gameData.trevos ? ` <strong style="color: #28a745;">[Trevos: ${gameData.trevos.map(t => String(t).padStart(2, '0')).join(' - ')}]</strong>` : '';
                formattedNumbers = `${nums}${trevos}`;
            } else {
                formattedNumbers = JSON.stringify(gameData);
            }
        }

        return `
            <div style="background: #ffffff; padding: 14px 18px; border-radius: 8px; margin-top: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                <div style="font-size: 0.95rem; color: #333;">
                    <strong style="color: #007bff;">Jogo ${index + 1}:</strong> ${formattedNumbers}
                </div>
                <button onclick="removeGame('${lotteryType}', ${index})" style="background: none; border: none; color: #dc3545; cursor: pointer; font-size: 1.1rem; padding: 6px 10px; border-radius: 4px;" title="Apagar este jogo">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

window.removeGame = function(lotteryType, index) {
    const savedKey = `saved_games_${lotteryType}`;
    try {
        let savedGames = JSON.parse(localStorage.getItem(savedKey) || '[]');
        savedGames.splice(index, 1);
        localStorage.setItem(savedKey, JSON.stringify(savedGames));
        loadSavedGames(lotteryType);
    } catch (err) {
        console.error("Erro ao apagar o jogo:", err);
    }
};