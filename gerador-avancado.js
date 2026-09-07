document.addEventListener('DOMContentLoaded', () => {
    // ===== CONFIGURAÇÕES DAS LOTERIAS =====
    const LOTTERY_CONFIGS = {
        'Mega-Sena':       { max: 60, defaultNumbers: 6,  min: 6, maxNums: 20 },
        'Lotofácil':       { max: 25, defaultNumbers: 15, min: 15, maxNums: 20 },
        'Quina':           { max: 80, defaultNumbers: 5,  min: 5, maxNums: 15 },
        'Lotomania':       { max: 99, defaultNumbers: 50, min: 50, maxNums: 50, start: 0 },
        'Timemania':       { max: 80, defaultNumbers: 10, min: 10, maxNums: 10 },
        'Dupla Sena':      { max: 50, defaultNumbers: 6,  min: 6, maxNums: 15 },
        'Dia de Sorte':    { max: 31, defaultNumbers: 7,  min: 7, maxNums: 15 },
        'Super Sete':      { max: 9,  defaultNumbers: 7,  min: 7, maxNums: 7, start: 0 },
        'Mais Milionária': { max: 50, defaultNumbers: 6,  min: 6, maxNums: 12 }
    };

    function getLotteryConfig(name) {
        return LOTTERY_CONFIGS[name] || LOTTERY_CONFIGS['Mega-Sena'];
    }

    function getRange(lotteryName) {
        const config = getLotteryConfig(lotteryName);
        const start = config.start || 1;
        const end = config.max;
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }

    // ===== DOM =====
    const grid = document.getElementById('strategiesGrid');
    const lotterySelect = document.getElementById('lotterySelect');
    const gameCountInput = document.getElementById('gameCount');
    const numbersPerGameInput = document.getElementById('numbersPerGame');
    const filterEven = document.getElementById('filterEven');
    const filterOdd = document.getElementById('filterOdd');
    const filterPrime = document.getElementById('filterPrime');
    const generateBtn = document.getElementById('generateBtn');
    const resultsArea = document.getElementById('resultsArea');
    const gamesList = document.getElementById('gamesList');
    const saveAllBtn = document.getElementById('saveAllBtn');

    let selectedStrategyId = null;

    // ===== RENDERIZAR CARDS =====
    function renderStrategies() {
        grid.innerHTML = AVANCADO_STRATEGIES.map((strat, index) => {
            const selected = (index === 0 && !selectedStrategyId) || strat.id === selectedStrategyId;
            return `
                <div class="strategy-card ${selected ? 'selected' : ''}" data-id="${strat.id}" style="border-left-color: ${strat.color}">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="emoji">${strat.emoji}</span>
                        <span class="name">${strat.name}</span>
                    </div>
                    <div class="desc">${strat.shortDesc}</div>
                    <div class="example">${strat.example}</div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.strategy-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedStrategyId = this.dataset.id;
            });
        });

        if (!selectedStrategyId) {
            const first = document.querySelector('.strategy-card');
            if (first) {
                first.classList.add('selected');
                selectedStrategyId = first.dataset.id;
            }
        }
    }

    // ===== ATUALIZAR NÚMEROS POR JOGO =====
    function updateNumbersPerGame() {
        const lottery = lotterySelect.value;
        const config = getLotteryConfig(lottery);
        numbersPerGameInput.value = config.defaultNumbers;
        numbersPerGameInput.min = config.min;
        numbersPerGameInput.max = config.maxNums;
    }

    lotterySelect.addEventListener('change', updateNumbersPerGame);
    updateNumbersPerGame();

    // ===== GERADOR DE JOGO (simulação das estratégias) =====
    // Aqui você pode implementar a lógica real de cada estratégia,
    // baseada no histórico (que pode ser carregado dos JSONs)
    function generateGame(strategyId, lotteryName, numbersCount) {
        const range = getRange(lotteryName);
        // Simulação: aleatório com pequena variação para cada estratégia
        // Na prática, você deve implementar a lógica específica de cada uma
        const shuffled = [...range].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, numbersCount).sort((a, b) => a - b);
    }

    // ===== GERAR JOGOS =====
    function generateGames() {
        if (!selectedStrategyId) {
            alert('Selecione uma estratégia primeiro.');
            return;
        }

        const lottery = lotterySelect.value;
        const gameCount = parseInt(gameCountInput.value) || 1;
        let numbersPerGame = parseInt(numbersPerGameInput.value) || 6;
        const config = getLotteryConfig(lottery);
        numbersPerGame = Math.min(Math.max(numbersPerGame, config.min), config.maxNums);
        numbersPerGameInput.value = numbersPerGame;

        const evenFilter = filterEven.value ? parseInt(filterEven.value) : null;
        const oddFilter = filterOdd.value ? parseInt(filterOdd.value) : null;
        const primeFilter = filterPrime.value ? parseInt(filterPrime.value) : null;

        if (evenFilter !== null && oddFilter !== null && (evenFilter + oddFilter !== numbersPerGame)) {
            alert('A soma de Pares + Ímpares deve ser igual ao número de dezenas por jogo.');
            return;
        }

        const games = [];
        for (let i = 0; i < gameCount; i++) {
            let game = generateGame(selectedStrategyId, lottery, numbersPerGame);
            games.push(game);
        }

        resultsArea.classList.add('visible');
        gamesList.innerHTML = games.map((game, idx) => {
            const sum = game.reduce((a, b) => a + b, 0);
            return `
                <div class="game-row">
                    <span><strong>Jogo ${idx + 1}</strong></span>
                    <span class="game-numbers">${game.join(' - ')}</span>
                    <span style="font-size: 0.8rem; color: #666;">Soma: ${sum}</span>
                </div>
            `;
        }).join('');

        window._lastGeneratedGames = games;
        window._lastLottery = lottery;
    }

    generateBtn.addEventListener('click', generateGames);

    // ===== SALVAR JOGOS =====
    function saveGames() {
        const games = window._lastGeneratedGames;
        if (!games || games.length === 0) {
            alert('Gere jogos primeiro.');
            return;
        }

        let saved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
        games.forEach(game => {
            saved.push({
                loteria: window._lastLottery || lotterySelect.value,
                data: new Date().toLocaleDateString('pt-BR'),
                numeros: game,
                estrategia: selectedStrategyId,
                tipo: 'avancado'
            });
        });

        localStorage.setItem('saved_games_list', JSON.stringify(saved));
        alert(`${games.length} jogo(s) salvo(s) com sucesso!`);
    }

    saveAllBtn.addEventListener('click', saveGames);

    // ===== INICIALIZAÇÃO =====
    renderStrategies();
});