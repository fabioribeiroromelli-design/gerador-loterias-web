const LOTTERY_CONFIGS = {
    LOTOFACIL: { totalNumbers: 25, pickCount: 15, cols: 5 },
    MEGA_SENA: { totalNumbers: 60, pickCount: 6, cols: 10 },
    QUINA: { totalNumbers: 80, pickCount: 5, cols: 10 },
    LOTOMANIA: { totalNumbers: 100, pickCount: 50, cols: 10, startZero: true },
    TIMEMANIA: { totalNumbers: 80, pickCount: 10, cols: 10 },
    DUPLA_SENA: { totalNumbers: 50, pickCount: 6, cols: 10 },
    DIA_DE_SORTE: { totalNumbers: 31, pickCount: 7, cols: 7 },
    MAIS_MILIONARIA: { totalNumbers: 50, pickCount: 6, cols: 10, trevos: true },
    SUPER_SETE: { totalNumbers: 10, pickCount: 7, cols: 7 }
};

const genericSelectedState = {};
let lastGeneratedGames = [];
let currentLotteryType = 'LOTOFACIL';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentLotteryType = (urlParams.get('type') || 'LOTOFACIL').toUpperCase();

    // Inicializa a loteria atual
    initLottery(currentLotteryType);

    // Escuta os cliques na barra de botões das loterias
    const lotteryButtons = document.querySelectorAll('.btn-lottery');
    lotteryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const lotteryType = e.currentTarget.getAttribute('data-type');
            if (lotteryType) {
                changeLottery(lotteryType);
            }
        });
    });

    const btnGenerate = document.getElementById('btn_generate');
    const btnClear = document.getElementById('btn_clear');
    const btnSave = document.getElementById('btn_save');
    const btnDownload = document.getElementById('btn_download');
    const gamesListEl = document.getElementById('generated_games_list');

    btnGenerate.onclick = () => {
        const config = LOTTERY_CONFIGS[currentLotteryType] || LOTTERY_CONFIGS.LOTOFACIL;
        const qtdJogos = parseInt(document.getElementById('qtd_jogos')?.value) || 1;
        const pares = document.getElementById('select_pares')?.value !== "" ? parseInt(document.getElementById('select_pares').value) : null;
        const impares = document.getElementById('select_impares')?.value !== "" ? parseInt(document.getElementById('select_impares').value) : null;
        const primos = document.getElementById('select_primos')?.value !== "" ? parseInt(document.getElementById('select_primos').value) : null;

        if (currentLotteryType === 'SUPER_SETE' && typeof generateSuperSeteGames === 'function') {
            lastGeneratedGames = generateSuperSeteGames(qtdJogos, { pares, impares, primos });
        } else {
            lastGeneratedGames = generateGenericGames(config, qtdJogos, { pares, impares, primos });
        }

        renderGamesOutput(lastGeneratedGames, config, gamesListEl);
    };

    btnClear.onclick = () => {
        const config = LOTTERY_CONFIGS[currentLotteryType] || LOTTERY_CONFIGS.LOTOFACIL;
        if (currentLotteryType === 'SUPER_SETE' && typeof clearSuperSete === 'function') {
            clearSuperSete('numbers_grid', 'summary-info');
        } else {
            clearGenericVolante(config, 'numbers_grid', 'summary-info');
        }
        lastGeneratedGames = [];
        gamesListEl.innerHTML = '';
        updateStats();
    };

    btnSave.onclick = () => {
        if (!lastGeneratedGames.length) {
            alert('Gere jogos antes de salvar!');
            return;
        }
        const savedKey = `saved_games_${currentLotteryType}`;
        const existing = JSON.parse(localStorage.getItem(savedKey) || '[]');
        localStorage.setItem(savedKey, JSON.stringify([...existing, ...lastGeneratedGames]));
        alert(`${lastGeneratedGames.length} jogo(s) salvo(s) com sucesso!`);
    };

    btnDownload.onclick = () => {
        if (!lastGeneratedGames.length) {
            alert('Gere jogos antes de baixar!');
            return;
        }
        let textContent = `JOGOS GERADOS - ${currentLotteryType}\n\n`;
        lastGeneratedGames.forEach((g, i) => {
            if (g.numbers) {
                textContent += `Jogo ${i + 1}: ${g.numbers.join(' - ')} [Trevos: ${g.trevos.join(' - ')}]\n`;
            } else {
                textContent += `Jogo ${i + 1}: ${g.map(n => String(n).padStart(2, '0')).join(' - ')}\n`;
            }
        });

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `jogos_${currentLotteryType.toLowerCase()}.txt`;
        link.click();
    };
});

// Função principal de inicialização/troca da loteria
function initLottery(lotteryType) {
    currentLotteryType = lotteryType;
    const config = LOTTERY_CONFIGS[lotteryType] || LOTTERY_CONFIGS.LOTOFACIL;
    const pageTitle = document.getElementById('page_title');
    const gamesListEl = document.getElementById('generated_games_list');

    // Reseta o estado dos números e limpa jogos anteriores
    for (let key in genericSelectedState) delete genericSelectedState[key];
    lastGeneratedGames = [];
    if (gamesListEl) gamesListEl.innerHTML = '';

    if (pageTitle) {
        pageTitle.textContent = lotteryType === 'MAIS_MILIONARIA' ? '+MILIONÁRIA' : lotteryType.replace(/_/g, ' ');
    }

    if (lotteryType === 'SUPER_SETE') {
        if (typeof renderSuperSeteVolante === 'function') {
            renderSuperSeteVolante('numbers_grid', 'summary-info');
        }
        populateFilterOptions(7);
    } else {
        renderGenericVolante(config, 'numbers_grid', 'summary-info');
        populateFilterOptions(config.pickCount);
    }

    updateStats();
}

// Troca dinamicamente a loteria via JS e atualiza a URL
function changeLottery(lotteryType) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('type', lotteryType);
    window.history.pushState({}, '', newUrl);
    initLottery(lotteryType);
}

function renderGenericVolante(config, containerId, statusId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    container.style.gap = '6px';

    const startNum = config.startZero ? 0 : 1;
    const endNum = config.startZero ? config.totalNumbers - 1 : config.totalNumbers;

    for (let i = startNum; i <= endNum; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = String(i).padStart(2, '0');
        btn.className = 'num-ball';

        const currentState = genericSelectedState[i];
        if (currentState === 'fixed') btn.classList.add('fixed');
        if (currentState === 'excluded') btn.classList.add('excluded');

        btn.onclick = () => toggleGenericNum(i, btn, statusId);
        container.appendChild(btn);
    }

    updateGenericStatus(statusId);
}

function toggleGenericNum(num, btnElement, statusId) {
    const selectedMode = document.querySelector('input[name="mode"]:checked')?.value || 'fixed';
    const currentState = genericSelectedState[num];

    if (currentState === selectedMode) {
        delete genericSelectedState[num];
        btnElement.classList.remove('fixed', 'excluded');
    } else {
        genericSelectedState[num] = selectedMode;
        btnElement.classList.remove('fixed', 'excluded');
        btnElement.classList.add(selectedMode);
    }

    updateGenericStatus(statusId);
    updateStats();
}

function updateGenericStatus(statusId) {
    const fixedList = Object.keys(genericSelectedState).filter(n => genericSelectedState[n] === 'fixed').map(Number);
    const excludedList = Object.keys(genericSelectedState).filter(n => genericSelectedState[n] === 'excluded').map(Number);

    const statusEl = document.getElementById(statusId);
    if (statusEl) {
        const fixedText = fixedList.length ? fixedList.map(n => String(n).padStart(2, '0')).join(', ') : 'Nenhum';
        const excludedText = excludedList.length ? excludedList.map(n => String(n).padStart(2, '0')).join(', ') : 'Nenhum';
        statusEl.innerHTML = `Fixos: <strong>${fixedText}</strong> | Excluídos: <strong>${excludedText}</strong>`;
    }
}

function updateStats() {
    const fixedNums = Object.keys(genericSelectedState).filter(n => genericSelectedState[n] === 'fixed').map(Number);
    const statsEl = document.getElementById('stats_info');
    if (!statsEl) return;

    const pares = fixedNums.filter(n => n % 2 === 0).length;
    const impares = fixedNums.filter(n => n % 2 !== 0).length;
    const primos = fixedNums.filter(n => isPrimeNumber(n)).length;
    const soma = fixedNums.reduce((a, b) => a + b, 0);

    statsEl.innerHTML = `Pares: <strong>${pares}</strong> | Ímpares: <strong>${impares}</strong> | Primos: <strong>${primos}</strong> | Soma: <strong>${soma}</strong>`;
}

function clearGenericVolante(config, containerId, statusId) {
    for (let key in genericSelectedState) delete genericSelectedState[key];
    renderGenericVolante(config, containerId, statusId);
}

function generateGenericGames(config, qtdGames, filters = {}) {
    const { pares, impares, primos } = filters;
    const games = [];
    let attempts = 0;

    const fixedNums = Object.keys(genericSelectedState).filter(n => genericSelectedState[n] === 'fixed').map(Number);
    const excludedNums = Object.keys(genericSelectedState).filter(n => genericSelectedState[n] === 'excluded').map(Number);

    const startNum = config.startZero ? 0 : 1;
    const endNum = config.startZero ? config.totalNumbers - 1 : config.totalNumbers;

    const pool = [];
    for (let i = startNum; i <= endNum; i++) {
        if (!fixedNums.includes(i) && !excludedNums.includes(i)) pool.push(i);
    }

    const neededToPick = config.pickCount - fixedNums.length;
    if (neededToPick < 0 || pool.length < neededToPick) return [];

    while (games.length < qtdGames && attempts < 5000) {
        attempts++;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const randomPicked = shuffled.slice(0, neededToPick);
        const currentGame = [...fixedNums, ...randomPicked].sort((a, b) => a - b);

        if (validateGenericFilters(currentGame, pares, impares, primos)) {
            if (config.trevos) {
                const trevosPool = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
                games.push({ numbers: currentGame, trevos: trevosPool.slice(0, 2).sort((a, b) => a - b) });
            } else {
                games.push(currentGame);
            }
        }
    }
    return games;
}

function validateGenericFilters(numbers, pares, impares, primos) {
    if (pares !== null && numbers.filter(n => n % 2 === 0).length !== pares) return false;
    if (impares !== null && numbers.filter(n => n % 2 !== 0).length !== impares) return false;
    if (primos !== null && numbers.filter(n => isPrimeNumber(n)).length !== primos) return false;
    return true;
}

function isPrimeNumber(n) {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}

function populateFilterOptions(maxOption) {
    ['select_pares', 'select_impares', 'select_primos'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '<option value="">Todos</option>';
        for (let i = 0; i <= maxOption; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            el.appendChild(opt);
        }
    });
}

function renderGamesOutput(generatedGames, config, gamesListEl) {
    if (generatedGames.length > 0) {
        gamesListEl.innerHTML = generatedGames
            .map((gameData, index) => {
                if (config.trevos && gameData.numbers) {
                    const numbers = gameData.numbers.map(n => String(n).padStart(2, '0')).join(' - ');
                    const trevos = gameData.trevos.map(t => String(t).padStart(2, '0')).join(' - ');
                    return `<div class="game-row" style="margin: 5px 0; padding: 8px; background: #fff; border: 1px solid #ddd; border-radius: 4px;"><strong>Jogo ${index + 1}:</strong> ${numbers} <span style="color: #28a745; font-weight: bold;">[Trevos: ${trevos}]</span></div>`;
                }
                const numbers = gameData.map(n => String(n).padStart(2, '0')).join(' - ');
                return `<div class="game-row" style="margin: 5px 0; padding: 8px; background: #fff; border: 1px solid #ddd; border-radius: 4px;"><strong>Jogo ${index + 1}:</strong> ${numbers}</div>`;
            })
            .join('');
    } else {
        gamesListEl.innerHTML = '<div class="game-row" style="color: red; margin-top: 10px;">Nenhum jogo gerado. Altere os filtros.</div>';
    }
}