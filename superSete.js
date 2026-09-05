// Estado do volante do Super Sete: 7 colunas (0 a 6), cada uma armazenando { numero: estado }
const superSeteState = Array.from({ length: 7 }, () => ({}));

// Primos válidos entre 0 e 9
const PRIMOS_SINGLE = [2, 3, 5, 7];

/**
 * Renderiza o volante de 7 colunas com números de 0 a 9 em cada uma.
 */
function renderSuperSeteVolante(containerId, statusId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(7, 1fr)';
    container.style.gap = '4px';

    // Cabeçalho de Colunas
    for (let c = 1; c <= 7; c++) {
        const header = document.createElement('div');
        header.textContent = `Col ${c}`;
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        header.style.fontSize = '0.8rem';
        header.style.paddingBottom = '4px';
        container.appendChild(header);
    }

    // Botões (números de 0 a 9)
    for (let num = 0; num <= 9; num++) {
        for (let col = 0; col < 7; col++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = num;
            btn.className = 'num-ball';
            btn.dataset.col = col;
            btn.dataset.num = num;

            // Restaura estado salvo
            const currentState = superSeteState[col][num];
            if (currentState === 'fixed') btn.classList.add('fixed');
            if (currentState === 'excluded') btn.classList.add('excluded');

            btn.onclick = () => toggleSuperSeteNum(col, num, btn, statusId);
            container.appendChild(btn);
        }
    }

    updateSuperSeteStatus(statusId);
}

/**
 * Alterna entre neutro, fixo e excluído.
 */
function toggleSuperSeteNum(col, num, btnElement, statusId) {
    const selectedMode = document.querySelector('input[name="mode"]:checked')?.value || 'fixed';
    const currentState = superSeteState[col][num];

    if (currentState === selectedMode) {
        delete superSeteState[col][num];
        btnElement.classList.remove('fixed', 'excluded');
    } else {
        superSeteState[col][num] = selectedMode;
        btnElement.classList.remove('fixed', 'excluded');
        btnElement.classList.add(selectedMode);
    }

    updateSuperSeteStatus(statusId);
}

/**
 * Atualiza o texto de resumo de números fixos e excluídos.
 */
function updateSuperSeteStatus(statusId) {
    const fixedList = [];
    const excludedList = [];

    superSeteState.forEach((colMap, colIdx) => {
        Object.entries(colMap).forEach(([num, state]) => {
            if (state === 'fixed') fixedList.push(`C${colIdx + 1}:${num}`);
            if (state === 'excluded') excludedList.push(`C${colIdx + 1}:${num}`);
        });
    });

    const statusEl = document.getElementById(statusId);
    if (statusEl) {
        const fixedText = fixedList.length ? fixedList.join(', ') : 'Nenhum';
        const excludedText = excludedList.length ? excludedList.join(', ') : 'Nenhum';
        statusEl.innerHTML = `Fixos: <strong>${fixedText}</strong> | Excluídos: <strong>${excludedText}</strong>`;
    }
}

/**
 * Limpa seleções do Super Sete.
 */
function clearSuperSete(containerId, statusId) {
    superSeteState.forEach(col => {
        for (let key in col) delete col[key];
    });
    renderSuperSeteVolante(containerId, statusId);
}

/**
 * Gera jogos baseados nas regras, fixos/excluídos e restrições de pares/ímpares/primos.
 */
function generateSuperSeteGames(qtdGames, filters = {}) {
    const { pares, impares, primos } = filters;
    const games = [];
    let attempts = 0;
    const maxAttempts = 5000;

    while (games.length < qtdGames && attempts < maxAttempts) {
        attempts++;
        const currentGame = [];
        let isValid = true;

        for (let col = 0; col < 7; col++) {
            const colMap = superSeteState[col];
            const fixedNums = Object.keys(colMap).filter(n => colMap[n] === 'fixed').map(Number);
            const excludedNums = Object.keys(colMap).filter(n => colMap[n] === 'excluded').map(Number);

            if (fixedNums.length > 0) {
                // Sorteia um dos fixos definidos para a coluna
                currentGame.push(fixedNums[Math.floor(Math.random() * fixedNums.length)]);
            } else {
                // Escolhe números que não estejam excluídos
                const available = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !excludedNums.includes(n));
                if (available.length === 0) {
                    isValid = false;
                    break;
                }
                currentGame.push(available[Math.floor(Math.random() * available.length)]);
            }
        }

        if (isValid && validateSuperSeteFilters(currentGame, pares, impares, primos)) {
            games.push(currentGame);
        }
    }

    return games;
}

/**
 * Validação dos Filtros Especiais.
 */
function validateSuperSeteFilters(numbers, pares, impares, primos) {
    if (pares !== null && numbers.filter(n => n % 2 === 0).length !== pares) return false;
    if (impares !== null && numbers.filter(n => n % 2 !== 0).length !== impares) return false;
    if (primos !== null && numbers.filter(n => PRIMOS_SINGLE.includes(n)).length !== primos) return false;
    return true;
}