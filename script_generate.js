const i18n = {
    pt: { title: "Gerar Jogos", qtdGames: "Qtd. Jogos:", totalDecs: "Dezenas p/ Jogo:", volanteTitle: "Volante de Seleção", btnGenerate: "🎲 Gerar Jogos", btnCheck: "✅ Conferir Jogos", btnSave: "💾 Salvar Jogos", btnClear: "Limpar Seleções", resultsTitle: "Jogos Gerados", gameNamePlaceholder: "Nome do jogo (Opcional)", fixedStatus: "Fixos", excludedStatus: "Excluídos" },
    en: { title: "Generate Games", qtdGames: "Games Qty:", totalDecs: "Numbers per Game:", volanteTitle: "Selection Board", btnGenerate: "🎲 Generate Games", btnCheck: "✅ Check Games", btnSave: "💾 Save Games", btnClear: "Clear Selections", resultsTitle: "Generated Games", gameNamePlaceholder: "Game name (Optional)", fixedStatus: "Fixed", excludedStatus: "Excluded" },
    es: { title: "Generar Juegos", qtdGames: "Cant. Juegos:", totalDecs: "Números por Juego:", volanteTitle: "Volante de Selección", btnGenerate: "🎲 Generar Juegos", btnCheck: "✅ Comprobar Juegos", btnSave: "💾 Guardar Juegos", btnClear: "Limpiar Selecciones", resultsTitle: "Juegos Generados", gameNamePlaceholder: "Nombre del juego (Opcional)", fixedStatus: "Fijos", excludedStatus: "Excluidos" }
};

const lotteryConfigs = {
    MEGA_SENA: { name: "Mega-Sena", minNum: 1, maxNum: 60, minPick: 6, maxPick: 20, cols: 10 },
    LOTOFACIL: { name: "Lotofácil", minNum: 1, maxNum: 25, minPick: 15, maxPick: 20, cols: 5 },
    QUINA: { name: "Quina", minNum: 1, maxNum: 80, minPick: 5, maxPick: 15, cols: 10 },
    LOTOMANIA: { name: "Lotomania", minNum: 0, maxNum: 99, minPick: 50, maxPick: 50, cols: 10 },
    TIMEMANIA: { name: "Timemania", minNum: 1, maxNum: 80, minPick: 10, maxPick: 10, cols: 10 },
    DUPLA_SENA: { name: "Dupla Sena", minNum: 1, maxNum: 50, minPick: 6, maxPick: 15, cols: 10 },
    DIA_DE_SORTE: { name: "Dia de Sorte", minNum: 1, maxNum: 31, minPick: 7, maxPick: 15, cols: 7 },
    SUPER_SETE: { name: "Super Sete", minNum: 0, maxNum: 9, minPick: 7, maxPick: 21, cols: 10 },
    MAIS_MILIONARIA: { name: "+Milionária", minNum: 1, maxNum: 50, minPick: 6, maxPick: 12, cols: 10 },
    LOTECA: { name: "Loteca", minNum: 1, maxNum: 14, minPick: 14, maxPick: 14, cols: 7 }
};

let currentLang = 'pt';
let activeLotteryKey = 'MEGA_SENA';
let numberStates = {};
let generatedGames = [];

window.onload = () => {
    // Ler qual loteria foi passada no parâmetro da URL (ex: index.html?type=DIA_DE_SORTE)
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam && lotteryConfigs[typeParam]) {
        activeLotteryKey = typeParam;
    }

    applyTranslations();
    loadLotteryUI(activeLotteryKey);

    document.getElementById('btn_clear_selections').onclick = clearSelections;
    document.getElementById('btn_generate_game').onclick = generateGames;
    document.getElementById('btn_back').onclick = () => window.location.href = 'home.html';
};

function applyTranslations() {
    const txt = i18n[currentLang];
    document.getElementById('title_lottery').textContent = `${lotteryConfigs[activeLotteryKey].name} - ${txt.title}`;
    document.getElementById('lbl_qtd_jogos').textContent = txt.qtdGames;
    document.getElementById('lbl_total_dezenas').textContent = txt.totalDecs;
    document.getElementById('lbl_volante_title').textContent = txt.volanteTitle;
    document.getElementById('btn_generate_game').textContent = txt.btnGenerate;
    document.getElementById('btn_check_all').textContent = txt.btnCheck;
    document.getElementById('btn_clear_selections').textContent = txt.btnClear;
}

function loadLotteryUI(key) {
    const config = lotteryConfigs[key];
    numberStates = {};

    const spinnerDezenas = document.getElementById('spinner_total_dezenas');
    spinnerDezenas.innerHTML = '';
    for (let i = config.minPick; i <= config.maxPick; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        spinnerDezenas.appendChild(opt);
    }

    const grid = document.getElementById('grid_numbers_volante');
    grid.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    grid.innerHTML = '';

    for (let i = config.minNum; i <= config.maxNum; i++) {
        const ball = document.createElement('div');
        ball.className = 'num-ball';
        ball.textContent = String(i).padStart(2, '0');
        ball.onclick = () => toggleNumberState(i, ball);
        grid.appendChild(ball);
    }

    updateStatusText();
}

function toggleNumberState(num, element) {
    const currentState = numberStates[num] || 'NOT_SELECTED';
    let newState = 'NOT_SELECTED';

    if (currentState === 'NOT_SELECTED') newState = 'FIXED';
    else if (currentState === 'FIXED') newState = 'EXCLUDED';
    else newState = 'NOT_SELECTED';

    numberStates[num] = newState;
    element.className = 'num-ball' + (newState === 'FIXED' ? ' fixed' : newState === 'EXCLUDED' ? ' excluded' : '');
    updateStatusText();
}

function updateStatusText() {
    const txt = i18n[currentLang];
    const fixed = Object.keys(numberStates).filter(k => numberStates[k] === 'FIXED').map(n => String(n).padStart(2, '0')).join(', ') || 'Nenhum';
    const excluded = Object.keys(numberStates).filter(k => numberStates[k] === 'EXCLUDED').map(n => String(n).padStart(2, '0')).join(', ') || 'Nenhum';
    document.getElementById('tv_fixed_excluded_status').textContent = `${txt.fixedStatus}: ${fixed} | ${txt.excludedStatus}: ${excluded}`;
}

function clearSelections() {
    numberStates = {};
    document.querySelectorAll('.num-ball').forEach(ball => ball.className = 'num-ball');
    updateStatusText();
}

function generateGames() {
    const config = lotteryConfigs[activeLotteryKey];
    const qtdGames = parseInt(document.getElementById('et_qtd_jogos').value) || 1;
    const totalPicks = parseInt(document.getElementById('spinner_total_dezenas').value);

    const fixed = Object.keys(numberStates).filter(k => numberStates[k] === 'FIXED').map(Number);
    const excluded = Object.keys(numberStates).filter(k => numberStates[k] === 'EXCLUDED').map(Number);

    let pool = [];
    for (let i = config.minNum; i <= config.maxNum; i++) {
        if (!fixed.includes(i) && !excluded.includes(i)) pool.push(i);
    }

    const needed = totalPicks - fixed.length;
    if (pool.length < needed) {
        alert("Poucas dezenas disponíveis!");
        return;
    }

    generatedGames = [];
    for (let g = 0; g < qtdGames; g++) {
        let shuffled = [...pool].sort(() => 0.5 - Math.random());
        let game = [...fixed, ...shuffled.slice(0, needed)].sort((a, b) => a - b);
        generatedGames.push(game);
    }

    const container = document.getElementById('container_generated_games');
    container.innerHTML = '';
    generatedGames.forEach((g, i) => {
        const div = document.createElement('div');
        div.className = 'game-card';
        div.textContent = `Jogo ${i + 1}: ${g.map(n => String(n).padStart(2, '0')).join(' - ')}`;
        container.appendChild(div);
    });
    document.getElementById('section_results').classList.remove('hidden');
}