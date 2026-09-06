const LOTTERIES_CONFIG = {
    MEGA_SENA: { name: 'Mega-Sena', maxNum: 60, defaultSelect: 6, zeroBased: false },
    LOTOFACIL: { name: 'Lotofácil', maxNum: 25, defaultSelect: 15, zeroBased: false },
    QUINA: { name: 'Quina', maxNum: 80, defaultSelect: 5, zeroBased: false },
    LOTOMANIA: { name: 'Lotomania', maxNum: 100, defaultSelect: 50, zeroBased: true },
    TIMEMANIA: { name: 'Timemania', maxNum: 80, defaultSelect: 10, zeroBased: false },
    DUPLA_SENA: { name: 'Dupla Sena', maxNum: 50, defaultSelect: 6, zeroBased: false },
    DIA_DE_SORTE: { name: 'Dia de Sorte', maxNum: 31, defaultSelect: 7, zeroBased: false },
    SUPER_SETE: { name: 'Super Sete', isSuperSete: true, columns: 7, rows: 10, defaultSelect: 7 },
    MAIS_MILIONARIA: { name: '+Milionária', maxNum: 50, defaultSelect: 6, zeroBased: false }
};

let currentLottery = 'MEGA_SENA';
let selectedMode = 'fixed';
let fixedNumbers = new Set();
let excludedNumbers = new Set();
let generatedGames = [];

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    switchLottery(currentLottery);
});

function initEvents() {
    document.querySelectorAll('.btn-lottery').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.getAttribute('data-type');
            switchLottery(type);
        });
    });

    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedMode = e.target.value;
        });
    });

    document.getElementById('btn_clear').addEventListener('click', clearSelections);
    document.getElementById('btn_generate').addEventListener('click', generateGames);
    document.getElementById('btn_save').addEventListener('click', saveGames);
    document.getElementById('btn_download').addEventListener('click', downloadTXT);
}

function switchLottery(type) {
    if (!LOTTERIES_CONFIG[type]) return;
    currentLottery = type;
    const config = LOTTERIES_CONFIG[type];

    document.getElementById('page_title').textContent = `Gerador - ${config.name}`;
    document.getElementById('volante_title').textContent = `Volante de Seleção (${config.name})`;

    clearSelections();
    buildGrid();
    populateFilterSelects();
}

function buildGrid() {
    const grid = document.getElementById('numbers_grid');
    grid.innerHTML = '';
    const config = LOTTERIES_CONFIG[currentLottery];

    // Trata o visual específico do Super Sete (7 Colunas de 0 a 9)
    if (config.isSuperSete) {
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        grid.style.gap = '10px';

        for (let col = 1; col <= 7; col++) {
            const colContainer = document.createElement('div');
            colContainer.setAttribute('style', 'display: flex; flex-direction: column; align-items: center; background: #f8f9fa; padding: 6px; border-radius: 6px; border: 1px solid #ddd;');
            colContainer.innerHTML = `<span style="font-weight: bold; margin-bottom: 6px; font-size: 12px;">Col. ${col}</span>`;

            for (let row = 0; row <= 9; row++) {
                const itemKey = `C${col}_${row}`;
                const btn = document.createElement('button');
                btn.textContent = row;
                btn.setAttribute('style', 'width: 100%; padding: 6px 0; margin: 2px 0; border: 1px solid #ccc; background: #fff; border-radius: 4px; font-weight: bold; cursor: pointer;');

                btn.addEventListener('click', () => toggleNumber(itemKey, btn));
                colContainer.appendChild(btn);
            }
            grid.appendChild(colContainer);
        }
        return;
    }

    // Grid Padrão para as demais loterias
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(42px, 1fr))';
    grid.style.gap = '8px';

    const start = config.zeroBased ? 0 : 1;
    const end = config.zeroBased ? config.maxNum - 1 : config.maxNum;

    for (let i = start; i <= end; i++) {
        const numStr = String(i).padStart(2, '0');
        const btn = document.createElement('button');
        btn.textContent = numStr;
        btn.setAttribute('style', 'padding: 10px 0; border: 1px solid #ccc; background: #fff; border-radius: 6px; font-weight: bold; cursor: pointer;');

        btn.addEventListener('click', () => toggleNumber(i, btn));
        grid.appendChild(btn);
    }
}

function toggleNumber(val, btn) {
    if (selectedMode === 'fixed') {
        if (fixedNumbers.has(val)) {
            fixedNumbers.delete(val);
            btn.style.background = '#fff';
            btn.style.color = '#000';
        } else {
            excludedNumbers.delete(val);
            fixedNumbers.add(val);
            btn.style.background = '#28a745';
            btn.style.color = '#fff';
        }
    } else {
        if (excludedNumbers.has(val)) {
            excludedNumbers.delete(val);
            btn.style.background = '#fff';
            btn.style.color = '#000';
        } else {
            fixedNumbers.delete(val);
            excludedNumbers.add(val);
            btn.style.background = '#dc3545';
            btn.style.color = '#fff';
        }
    }
    updateSummary();
}

function updateSummary() {
    const config = LOTTERIES_CONFIG[currentLottery];

    if (config.isSuperSete) {
        const fixos = Array.from(fixedNumbers).join(', ') || 'Nenhum';
        const excl = Array.from(excludedNumbers).join(', ') || 'Nenhum';
        document.getElementById('summary-info').innerHTML = `
            Fixos: <strong style="color: #28a745;">${fixos}</strong> | 
            Excluídos: <strong style="color: #dc3545;">${excl}</strong>
        `;
        return;
    }

    const fixos = Array.from(fixedNumbers).sort((a,b)=>a-b).map(n => String(n).padStart(2, '0')).join(', ') || 'Nenhum';
    const excl = Array.from(excludedNumbers).sort((a,b)=>a-b).map(n => String(n).padStart(2, '0')).join(', ') || 'Nenhum';

    document.getElementById('summary-info').innerHTML = `
        Fixos: <strong style="color: #28a745;">${fixos}</strong> | 
        Excluídos: <strong style="color: #dc3545;">${excl}</strong>
    `;

    updateStats(Array.from(fixedNumbers));
}

function updateStats(numbers) {
    if (numbers.length === 0 || typeof numbers[0] === 'string') {
        document.getElementById('stats_info').innerHTML = 'Pares: <strong>0</strong> | Ímpares: <strong>0</strong> | Primos: <strong>0</strong> | Soma: <strong>0</strong>';
        return;
    }
    const pares = numbers.filter(n => n % 2 === 0).length;
    const impares = numbers.filter(n => n % 2 !== 0).length;
    const primos = numbers.filter(isPrime).length;
    const soma = numbers.reduce((acc, curr) => acc + curr, 0);

    document.getElementById('stats_info').innerHTML = `
        Pares: <strong>${pares}</strong> | 
        Ímpares: <strong>${impares}</strong> | 
        Primos: <strong>${primos}</strong> | 
        Soma: <strong>${soma}</strong>
    `;
}

function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function clearSelections() {
    fixedNumbers.clear();
    excludedNumbers.clear();
    generatedGames = [];
    document.getElementById('generated_games_list').innerHTML = '';
    buildGrid();
    updateSummary();
}

function populateFilterSelects() {
    const config = LOTTERIES_CONFIG[currentLottery];
    const max = config.defaultSelect;

    ['select_pares', 'select_impares', 'select_primos'].forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Todos</option>';
        for (let i = 0; i <= max; i++) {
            select.innerHTML += `<option value="${i}">${i}</option>`;
        }
    });
}

function generateGames() {
    const config = LOTTERIES_CONFIG[currentLottery];
    const qtdGames = parseInt(document.getElementById('qtd_jogos').value) || 1;
    generatedGames = [];

    // Geração Especial para o Super Sete (1 número sorteado por coluna)
    if (config.isSuperSete) {
        for (let g = 0; g < qtdGames; g++) {
            let gameCols = [];
            for (let col = 1; col <= 7; col++) {
                let fixedInCol = Array.from(fixedNumbers)
                    .filter(k => k.startsWith(`C${col}_`))
                    .map(k => parseInt(k.split('_')[1]));

                if (fixedInCol.length > 0) {
                    gameCols.push(fixedInCol[Math.floor(Math.random() * fixedInCol.length)]);
                } else {
                    let available = [];
                    for (let r = 0; r <= 9; r++) {
                        if (!excludedNumbers.has(`C${col}_${r}`)) available.push(r);
                    }
                    if (available.length === 0) available = [0,1,2,3,4,5,6,7,8,9];
                    gameCols.push(available[Math.floor(Math.random() * available.length)]);
                }
            }
            generatedGames.push(gameCols);
        }
        renderGeneratedGames();
        return;
    }

    // Geração Padrão para as demais Loterias
    const reqPares = document.getElementById('select_pares').value;
    const reqImpares = document.getElementById('select_impares').value;
    const reqPrimos = document.getElementById('select_primos').value;

    const pool = [];
    const start = config.zeroBased ? 0 : 1;
    const end = config.zeroBased ? config.maxNum - 1 : config.maxNum;

    for (let i = start; i <= end; i++) {
        if (!fixedNumbers.has(i) && !excludedNumbers.has(i)) pool.push(i);
    }

    let tentativas = 0;

    while (generatedGames.length < qtdGames && tentativas < 2000) {
        tentativas++;
        let game = [...Array.from(fixedNumbers)];
        let tempPool = [...pool].sort(() => Math.random() - 0.5);

        while (game.length < config.defaultSelect && tempPool.length > 0) {
            game.push(tempPool.pop());
        }

        game.sort((a, b) => a - b);

        const pares = game.filter(n => n % 2 === 0).length;
        const impares = game.filter(n => n % 2 !== 0).length;
        const primos = game.filter(isPrime).length;

        if (reqPares !== "" && pares !== parseInt(reqPares)) continue;
        if (reqImpares !== "" && impares !== parseInt(reqImpares)) continue;
        if (reqPrimos !== "" && primos !== parseInt(reqPrimos)) continue;

        const gameKey = game.join('-');
        if (!generatedGames.some(g => g.join('-') === gameKey)) {
            generatedGames.push(game);
        }
    }

    renderGeneratedGames();
}

function renderGeneratedGames() {
    const container = document.getElementById('generated_games_list');
    container.innerHTML = '';

    if (generatedGames.length === 0) {
        container.innerHTML = '<p style="color: #666;">Nenhum jogo gerado com esses filtros.</p>';
        return;
    }

    const config = LOTTERIES_CONFIG[currentLottery];

    generatedGames.forEach((game, index) => {
        let gameStr = "";
        if (config.isSuperSete) {
            gameStr = game.map((val, idx) => `[C${idx+1}: ${val}]`).join(' ');
        } else {
            gameStr = game.map(n => String(n).padStart(2, '0')).join(' - ');
        }

        const card = document.createElement('div');
        card.setAttribute('style', 'background: #fff; border-left: 5px solid #8e44ad; padding: 10px; margin-bottom: 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-weight: bold;');
        card.innerHTML = `Jogo ${index + 1}: <span style="color: #2c3e50;">${gameStr}</span>`;
        container.appendChild(card);
    });
}

function saveGames() {
    if (generatedGames.length === 0) {
        alert("Gere pelo menos um jogo antes de salvar!");
        return;
    }
    const saved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
    generatedGames.forEach(game => {
        saved.push({
            loteria: currentLottery,
            data: new Date().toLocaleDateString('pt-BR'),
            numeros: game
        });
    });
    localStorage.setItem('saved_games_list', JSON.stringify(saved));
    alert(`${generatedGames.length} jogo(s) salvo(s) com sucesso!`);
}

function downloadTXT() {
    if (generatedGames.length === 0) {
        alert("Gere pelo menos um jogo antes de baixar!");
        return;
    }
    const config = LOTTERIES_CONFIG[currentLottery];
    let content = `=== JOGOS GERADOS (${config.name}) ===\n\n`;
    generatedGames.forEach((game, i) => {
        let gameStr = config.isSuperSete 
            ? game.map((val, idx) => `[C${idx+1}: ${val}]`).join(' ')
            : game.map(n => String(n).padStart(2, '0')).join(' - ');
        content += `Jogo ${i + 1}: ${gameStr}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `jogos_${currentLottery.toLowerCase()}.txt`;
    a.click();
}