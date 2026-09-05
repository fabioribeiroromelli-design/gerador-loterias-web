// Configuração das regras padrão de cada loteria
const LOTTERY_CONFIGS = {
    LOTOFACIL: { totalNumbers: 25, pickCount: 15, cols: 5 },
    MEGASCENA: { totalNumbers: 60, pickCount: 6, cols: 10 },
    QUINA: { totalNumbers: 80, pickCount: 5, cols: 10 },
    LOTOMANIA: { totalNumbers: 100, pickCount: 50, cols: 10, startZero: true },
    TIMEMANIA: { totalNumbers: 80, pickCount: 10, cols: 10 },
    DUPLA_SENA: { totalNumbers: 50, pickCount: 6, cols: 10 },
    DIA_DE_SORTE: { totalNumbers: 31, pickCount: 7, cols: 7 },
    MAIS_MILIONARIA: { totalNumbers: 50, pickCount: 6, cols: 10, trevos: true },
    SUPER_SETE: { totalNumbers: 10, pickCount: 7, cols: 7 }
};

// Armazena estado global dos números selecionados para loterias genéricas
const genericSelectedState = {};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lotteryType = (urlParams.get('type') || 'LOTOFACIL').toUpperCase();

    const pageTitle = document.getElementById('page_title');
    const btnGenerate = document.getElementById('btn_generate');
    const btnClear = document.getElementById('btn_clear');
    const gamesListEl = document.getElementById('generated_games_list');

    const config = LOTTERY_CONFIGS[lotteryType] || LOTTERY_CONFIGS.LOTOFACIL;

    if (pageTitle) {
        pageTitle.textContent = lotteryType === 'MAIS_MILIONARIA' ? '+MILIONÁRIA' : lotteryType.replace('_', ' ');
    }

    // Renderização do Volante
    if (lotteryType === 'SUPER_SETE') {
        renderSuperSeteVolante('numbers_grid', 'summary-info');
        populateFilterOptions(7);
    } else {
        renderGenericVolante(config, 'numbers_grid', 'summary-info');
        populateFilterOptions(config.pickCount);
    }

    // Ação do Botão Gerar Jogo
    btnGenerate.onclick = () => {
        const qtdJogos = parseInt(document.getElementById('qtd_jogos')?.value) || 1;
        const pares = document.getElementById('select_pares')?.value !== "" ? parseInt(document.getElementById('select_pares').value) : null;
        const impares = document.getElementById('select_impares')?.value !== "" ? parseInt(document.getElementById('select_impares').value) : null;
        const primos = document.getElementById('select_primos')?.value !== "" ? parseInt(document.getElementById('select_primos').value) : null;

        let generatedGames = [];

        if (lotteryType === 'SUPER_SETE') {
            generatedGames = generateSuperSeteGames(qtdJogos, { pares, impares, primos });
        } else {
            generatedGames = generateGenericGames(config, qtdJogos, { pares, impares, primos });
        }

        // Renderiza o resultado na tela
        if (generatedGames.length > 0) {
            gamesListEl.innerHTML = generatedGames
                .map((gameData, index) => {
                    // Trata o formato caso seja a +Milionária (que traz os trevos)
                    if (config.trevos && gameData.numbers) {
                        const formattedNumbers = gameData.numbers.map(n => String(n).padStart(2, '0')).join(' - ');
                        const formattedTrevos = gameData.trevos.map(t => String(t).padStart(2, '0')).join(' - ');
                        return `<div class="game-row"><strong>Jogo ${index + 1}:</strong> ${formattedNumbers} <span style="color: #28a745; font-weight: bold;">[Trevos: ${formattedTrevos}]</span></div>`;
                    }
                    
                    const formattedNumbers = gameData.map(n => String(n).padStart(2, '0')).join(' - ');
                    return `<div class="game-row"><strong>Jogo ${index + 1}:</strong> ${formattedNumbers}</div>`;
                })
                .join('');
        } else {
            gamesListEl.innerHTML = '<div class="game-row" style="color: red;">Nenhum jogo gerado. Tente relaxar as restrições de pares/ímpares/primos.</div>';
        }
    };

    // Ação do Botão Limpar
    btnClear.onclick = () => {
        if (lotteryType === 'SUPER_SETE') {
            clearSuperSete('numbers_grid', 'summary-info');
        } else {
            clearGenericVolante(config, 'numbers_grid', 'summary-info');
        }
        gamesListEl.innerHTML = '';
    };
});

/**
 * Renderiza o volante de números padrão para Lotofácil, Mega-Sena, +Milionária, etc.
 */
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

function clearGenericVolante(config, containerId, statusId) {
    for (let key in genericSelectedState) delete genericSelectedState[key];
    renderGenericVolante(config, containerId, statusId);
}

/**
 * Lógica de geração genérica para outras loterias (incluindo +Milionária)
 */
function generateGenericGames(config, qtdGames, filters = {}) {
    const { pares, impares, primos } = filters;
    const games = [];
    let attempts = 0;
    const maxAttempts = 5000;

    const fixedNums = Object.keys(genericSelectedState).filter(n => genericSelectedState[n] === 'fixed').map(Number);
    const excludedNums = Object.keys(genericSelectedState).filter(n => genericSelectedState[n] === 'excluded').map(Number);

    const startNum = config.startZero ? 0 : 1;
    const endNum = config.startZero ? config.totalNumbers - 1 : config.totalNumbers;

    const pool = [];
    for (let i = startNum; i <= endNum; i++) {
        if (!fixedNums.includes(i) && !excludedNums.includes(i)) {
            pool.push(i);
        }
    }

    const neededToPick = config.pickCount - fixedNums.length;

    if (neededToPick < 0 || pool.length < neededToPick) {
        return [];
    }

    while (games.length < qtdGames && attempts < maxAttempts) {
        attempts++;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const randomPicked = shuffled.slice(0, neededToPick);
        const currentGame = [...fixedNums, ...randomPicked].sort((a, b) => a - b);

        if (validateGenericFilters(currentGame, pares, impares, primos)) {
            if (config.trevos) {
                // Sorteia 2 trevos de 1 a 6 para a +Milionária
                const trevosPool = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
                const trevos = trevosPool.slice(0, 2).sort((a, b) => a - b);
                games.push({ numbers: currentGame, trevos: trevos });
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
    const selects = ['select_pares', 'select_impares', 'select_primos'];
    selects.forEach(id => {
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