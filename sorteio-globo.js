/**
 * Sorteio Globo - Versão Web (Sem Anúncios)
 * Com seleção de loteria via cards
 */

document.addEventListener('DOMContentLoaded', function() {
    // ===== CONFIGURAÇÕES DAS LOTERIAS =====
   // ===== CONFIGURAÇÕES DAS LOTERIAS =====
    const LOTTERY_TYPES = {
        MEGA_SENA: {
            id: 'MEGA_SENA',
            name: 'Mega-Sena',
            minNumber: 1,
            maxNumber: 60,
            minNumbersToPick: 6,
            hasExtraNumbers: false,
            hasLuckyMonth: false,
            hasTeam: false,
            color: '#209869',
            icon: 'fa-trophy',
            shortName: 'Mega-Sena'
        },
        LOTOFACIL: {
            id: 'LOTOFACIL',
            name: 'Lotofácil',
            minNumber: 1,
            maxNumber: 25,
            minNumbersToPick: 15,
            hasExtraNumbers: false,
            hasLuckyMonth: false,
            hasTeam: false,
            color: '#930089',
            icon: 'fa-clover',
            shortName: 'Lotofácil'
        },
        QUINA: {
            id: 'QUINA',
            name: 'Quina',
            minNumber: 1,
            maxNumber: 80,
            minNumbersToPick: 5,
            hasExtraNumbers: false,
            hasLuckyMonth: false,
            hasTeam: false,
            color: '#260085',
            icon: 'fa-star',
            shortName: 'Quina'
        },
        LOTOMANIA: {
            id: 'LOTOMANIA',
            name: 'Lotomania',
            minNumber: 0,
            maxNumber: 99,
            minNumbersToPick: 50,
            hasExtraNumbers: false,
            hasLuckyMonth: false,
            hasTeam: false,
            color: '#F78100',
            icon: 'fa-dice',
            shortName: 'Lotomania'
        },
        TIMEMANIA: {
            id: 'TIMEMANIA',
            name: 'Timemania',
            minNumber: 1,
            maxNumber: 80,
            minNumbersToPick: 10,
            hasExtraNumbers: false,
            hasLuckyMonth: false,
            hasTeam: true,
            color: '#2ecc71',
            icon: 'fa-clock',
            shortName: 'Timemania'
        },
        DUPLA_SENA: {
            id: 'DUPLA_SENA',
            name: 'Dupla Sena',
            minNumber: 1,
            maxNumber: 50,
            minNumbersToPick: 6,
            hasExtraNumbers: false,
            hasLuckyMonth: false,
            hasTeam: false,
            color: '#a61324',
            icon: 'fa-copy',
            shortName: 'Dupla Sena'
        },
        DIA_DE_SORTE: {
            id: 'DIA_DE_SORTE',
            name: 'Dia de Sorte',
            minNumber: 1,
            maxNumber: 31,
            minNumbersToPick: 7,
            hasExtraNumbers: false,
            hasLuckyMonth: true,
            hasTeam: false,
            color: '#cb8322',
            icon: 'fa-sun',
            shortName: 'Dia de Sorte'
        },
        SUPER_SETE: {
            id: 'SUPER_SETE',
            name: 'Super Sete',
            minNumber: 0,
            maxNumber: 9,
            minNumbersToPick: 7,
            hasExtraNumbers: false,
            hasLuckyMonth: false,
            hasTeam: false,
            isSuperSete: true,
            color: '#a8cf45',
            icon: 'fa-seven',
            shortName: 'Super Sete'
        },
        MAIS_MILIONARIA: {
            id: 'MAIS_MILIONARIA',
            name: '+Milionária',
            minNumber: 1,
            maxNumber: 50,
            minNumbersToPick: 6,
            hasExtraNumbers: true,
            minExtraNumber: 1,
            maxExtraNumber: 6,
            totalExtraNumbersToPick: 2,
            hasLuckyMonth: false,
            hasTeam: false,
            color: '#1b365d',
            icon: 'fa-gem',
            shortName: '+Milionária'
        }
    };

    // ===== MESES E TIMES =====
    const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const TEAMS = [
        'Rio Branco-AC', 'CRB', 'CSA', 'Nacional-AM', 'São Raimundo-AM', 'Trem', 'Bahia', 'Vitória',
        'Fluminense de Feira', 'Ceará', 'Fortaleza', 'Ferroviário', 'Brasiliense', 'Gama', 'Desportiva',
        'Rio Branco-ES', 'Goiás', 'Atlético-GO', 'Vila Nova', 'Goiânia', 'Moto Club', 'Sampaio Corrêa',
        'Atlético-MG', 'Cruzeiro', 'América-MG', 'Ipatinga', 'Tupi', 'Uberlândia', 'Villa Nova',
        'Operário-MS', 'Mixto', 'União Rondonópolis', 'Paysandu', 'Remo', 'Tuna Luso', 'Botafogo-PB',
        'Treze', 'Campinense', 'Sport', 'Santa Cruz', 'Náutico', 'River-PI', 'Flamengo-PI', 'Athletico-PR',
        'Coritiba', 'Paraná', 'Londrina', 'Flamengo', 'Vasco', 'Fluminense', 'Botafogo', 'America-RJ',
        'Americano', 'Bangu', 'Olaria', 'Volta Redonda', 'ABC', 'América-RN', 'Ji-Paraná', 'Roraima',
        'Grêmio', 'Internacional', 'Juventude', 'Caxias', 'Figueirense', 'Avaí', 'Criciúma', 'Joinville',
        'Sergipe', 'Confiança', 'Corinthians', 'Palmeiras', 'Santos', 'São Paulo', 'Guarani', 'Ponte Preta',
        'Portuguesa', 'Bragantino', 'Ituano', 'Inter de Limeira', 'Juventus-SP', 'Marília', 'Mogi Mirim',
        'Santo André', 'São Caetano', 'Botafogo-SP', 'XV de Piracicaba', 'Palmas'
    ];

    // ===== ESTADO =====
    let currentLotteryId = 'MEGA_SENA';
    let config = LOTTERY_TYPES.MEGA_SENA;
    let availableNumbers = [];
    let drawnNumbers = [];
    let extraNumbers = [];
    let luckyMonth = 0;
    let heartTeam = '';
    let excludedNumbers = new Set();
    let superSeteExclusions = {};
    let isGameFinished = false;
    let gamesCompleted = 0;
    let isDrawing = false;
    let isSuperSete = false;

    // ===== DOM ELEMENTOS =====
    const globo = document.getElementById('globo');
    const currentNumber = document.getElementById('currentNumber');
    const lotteryName = document.getElementById('lotteryName');
    const totalNumbers = document.getElementById('totalNumbers');
    const statusInfo = document.getElementById('statusInfo');
    const gamesCount = document.getElementById('gamesCount');
    const btnDrawOne = document.getElementById('btnDrawOne');
    const btnDrawAll = document.getElementById('btnDrawAll');
    const btnSave = document.getElementById('btnSave');
    const btnClear = document.getElementById('btnClear');
    const drawnArea = document.getElementById('drawnArea');
    const drawnContainer = document.getElementById('drawnNumbersContainer');
    const extraContainer = document.getElementById('extraContainer');
    const extraLabel = document.getElementById('extraLabel');
    const extraValue = document.getElementById('extraValue');
    const exclusionArea = document.getElementById('exclusionArea');
    const excludedInput = document.getElementById('excludedInput');
    const exclusionHint = document.getElementById('exclusionHint');
    const btnApplyExclusion = document.getElementById('btnApplyExclusion');
    const superSeteContainer = document.getElementById('superSeteContainer');
    const lotterySelector = document.getElementById('lotterySelector');

    // ===== RENDERIZAR CARDS DE LOTERIAS =====
    function renderLotteryCards() {
        const lotteries = Object.values(LOTTERY_TYPES);
        lotterySelector.innerHTML = lotteries.map(lot => `
            <div class="lot-card ${lot.id === currentLotteryId ? 'active' : ''}" 
                 data-id="${lot.id}">
                <div class="icon" style="color: ${lot.color}">
                    <i class="fa-solid ${lot.icon}"></i>
                </div>
                <div class="name">${lot.shortName || lot.name}</div>
                <span class="badge-num">${lot.minNumbersToPick}</span>
            </div>
        `).join('');

        // Adicionar evento de clique para cada card
        document.querySelectorAll('.lot-card').forEach(card => {
            card.addEventListener('click', function() {
                const id = this.dataset.id;
                selectLottery(id);
            });
        });
    }

    // ===== SELECIONAR LOTERIA =====
    function selectLottery(id) {
        if (isDrawing) return;
        
        currentLotteryId = id;
        config = LOTTERY_TYPES[id];
        isSuperSete = config.isSuperSete || false;
        
        // Atualizar UI
        renderLotteryCards();
        lotteryName.textContent = config.name;
        totalNumbers.textContent = config.minNumbersToPick;
        
        // Configurar exclusões
        if (isSuperSete) {
            excludedInput.style.display = 'none';
            exclusionHint.style.display = 'none';
            btnApplyExclusion.textContent = 'Limpar Exclusões';
            superSeteContainer.style.display = 'block';
            buildSuperSeteExclusionUI();
        } else {
            superSeteContainer.style.display = 'none';
            excludedInput.style.display = 'block';
            exclusionHint.style.display = 'block';
            btnApplyExclusion.textContent = 'Aplicar Exclusões';
            const example = config.name === 'Lotomania' ? '05.12.24' : `${config.minNumber}.${config.minNumber + 1}`;
            exclusionHint.textContent = `Digite os números separados por ponto\nExemplo: ${example}`;
        }
        
        resetGame();
    }

    // ===== FUNÇÕES PRINCIPAIS =====
    function resetGame() {
        drawnNumbers = [];
        extraNumbers = [];
        luckyMonth = 0;
        heartTeam = '';
        isGameFinished = false;
        isDrawing = false;

        buildAvailablePool();

        currentNumber.textContent = '--';
        currentNumber.className = 'numero';
        globo.className = 'globo';
        drawnArea.classList.remove('visible');
        extraContainer.style.display = 'none';
        btnSave.style.display = 'none';
        btnDrawOne.disabled = false;
        btnDrawAll.disabled = false;
        btnDrawOne.innerHTML = '<i class="fa-solid fa-circle-play"></i> Sortear';
        btnDrawAll.innerHTML = '<i class="fa-solid fa-forward-step"></i> Sortear Todos';

        updateStatus();
    }

    function buildAvailablePool() {
        availableNumbers = [];
        const min = config.minNumber;
        const max = config.maxNumber;

        for (let i = min; i <= max; i++) {
            if (!excludedNumbers.has(i) && !drawnNumbers.includes(i)) {
                availableNumbers.push(i);
            }
        }
    }

    function formatNumber(num) {
        if (isSuperSete) return num.toString();
        if (config.name === 'Lotomania' && num === 0) return '00';
        return num < 10 ? '0' + num : num.toString();
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ===== SORTEAR =====
    function drawOne() {
        if (isDrawing || isGameFinished) {
            if (isGameFinished) resetGame();
            return;
        }

        isDrawing = true;
        btnDrawOne.disabled = true;
        btnDrawAll.disabled = true;

        if (isSuperSete) {
            drawSuperSeteOne();
        } else {
            drawStandardOne();
        }
    }

    function drawSuperSeteOne() {
        const col = drawnNumbers.length + 1;
        if (col > 7) {
            isDrawing = false;
            btnDrawOne.disabled = false;
            btnDrawAll.disabled = false;
            return;
        }

        const excludedInColumn = superSeteExclusions[col] || new Set();
        const available = [];
        for (let i = 0; i <= 9; i++) {
            if (!excludedInColumn.has(i)) available.push(i);
        }

        if (available.length === 0) {
            showToast(`Coluna ${col} sem números disponíveis!`);
            isDrawing = false;
            btnDrawOne.disabled = false;
            btnDrawAll.disabled = false;
            return;
        }

        let count = 0;
        const interval = setInterval(() => {
            const temp = getRandomNumber(0, 9);
            currentNumber.textContent = temp;
            currentNumber.className = 'numero girando';
            globo.className = 'globo girando';
            count++;
            if (count > 15) {
                clearInterval(interval);
                const selected = available[Math.floor(Math.random() * available.length)];
                currentNumber.textContent = selected;
                currentNumber.className = 'numero';
                globo.className = 'globo';
                drawnNumbers.push(selected);
                updateDrawnNumbers();
                isDrawing = false;
                btnDrawOne.disabled = false;
                btnDrawAll.disabled = false;
                if (drawnNumbers.length >= config.minNumbersToPick) {
                    completeGame();
                }
                updateStatus();
            }
        }, 60);
    }

    function drawStandardOne() {
        if (availableNumbers.length === 0) {
            showToast('Não há números disponíveis!');
            isDrawing = false;
            btnDrawOne.disabled = false;
            btnDrawAll.disabled = false;
            return;
        }

        const min = config.minNumber;
        const max = config.maxNumber;

        let count = 0;
        const interval = setInterval(() => {
            const temp = getRandomNumber(min, max);
            currentNumber.textContent = formatNumber(temp);
            currentNumber.className = 'numero girando';
            globo.className = 'globo girando';
            count++;
            if (count > 20) {
                clearInterval(interval);
                const idx = Math.floor(Math.random() * availableNumbers.length);
                const selected = availableNumbers[idx];
                availableNumbers.splice(idx, 1);
                currentNumber.textContent = formatNumber(selected);
                currentNumber.className = 'numero';
                globo.className = 'globo';
                drawnNumbers.push(selected);
                updateDrawnNumbers();
                isDrawing = false;
                btnDrawOne.disabled = false;
                btnDrawAll.disabled = false;
                if (drawnNumbers.length >= config.minNumbersToPick) {
                    completeGame();
                }
                updateStatus();
            }
        }, 50);
    }

    // ===== SORTEAR TODOS =====
    function drawAll() {
        if (isDrawing || isGameFinished) {
            if (isGameFinished) resetGame();
            return;
        }

        isDrawing = true;
        btnDrawOne.disabled = true;
        btnDrawAll.disabled = true;

        const remaining = config.minNumbersToPick - drawnNumbers.length;

        if (isSuperSete) {
            drawSuperSeteAll(remaining);
        } else {
            drawStandardAll(remaining);
        }
    }

    function drawSuperSeteAll(remaining) {
        let col = drawnNumbers.length + 1;
        let drawn = 0;

        function drawNext() {
            if (drawn >= remaining || col > 7) {
                isDrawing = false;
                btnDrawOne.disabled = false;
                btnDrawAll.disabled = false;
                if (drawnNumbers.length >= config.minNumbersToPick) {
                    completeGame();
                }
                updateStatus();
                return;
            }

            const excludedInColumn = superSeteExclusions[col] || new Set();
            const available = [];
            for (let i = 0; i <= 9; i++) {
                if (!excludedInColumn.has(i)) available.push(i);
            }

            if (available.length === 0) {
                showToast(`Coluna ${col} sem números disponíveis!`);
                isDrawing = false;
                btnDrawOne.disabled = false;
                btnDrawAll.disabled = false;
                return;
            }

            const selected = available[Math.floor(Math.random() * available.length)];
            currentNumber.textContent = selected;
            currentNumber.className = 'numero girando';
            globo.className = 'globo girando';

            setTimeout(() => {
                currentNumber.className = 'numero';
                globo.className = 'globo';
                drawnNumbers.push(selected);
                drawn++;
                col++;
                updateDrawnNumbers();
                setTimeout(drawNext, 200);
            }, 300);
        }

        drawNext();
    }

    function drawStandardAll(remaining) {
        let drawn = 0;

        function drawNext() {
            if (drawn >= remaining || availableNumbers.length === 0) {
                isDrawing = false;
                btnDrawOne.disabled = false;
                btnDrawAll.disabled = false;
                if (drawnNumbers.length >= config.minNumbersToPick) {
                    completeGame();
                }
                updateStatus();
                return;
            }

            const min = config.minNumber;
            const max = config.maxNumber;
            const temp = getRandomNumber(min, max);
            currentNumber.textContent = formatNumber(temp);
            currentNumber.className = 'numero girando';
            globo.className = 'globo girando';

            setTimeout(() => {
                const idx = Math.floor(Math.random() * availableNumbers.length);
                const selected = availableNumbers[idx];
                availableNumbers.splice(idx, 1);
                currentNumber.textContent = formatNumber(selected);
                currentNumber.className = 'numero';
                globo.className = 'globo';
                drawnNumbers.push(selected);
                drawn++;
                updateDrawnNumbers();
                setTimeout(drawNext, 200);
            }, 300);
        }

        drawNext();
    }

    // ===== COMPLETAR JOGO =====
    function completeGame() {
        isGameFinished = true;
        gamesCompleted++;

        if (config.hasExtraNumbers) {
            sortExtraNumbers();
        }
        if (config.hasLuckyMonth) {
            luckyMonth = getRandomNumber(1, 12);
        }
        if (config.hasTeam) {
            heartTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
        }

        updateExtraInfo();

        btnDrawOne.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Novo Sorteio';
        btnDrawAll.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Novo Sorteio';
        btnSave.style.display = 'inline-flex';

        showToast('✅ Sorteio completo!');
    }

    function sortExtraNumbers() {
        extraNumbers = [];
        const min = config.minExtraNumber || 1;
        const max = config.maxExtraNumber || 6;
        const total = config.totalExtraNumbersToPick || 2;

        while (extraNumbers.length < total) {
            const num = getRandomNumber(min, max);
            if (!extraNumbers.includes(num)) {
                extraNumbers.push(num);
            }
        }
        extraNumbers.sort((a, b) => a - b);
    }

    // ===== ATUALIZAR UI =====
    function updateDrawnNumbers() {
        drawnArea.classList.add('visible');

        const sorted = [...drawnNumbers].sort((a, b) => a - b);
        drawnContainer.innerHTML = sorted.map(n =>
            `<div class="ball" style="background: ${config.color};">${formatNumber(n)}</div>`
        ).join('');

        const remaining = config.minNumbersToPick - drawnNumbers.length;
        if (remaining > 0 && !isGameFinished) {
            btnDrawOne.innerHTML = `<i class="fa-solid fa-circle-play"></i> ${isSuperSete ? 'Coluna ' + (drawnNumbers.length + 1) : 'Sortear'}`;
            btnDrawAll.innerHTML = `<i class="fa-solid fa-forward-step"></i> Sortear Restantes (${remaining})`;
        }
    }

    function updateExtraInfo() {
        if (config.hasExtraNumbers && extraNumbers.length > 0) {
            extraContainer.style.display = 'block';
            extraLabel.textContent = 'Trevo da Sorte:';
            extraValue.textContent = extraNumbers.map(n => formatNumber(n)).join(' - ');
        } else if (config.hasLuckyMonth && luckyMonth > 0) {
            extraContainer.style.display = 'block';
            extraLabel.textContent = 'Mês da Sorte:';
            extraValue.textContent = MONTHS[luckyMonth - 1];
        } else if (config.hasTeam && heartTeam) {
            extraContainer.style.display = 'block';
            extraLabel.textContent = 'Time do Coração:';
            extraValue.textContent = heartTeam;
        } else {
            extraContainer.style.display = 'none';
        }
    }

    function updateStatus() {
        const remaining = config.minNumbersToPick - drawnNumbers.length;
        statusInfo.innerHTML = `<strong>${config.name}</strong> (${drawnNumbers.length}/${config.minNumbersToPick})`;
        gamesCount.textContent = `Jogos: ${gamesCompleted}`;
    }

    // ===== EXCLUSÕES =====
    function applyExclusions() {
        if (isSuperSete) {
            superSeteExclusions = {};
            buildSuperSeteExclusionUI();
            showToast('✅ Exclusões limpas!');
            return;
        }

        const text = excludedInput.value.trim();
        if (!text) {
            excludedNumbers.clear();
            buildAvailablePool();
            showToast('✅ Exclusões removidas!');
            return;
        }

        const tokens = text.split(/[.,\s]+/).filter(t => t !== '');
        const numbers = new Set();
        const min = config.minNumber;
        const max = config.maxNumber;

        for (const token of tokens) {
            const num = parseInt(token);
            if (!isNaN(num) && num >= min && num <= max) {
                numbers.add(num);
            }
        }

        if (numbers.size === 0) {
            showToast('⚠️ Nenhum número válido encontrado!');
            return;
        }

        excludedNumbers = numbers;
        buildAvailablePool();

        drawnNumbers = drawnNumbers.filter(n => !excludedNumbers.has(n));
        updateDrawnNumbers();

        showToast(`✅ ${excludedNumbers.size} números excluídos!`);
    }

    function buildSuperSeteExclusionUI() {
        superSeteContainer.innerHTML = '';
        for (let col = 1; col <= 7; col++) {
            const card = document.createElement('div');
            card.className = 'coluna-card';

            const title = document.createElement('div');
            title.className = 'coluna-title';
            title.textContent = `COLUNA ${col}`;
            card.appendChild(title);

            const linha = document.createElement('div');
            linha.className = 'linha';

            for (let n = 0; n <= 9; n++) {
                const item = document.createElement('div');
                item.className = 'num-item';

                const label = document.createElement('label');
                label.textContent = n;
                item.appendChild(label);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = (superSeteExclusions[col] || new Set()).has(n);
                checkbox.addEventListener('change', function() {
                    if (!superSeteExclusions[col]) {
                        superSeteExclusions[col] = new Set();
                    }
                    if (this.checked) {
                        superSeteExclusions[col].add(n);
                    } else {
                        superSeteExclusions[col].delete(n);
                    }
                });
                item.appendChild(checkbox);

                linha.appendChild(item);
            }

            card.appendChild(linha);
            superSeteContainer.appendChild(card);
        }
    }

    // ===== SALVAR =====
    function saveGame() {
        if (drawnNumbers.length === 0) {
            showToast('⚠️ Nenhum número sorteado para salvar!');
            return;
        }

        const numbersStr = drawnNumbers.sort((a, b) => a - b).map(n => formatNumber(n)).join(' - ');
        let extraStr = null;
        let monthStr = null;
        let teamStr = null;

        if (config.hasExtraNumbers && extraNumbers.length > 0) {
            extraStr = extraNumbers.map(n => formatNumber(n)).join(' - ');
        }
        if (config.hasLuckyMonth && luckyMonth > 0) {
            monthStr = MONTHS[luckyMonth - 1];
        }
        if (config.hasTeam && heartTeam) {
            teamStr = heartTeam;
        }

        const saved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
        saved.push({
            loteria: config.name,
            data: new Date().toLocaleDateString('pt-BR'),
            numeros: drawnNumbers,
            extra: extraStr,
            mes: monthStr,
            time: teamStr,
            tipo: 'sorteio-globo'
        });
        localStorage.setItem('saved_games_list', JSON.stringify(saved));

        showToast('💾 Jogo salvo com sucesso!');
    }

    // ===== TOAST =====
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: #e2e8f0;
            padding: 12px 24px;
            border-radius: 8px;
            border: 1px solid #334155;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            z-index: 9999;
            font-weight: 500;
            animation: fadeInUp 0.3s ease-out;
            max-width: 90%;
            text-align: center;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ===== EVENTOS =====
    btnDrawOne.addEventListener('click', drawOne);
    btnDrawAll.addEventListener('click', drawAll);
    btnSave.addEventListener('click', saveGame);
    btnClear.addEventListener('click', resetGame);
    btnApplyExclusion.addEventListener('click', applyExclusions);

    // ===== INICIAR =====
    renderLotteryCards();
    resetGame();

    // Adicionar estilo para toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;
    document.head.appendChild(style);
});