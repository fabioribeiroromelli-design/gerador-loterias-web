/**
 * Sorteio Globo - Versão Web
 * Exclusões funcionando (padrão + Super Sete)
 */

document.addEventListener('DOMContentLoaded', function() {

    // ===== TRADUÇÕES =====
    const TRANSLATIONS = {
        pt: {
            megasena: 'Mega-Sena', lotofacil: 'Lotofácil', quina: 'Quina',
            lotomania: 'Lotomania', timemania: 'Timemania', duplasena: 'Dupla Sena',
            diadesorte: 'Dia de Sorte', supersete: 'Super Sete', maismilionaria: '+Milionária',
            months: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
            draw: 'Sortear', drawAll: 'Sortear Todos', remaining: 'Sortear Restantes',
            newDraw: 'Novo Sorteio', save: 'Salvar Jogo', clear: 'Limpar',
            applyExclusion: 'Aplicar Exclusões', clearExclusion: 'Limpar Exclusões',
            noNumbers: 'Não há números disponíveis!',
            noValidNumbers: 'Nenhum número válido encontrado!',
            excludedSuccess: 'números excluídos!',
            exclusionRemoved: 'Exclusões removidas!',
            exclusionCleared: 'Exclusões limpas!',
            complete: 'Sorteio completo!', saved: 'Jogo salvo com sucesso!',
            noSaved: 'Nenhum número sorteado para salvar!',
            col: 'COLUNA', extraTrevo: 'Trevo da Sorte:', extraMonth: 'Mês da Sorte:',
            extraTeam: 'Time do Coração:', games: 'Jogos', colFull: 'Coluna'
        },
        en: {
            megasena: 'Mega-Sena', lotofacil: 'Lotofácil', quina: 'Quina',
            lotomania: 'Lotomania', timemania: 'Timemania', duplasena: 'Dupla Sena',
            diadesorte: 'Dia de Sorte', supersete: 'Super Sete', maismilionaria: '+Milionária',
            months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
            draw: 'Draw', drawAll: 'Draw All', remaining: 'Draw Remaining',
            newDraw: 'New Draw', save: 'Save Game', clear: 'Clear',
            applyExclusion: 'Apply Exclusions', clearExclusion: 'Clear Exclusions',
            noNumbers: 'No numbers available!', noValidNumbers: 'No valid numbers found!',
            excludedSuccess: 'numbers excluded!', exclusionRemoved: 'Exclusions removed!',
            exclusionCleared: 'Exclusions cleared!', complete: 'Draw complete!',
            saved: 'Game saved successfully!', noSaved: 'No drawn numbers to save!',
            col: 'COLUMN', extraTrevo: 'Lucky Clover:', extraMonth: 'Lucky Month:',
            extraTeam: 'Heart Team:', games: 'Games', colFull: 'Column'
        },
        es: {
            megasena: 'Mega-Sena', lotofacil: 'Lotofácil', quina: 'Quina',
            lotomania: 'Lotomania', timemania: 'Timemania', duplasena: 'Dupla Sena',
            diadesorte: 'Dia de Sorte', supersete: 'Super Sete', maismilionaria: '+Milionária',
            months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
            draw: 'Sortear', drawAll: 'Sortear Todos', remaining: 'Sortear Restantes',
            newDraw: 'Nuevo Sorteo', save: 'Guardar Juego', clear: 'Limpiar',
            applyExclusion: 'Aplicar Exclusiones', clearExclusion: 'Limpiar Exclusiones',
            noNumbers: '¡No hay números disponibles!', noValidNumbers: '¡No se encontraron números válidos!',
            excludedSuccess: 'números excluidos!', exclusionRemoved: '¡Exclusiones eliminadas!',
            exclusionCleared: '¡Exclusiones limpias!', complete: '¡Sorteo completo!',
            saved: '¡Juego guardado con éxito!', noSaved: '¡Ningún número sorteado para guardar!',
            col: 'COLUMNA', extraTrevo: 'Trébol de la Suerte:', extraMonth: 'Mes de la Suerte:',
            extraTeam: 'Equipo del Corazón:', games: 'Juegos', colFull: 'Columna'
        }
    };

    let currentLang = 'pt';
    function t(key) { return TRANSLATIONS[currentLang][key] || key; }

    // ===== CONFIGURAÇÕES DAS LOTERIAS =====
    const LOTTERY_TYPES = {
        MEGA_SENA: { id:'MEGA_SENA', nameKey:'megasena', minNumber:1, maxNumber:60, minNumbersToPick:6, color:'#209869', icon:'fa-trophy', shortName:'Mega' },
        LOTOFACIL: { id:'LOTOFACIL', nameKey:'lotofacil', minNumber:1, maxNumber:25, minNumbersToPick:15, color:'#930089', icon:'fa-clover', shortName:'Loto' },
        QUINA: { id:'QUINA', nameKey:'quina', minNumber:1, maxNumber:80, minNumbersToPick:5, color:'#260085', icon:'fa-star', shortName:'Quina' },
        LOTOMANIA: { id:'LOTOMANIA', nameKey:'lotomania', minNumber:0, maxNumber:99, minNumbersToPick:50, color:'#F78100', icon:'fa-dice', shortName:'Lotomania' },
        TIMEMANIA: { id:'TIMEMANIA', nameKey:'timemania', minNumber:1, maxNumber:80, minNumbersToPick:10, hasTeam:true, color:'#2ecc71', icon:'fa-clock', shortName:'Timemania' },
        DUPLA_SENA: { id:'DUPLA_SENA', nameKey:'duplasena', minNumber:1, maxNumber:50, minNumbersToPick:6, color:'#a61324', icon:'fa-copy', shortName:'Dupla' },
        DIA_DE_SORTE: { id:'DIA_DE_SORTE', nameKey:'diadesorte', minNumber:1, maxNumber:31, minNumbersToPick:7, hasLuckyMonth:true, color:'#cb8322', icon:'fa-sun', shortName:'Dia Sorte' },
        SUPER_SETE: { id:'SUPER_SETE', nameKey:'supersete', minNumber:0, maxNumber:9, minNumbersToPick:7, isSuperSete:true, color:'#a8cf45', icon:'fa-seven', shortName:'Sete' },
        MAIS_MILIONARIA: { id:'MAIS_MILIONARIA', nameKey:'maismilionaria', minNumber:1, maxNumber:50, minNumbersToPick:6, hasExtraNumbers:true, minExtraNumber:1, maxExtraNumber:6, totalExtraNumbersToPick:2, color:'#1b365d', icon:'fa-gem', shortName:'+Mili' }
    };

    const TEAMS = [
        'Rio Branco-AC','CRB','CSA','Nacional-AM','São Raimundo-AM','Trem','Bahia','Vitória',
        'Fluminense de Feira','Ceará','Fortaleza','Ferroviário','Brasiliense','Gama','Desportiva',
        'Rio Branco-ES','Goiás','Atlético-GO','Vila Nova','Goiânia','Moto Club','Sampaio Corrêa',
        'Atlético-MG','Cruzeiro','América-MG','Ipatinga','Tupi','Uberlândia','Villa Nova',
        'Operário-MS','Mixto','União Rondonópolis','Paysandu','Remo','Tuna Luso','Botafogo-PB',
        'Treze','Campinense','Sport','Santa Cruz','Náutico','River-PI','Flamengo-PI','Athletico-PR',
        'Coritiba','Paraná','Londrina','Flamengo','Vasco','Fluminense','Botafogo','America-RJ',
        'Americano','Bangu','Olaria','Volta Redonda','ABC','América-RN','Ji-Paraná','Roraima',
        'Grêmio','Internacional','Juventude','Caxias','Figueirense','Avaí','Criciúma','Joinville',
        'Sergipe','Confiança','Corinthians','Palmeiras','Santos','São Paulo','Guarani','Ponte Preta',
        'Portuguesa','Bragantino','Ituano','Inter de Limeira','Juventus-SP','Marília','Mogi Mirim',
        'Santo André','São Caetano','Botafogo-SP','XV de Piracicaba','Palmas'
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

    // ===== DOM =====
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
    const excludedInput = document.getElementById('excludedInput');
    const exclusionHint = document.getElementById('exclusionHint');
    const btnApplyExclusion = document.getElementById('btnApplyExclusion');
    const superSeteContainer = document.getElementById('superSeteContainer');
    const lotterySelector = document.getElementById('lotterySelector');

    // ===== ANIMAÇÃO DO GLOBO =====
    let animationInterval = null;

    function startGlobeAnimation(finalNumber, callback) {
        if (animationInterval) { clearInterval(animationInterval); animationInterval = null; }

        const isSuperSeteMode = isSuperSete;
        const min = config.minNumber;
        const max = config.maxNumber;
        let count = 0;
        const totalSteps = 25 + Math.floor(Math.random() * 15);

        if (globo) {
            globo.style.boxShadow = '0 0 80px rgba(255, 215, 0, 0.4), 0 0 120px rgba(255, 215, 0, 0.2)';
        }

        animationInterval = setInterval(() => {
            count++;
            let tempNum = isSuperSeteMode
                ? Math.floor(Math.random() * 10)
                : Math.floor(Math.random() * (max - min + 1)) + min;

            if (currentNumber) {
                currentNumber.textContent = formatNumber(tempNum);
                currentNumber.className = 'numero girando';
                currentNumber.style.transform = `scale(${1 + Math.sin(count * 0.5) * 0.1})`;
            }
            if (globo) {
                globo.className = 'globo girando';
                globo.style.transform = `rotate(${count * 8}deg)`;
            }

            if (count >= totalSteps) {
                clearInterval(animationInterval);
                animationInterval = null;

                if (currentNumber) {
                    currentNumber.textContent = formatNumber(finalNumber);
                    currentNumber.className = 'numero';
                    currentNumber.style.transform = 'scale(1.2)';
                    setTimeout(() => { if (currentNumber) currentNumber.style.transform = 'scale(1)'; }, 300);
                }
                if (globo) {
                    globo.className = 'globo';
                    globo.style.transform = 'rotate(0deg)';
                    globo.style.boxShadow = '0 0 60px rgba(37, 99, 235, 0.3), inset 0 -20px 40px rgba(0, 0, 0, 0.6)';
                }
                if (callback) callback();
            }
        }, isSuperSeteMode ? 60 : 50);
    }

    // ===== CARDS DE LOTERIA =====
    function renderLotteryCards() {
        if (!lotterySelector) return;
        lotterySelector.innerHTML = Object.values(LOTTERY_TYPES).map(lot => `
            <div class="lot-card ${lot.id === currentLotteryId ? 'active' : ''}" data-id="${lot.id}">
                <div class="icon" style="color: ${lot.color}"><i class="fa-solid ${lot.icon}"></i></div>
                <div class="name">${lot.shortName || t(lot.nameKey)}</div>
                <span class="badge-num">${lot.minNumbersToPick}</span>
            </div>
        `).join('');
        document.querySelectorAll('.lot-card').forEach(card => {
            card.addEventListener('click', function() { selectLottery(this.dataset.id); });
        });
    }

    function selectLottery(id) {
        if (isDrawing) return;
        currentLotteryId = id;
        config = LOTTERY_TYPES[id];
        isSuperSete = config.isSuperSete || false;

        renderLotteryCards();
        if (lotteryName) lotteryName.textContent = t(config.nameKey);
        if (totalNumbers) totalNumbers.textContent = config.minNumbersToPick;

        excludedNumbers = new Set();
        superSeteExclusions = {};

        if (isSuperSete) {
            if (excludedInput) { excludedInput.style.display = 'none'; excludedInput.value = ''; }
            if (exclusionHint) exclusionHint.style.display = 'none';
            if (btnApplyExclusion) btnApplyExclusion.textContent = t('clearExclusion');
            if (superSeteContainer) {
                superSeteContainer.style.display = 'block';
                buildSuperSeteExclusionUI();
            }
        } else {
            if (superSeteContainer) superSeteContainer.style.display = 'none';
            if (excludedInput) { excludedInput.style.display = 'block'; excludedInput.value = ''; }
            if (exclusionHint) {
                exclusionHint.style.display = 'block';
                const example = config.id === 'LOTOMANIA' ? '05.12.24' : `${config.minNumber}.${config.minNumber + 1}`;
                exclusionHint.textContent = `Digite os números separados por ponto\nExemplo: ${example}`;
            }
            if (btnApplyExclusion) btnApplyExclusion.textContent = t('applyExclusion');
        }
        resetGame();
    }

    function resetGame() {
        drawnNumbers = [];
        extraNumbers = [];
        luckyMonth = 0;
        heartTeam = '';
        isGameFinished = false;
        isDrawing = false;

        refreshStandardPool();

        if (currentNumber) {
            currentNumber.textContent = '--';
            currentNumber.className = 'numero';
            currentNumber.style.transform = 'scale(1)';
        }
        if (globo) {
            globo.className = 'globo';
            globo.style.transform = 'rotate(0deg)';
            globo.style.boxShadow = '0 0 60px rgba(37, 99, 235, 0.3), inset 0 -20px 40px rgba(0, 0, 0, 0.6)';
        }
        if (drawnArea) drawnArea.classList.remove('visible');
        if (extraContainer) extraContainer.style.display = 'none';
        if (btnSave) btnSave.style.display = 'none';
        if (btnDrawOne) {
            btnDrawOne.disabled = false;
            btnDrawOne.innerHTML = `<i class="fa-solid fa-circle-play"></i> ${isSuperSete ? t('colFull') + ' 1' : t('draw')}`;
        }
        if (btnDrawAll) {
            btnDrawAll.disabled = false;
            btnDrawAll.innerHTML = `<i class="fa-solid fa-forward-step"></i> ${t('drawAll')}`;
        }
        updateStatus();
    }

    function refreshStandardPool() {
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
        if (config.id === 'LOTOMANIA' && num === 0) return '00';
        return num < 10 ? '0' + num : num.toString();
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ============================================================
    // ⚠️ CORREÇÃO PRINCIPAL: agora LÊ o input antes de sortear
    // ============================================================
    function applyExclusionsSilent() {
        if (isSuperSete) {
            // Super Sete: exclusões já estão em memória (checkboxes)
            return;
        }

        const text = excludedInput ? excludedInput.value.trim() : '';

        if (!text) {
            // Campo vazio = sem exclusões
            excludedNumbers.clear();
            refreshStandardPool();
            return;
        }

        // Processa o texto digitado
        const numbers = new Set();
        const tokens = text.split(/[.,\s]+/).filter(item => item !== '');
        const min = config.minNumber;
        const max = config.maxNumber;

        for (const token of tokens) {
            const num = parseInt(token);
            if (!isNaN(num) && num >= min && num <= max) {
                numbers.add(num);
            }
        }

        excludedNumbers = numbers;
        refreshStandardPool();

        // Remove dos sorteados os que agora estão excluídos
        const antes = drawnNumbers.length;
        drawnNumbers = drawnNumbers.filter(n => !excludedNumbers.has(n));

        if (drawnNumbers.length !== antes) {
            updateDrawnNumbersDisplay();
        }
    }

    // ===== SORTEAR =====
    function drawOne() {
        if (isDrawing) return;
        if (isGameFinished) { resetGame(); return; }

        // ⚠️ CHAMA A VERSÃO CORRIGIDA (agora lê o input)
        applyExclusionsSilent();

        if (isSuperSete) drawSuperSeteOne();
        else drawStandardOne();
    }

    function drawSuperSeteOne() {
        const col = drawnNumbers.length + 1;
        if (col > 7) return;

        const excludedInColumn = superSeteExclusions[col] || new Set();
        const available = [];
        for (let i = 0; i <= 9; i++) {
            if (!excludedInColumn.has(i)) available.push(i);
        }

        if (available.length === 0) {
            showToast(`${t('colFull')} ${col} ${t('noNumbers')}`);
            return;
        }

        isDrawing = true;
        if (btnDrawOne) btnDrawOne.disabled = true;
        if (btnDrawAll) btnDrawAll.disabled = true;

        const selected = available[Math.floor(Math.random() * available.length)];

        startGlobeAnimation(selected, function() {
            drawnNumbers.push(selected);
            updateDrawnNumbersDisplay();
            isDrawing = false;
            if (btnDrawOne) btnDrawOne.disabled = false;
            if (btnDrawAll) btnDrawAll.disabled = false;
            if (drawnNumbers.length >= config.minNumbersToPick) completeGame();
            updateStatus();
        });
    }

    function drawStandardOne() {
        if (availableNumbers.length === 0) {
            showToast(t('noNumbers'));
            return;
        }

        isDrawing = true;
        if (btnDrawOne) btnDrawOne.disabled = true;
        if (btnDrawAll) btnDrawAll.disabled = true;

        const idx = Math.floor(Math.random() * availableNumbers.length);
        const selected = availableNumbers[idx];
        availableNumbers.splice(idx, 1);

        startGlobeAnimation(selected, function() {
            drawnNumbers.push(selected);
            updateDrawnNumbersDisplay();
            isDrawing = false;
            if (btnDrawOne) btnDrawOne.disabled = false;
            if (btnDrawAll) btnDrawAll.disabled = false;
            if (drawnNumbers.length >= config.minNumbersToPick) completeGame();
            updateStatus();
        });
    }

    function drawAll() {
        if (isDrawing) return;
        if (isGameFinished) { resetGame(); return; }

        // ⚠️ CHAMA A VERSÃO CORRIGIDA
        applyExclusionsSilent();

        isDrawing = true;
        if (btnDrawOne) btnDrawOne.disabled = true;
        if (btnDrawAll) btnDrawAll.disabled = true;

        const remaining = config.minNumbersToPick - drawnNumbers.length;
        if (isSuperSete) drawSuperSeteAll(remaining);
        else drawStandardAll(remaining);
    }

    function drawSuperSeteAll(remaining) {
        let col = drawnNumbers.length + 1;
        let drawn = 0;

        function drawNext() {
            if (drawn >= remaining || col > 7) {
                isDrawing = false;
                if (btnDrawOne) btnDrawOne.disabled = false;
                if (btnDrawAll) btnDrawAll.disabled = false;
                if (drawnNumbers.length >= config.minNumbersToPick) completeGame();
                updateStatus();
                return;
            }

            const excludedInColumn = superSeteExclusions[col] || new Set();
            const available = [];
            for (let i = 0; i <= 9; i++) {
                if (!excludedInColumn.has(i)) available.push(i);
            }

            if (available.length === 0) {
                showToast(`${t('colFull')} ${col} ${t('noNumbers')}`);
                isDrawing = false;
                if (btnDrawOne) btnDrawOne.disabled = false;
                if (btnDrawAll) btnDrawAll.disabled = false;
                return;
            }

            const selected = available[Math.floor(Math.random() * available.length)];

            startGlobeAnimation(selected, function() {
                drawnNumbers.push(selected);
                drawn++;
                col++;
                updateDrawnNumbersDisplay();
                setTimeout(drawNext, 200);
            });
        }
        drawNext();
    }

    function drawStandardAll(remaining) {
        let drawn = 0;

        function drawNext() {
            if (drawn >= remaining || availableNumbers.length === 0) {
                isDrawing = false;
                if (btnDrawOne) btnDrawOne.disabled = false;
                if (btnDrawAll) btnDrawAll.disabled = false;
                if (drawnNumbers.length >= config.minNumbersToPick) completeGame();
                updateStatus();
                return;
            }

            const idx = Math.floor(Math.random() * availableNumbers.length);
            const selected = availableNumbers[idx];
            availableNumbers.splice(idx, 1);

            startGlobeAnimation(selected, function() {
                drawnNumbers.push(selected);
                drawn++;
                updateDrawnNumbersDisplay();
                setTimeout(drawNext, 200);
            });
        }
        drawNext();
    }

    function completeGame() {
        isGameFinished = true;
        gamesCompleted++;

        if (config.hasExtraNumbers) sortExtraNumbers();
        if (config.hasLuckyMonth) sortLuckyMonth();
        if (config.hasTeam) sortHeartTeam();

        updateExtraInfoDisplay();

        if (btnDrawOne) btnDrawOne.innerHTML = `<i class="fa-solid fa-rotate-right"></i> ${t('newDraw')}`;
        if (btnDrawAll) btnDrawAll.innerHTML = `<i class="fa-solid fa-rotate-right"></i> ${t('newDraw')}`;
        if (btnSave) btnSave.style.display = 'inline-flex';

        showToast('✅ ' + t('complete'));
    }

    function sortExtraNumbers() {
        extraNumbers = [];
        while (extraNumbers.length < config.totalExtraNumbersToPick) {
            const num = getRandomNumber(config.minExtraNumber, config.maxExtraNumber);
            if (!extraNumbers.includes(num)) extraNumbers.push(num);
        }
        extraNumbers.sort((a, b) => a - b);
    }

    function sortLuckyMonth() { luckyMonth = getRandomNumber(1, 12); }
    function sortHeartTeam() { heartTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)]; }

    function updateDrawnNumbersDisplay() {
        if (!drawnArea || !drawnContainer) return;

        if (drawnNumbers.length > 0) {
            drawnArea.classList.add('visible');
            const sorted = [...drawnNumbers].sort((a, b) => a - b);

            drawnContainer.innerHTML = sorted.map(n =>
                `<div class="ball" style="background: ${config.color};">${formatNumber(n)}</div>`
            ).join('');

            isGameFinished = drawnNumbers.length >= config.minNumbersToPick;

            if (isGameFinished) {
                if (btnDrawOne) btnDrawOne.innerHTML = `<i class="fa-solid fa-rotate-right"></i> ${t('newDraw')}`;
                if (btnDrawAll) btnDrawAll.innerHTML = `<i class="fa-solid fa-rotate-right"></i> ${t('newDraw')}`;
                if (btnSave) btnSave.style.display = 'inline-flex';
            } else {
                if (btnDrawOne) {
                    btnDrawOne.innerHTML = `<i class="fa-solid fa-circle-play"></i> ${isSuperSete ? t('colFull') + ' ' + (drawnNumbers.length + 1) : t('draw')}`;
                }
                if (btnDrawAll) {
                    const faltam = config.minNumbersToPick - drawnNumbers.length;
                    btnDrawAll.innerHTML = `<i class="fa-solid fa-forward-step"></i> ${t('remaining')} (${faltam})`;
                }
                if (btnSave) btnSave.style.display = 'none';
            }
        } else {
            drawnArea.classList.remove('visible');
            if (btnSave) btnSave.style.display = 'none';
        }
        updateStatus();
    }

    function updateExtraInfoDisplay() {
        if (!extraContainer || !extraLabel || !extraValue) return;

        if (config.hasExtraNumbers && extraNumbers.length > 0) {
            extraContainer.style.display = 'block';
            extraLabel.textContent = t('extraTrevo');
            extraValue.textContent = extraNumbers.map(n => formatNumber(n)).join(' - ');
        } else if (config.hasLuckyMonth && luckyMonth > 0) {
            extraContainer.style.display = 'block';
            extraLabel.textContent = t('extraMonth');
            extraValue.textContent = TRANSLATIONS[currentLang].months[luckyMonth - 1];
        } else if (config.hasTeam && heartTeam) {
            extraContainer.style.display = 'block';
            extraLabel.textContent = t('extraTeam');
            extraValue.textContent = heartTeam;
        } else {
            extraContainer.style.display = 'none';
        }
    }

    function updateStatus() {
        if (statusInfo) {
            statusInfo.innerHTML = `<strong>${t(config.nameKey)}</strong> (${drawnNumbers.length}/${config.minNumbersToPick})`;
        }
        if (gamesCount) {
            gamesCount.textContent = `${t('games')}: ${gamesCompleted}`;
        }
    }

    // ===== BOTÃO "APLICAR EXCLUSÕES" =====
    function applyExclusions(showToastMessage = false) {
        if (isSuperSete) {
            superSeteExclusions = {};
            buildSuperSeteExclusionUI();
            if (showToastMessage) showToast('✅ ' + t('exclusionCleared'));
            return;
        }

        const text = excludedInput ? excludedInput.value.trim() : '';

        if (!text) {
            excludedNumbers.clear();
            refreshStandardPool();
            drawnNumbers = drawnNumbers.filter(n => !excludedNumbers.has(n));
            updateDrawnNumbersDisplay();
            if (showToastMessage) showToast('✅ ' + t('exclusionRemoved'));
            return;
        }

        const numbers = new Set();
        const tokens = text.split(/[.,\s]+/).filter(item => item !== '');
        const min = config.minNumber;
        const max = config.maxNumber;

        for (const token of tokens) {
            const num = parseInt(token);
            if (!isNaN(num) && num >= min && num <= max) numbers.add(num);
        }

        if (numbers.size === 0) {
            if (showToastMessage) showToast('⚠️ ' + t('noValidNumbers'));
            return;
        }

        excludedNumbers = numbers;
        refreshStandardPool();
        drawnNumbers = drawnNumbers.filter(n => !excludedNumbers.has(n));
        updateDrawnNumbersDisplay();

        if (showToastMessage) {
            showToast(`✅ ${excludedNumbers.size} ${t('excludedSuccess')}`);
        }
    }

    function buildSuperSeteExclusionUI() {
        if (!superSeteContainer) return;
        superSeteContainer.innerHTML = '';
        superSeteContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:15px;width:100%;';

        for (let col = 1; col <= 7; col++) {
            const card = document.createElement('div');
            card.style.cssText = 'background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px;text-align:center;min-width:90px;flex:1 1 auto;max-width:120px;';

            const title = document.createElement('div');
            title.style.cssText = 'color:#e2e8f0;font-size:12px;font-weight:bold;margin-bottom:6px;';
            title.textContent = `${t('col')} ${col}`;
            card.appendChild(title);

            const linha = document.createElement('div');
            linha.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:4px;';

            for (let n = 0; n <= 9; n++) {
                const item = document.createElement('div');
                item.style.cssText = 'display:flex;flex-direction:column;align-items:center;font-size:10px;color:#94a3b8;';

                const label = document.createElement('label');
                label.textContent = n;
                item.appendChild(label);

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = (superSeteExclusions[col] || new Set()).has(n);
                checkbox.style.cssText = 'cursor:pointer;accent-color:#a8cf45;';

                checkbox.addEventListener('change', function() {
                    if (!superSeteExclusions[col]) superSeteExclusions[col] = new Set();
                    if (this.checked) superSeteExclusions[col].add(n);
                    else superSeteExclusions[col].delete(n);
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
        if (drawnNumbers.length === 0) { showToast('⚠️ ' + t('noSaved')); return; }

        const saved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
        saved.push({
            loteria: t(config.nameKey),
            data: new Date().toLocaleDateString('pt-BR'),
            numeros: drawnNumbers,
            extra: config.hasExtraNumbers && extraNumbers.length > 0 ? extraNumbers.join(', ') : null,
            mes: config.hasLuckyMonth && luckyMonth > 0 ? TRANSLATIONS[currentLang].months[luckyMonth - 1] : null,
            time: config.hasTeam && heartTeam ? heartTeam : null,
            tipo: 'sorteio-globo'
        });
        localStorage.setItem('saved_games_list', JSON.stringify(saved));
        showToast('💾 ' + t('saved'));
    }

    // ===== TOAST =====
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1e293b;color:#e2e8f0;padding:12px 24px;border-radius:8px;border:1px solid #334155;box-shadow:0 8px 24px rgba(0,0,0,0.4);z-index:9999;font-weight:500;max-width:90%;text-align:center;';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== EVENTOS =====
    if (btnDrawOne) btnDrawOne.addEventListener('click', drawOne);
    if (btnDrawAll) btnDrawAll.addEventListener('click', drawAll);
    if (btnSave) btnSave.addEventListener('click', saveGame);
    if (btnClear) btnClear.addEventListener('click', resetGame);
    if (btnApplyExclusion) {
        btnApplyExclusion.addEventListener('click', function() { applyExclusions(true); });
    }

    // ===== INICIAR =====
    renderLotteryCards();
    resetGame();
});
