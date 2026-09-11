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
    
    // Captura o parâmetro de URL ?lottery=NomeSeletor (ex: generator.html?lottery=Mega-Sena)
    const urlParams = new URLSearchParams(window.location.search);
    const lotteryParam = urlParams.get('lottery');
    if (lotteryParam) {
        const foundKey = Object.keys(LOTTERIES_CONFIG).find(
            key => LOTTERIES_CONFIG[key].name.toLowerCase() === lotteryParam.toLowerCase()
        );
        if (foundKey) currentLottery = foundKey;
    }

    switchLottery(currentLottery);
    initGoogleAuthUI();
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

    const btnClear = document.getElementById('btn_clear');
    if (btnClear) btnClear.addEventListener('click', clearSelections);

    const btnGenerate = document.getElementById('btn_generate');
    if (btnGenerate) btnGenerate.addEventListener('click', generateGames);

    const btnSave = document.getElementById('btn_save');
    if (btnSave) btnSave.addEventListener('click', saveGames);

    const btnDownload = document.getElementById('btn_download');
    if (btnDownload) btnDownload.addEventListener('click', downloadTXT);
}

// ===== GOOGLE AUTH UI INTEGRADO =====
function initGoogleAuthUI() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        try {
            google.accounts.id.initialize({
                client_id: "383374785711-e00t37fkf9q6aqe5imqi0nnh29v2npq4.apps.googleusercontent.com",
                callback: typeof handleCredentialResponse !== 'undefined' ? handleCredentialResponse : () => {},
                ux_mode: "popup"
            });

            const authContainer = document.getElementById('google_auth_container');
            if (authContainer) {
                google.accounts.id.renderButton(
                    authContainer,
                    { theme: "outline", size: "medium", text: "signin_with" }
                );
            }
        } catch (e) {
            console.error("Erro ao carregar botão do Google:", e);
        }
    }
}

function switchLottery(type) {
    if (!LOTTERIES_CONFIG[type]) return;
    currentLottery = type;
    const config = LOTTERIES_CONFIG[type];

    const pageTitle = document.getElementById('page_title');
    if (pageTitle) pageTitle.textContent = `Gerador - ${config.name}`;

    const volanteTitle = document.getElementById('volante_title');
    if (volanteTitle) volanteTitle.textContent = `Volante de Seleção (${config.name})`;

    // Destaca o botão ativo da loteria se existir a lista de botões
    document.querySelectorAll('.btn-lottery').forEach(btn => {
        if (btn.getAttribute('data-type') === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    clearSelections();
    buildGrid();
    populateFilterSelects();
}

function buildGrid() {
    const grid = document.getElementById('numbers_grid');
    if (!grid) return;
    grid.innerHTML = '';
    const config = LOTTERIES_CONFIG[currentLottery];

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
    const summaryInfo = document.getElementById('summary-info');
    if (!summaryInfo) return;

    if (config.isSuperSete) {
        const fixos = Array.from(fixedNumbers).join(', ') || 'Nenhum / None / Ninguno';
        const excl = Array.from(excludedNumbers).join(', ') || 'Nenhum / None / Ninguno';
        summaryInfo.innerHTML = `
            Fixos: <strong style="color: #28a745;">${fixos}</strong> | 
            Excluídos: <strong style="color: #dc3545;">${excl}</strong>
        `;
        return;
    }

    const fixos = Array.from(fixedNumbers).sort((a,b)=>a-b).map(n => String(n).padStart(2, '0')).join(', ') || 'Nenhum / None / Ninguno';
    const excl = Array.from(excludedNumbers).sort((a,b)=>a-b).map(n => String(n).padStart(2, '0')).join(', ') || 'Nenhum / None / Ninguno';

    summaryInfo.innerHTML = `
        Fixos: <strong style="color: #28a745;">${fixos}</strong> | 
        Excluídos: <strong style="color: #dc3545;">${excl}</strong>
    `;

    updateStats(Array.from(fixedNumbers));
}

function updateStats(numbers) {
    const statsInfo = document.getElementById('stats_info');
    if (!statsInfo) return;

    if (numbers.length === 0 || typeof numbers[0] === 'string') {
        statsInfo.innerHTML = 'Pares: <strong>0</strong> | Ímpares: <strong>0</strong> | Primos: <strong>0</strong> | Soma: <strong>0</strong>';
        return;
    }
    const pares = numbers.filter(n => n % 2 === 0).length;
    const impares = numbers.filter(n => n % 2 !== 0).length;
    const primos = numbers.filter(isPrime).length;
    const soma = numbers.reduce((acc, curr) => acc + curr, 0);

    statsInfo.innerHTML = `
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
    
    const genList = document.getElementById('generated_games_list');
    if (genList) genList.innerHTML = '';
    
    buildGrid();
    updateSummary();
}

function populateFilterSelects() {
    const config = LOTTERIES_CONFIG[currentLottery];
    const max = config.defaultSelect;

    ['select_pares', 'select_impares', 'select_primos'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '<option value="">Todos / All / Todos</option>';
        for (let i = 0; i <= max; i++) {
            select.innerHTML += `<option value="${i}">${i}</option>`;
        }
    });
}

function generateGames() {
    const config = LOTTERIES_CONFIG[currentLottery];
    const qtdInput = document.getElementById('qtd_jogos');
    const qtdGames = qtdInput ? parseInt(qtdInput.value) || 1 : 1;
    generatedGames = [];

    if (config.isSuperSete) {
        for (let g = 0; g < qtdGames; g++) {
            let gameCols = [];
            for (let col = 1; col <= 7; col++) {
                let fixedInCol = Array.from(fixedNumbers)
                    .filter(k => typeof k === 'string' && k.startsWith(`C${col}_`))
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

    const reqPares = document.getElementById('select_pares')?.value || "";
    const reqImpares = document.getElementById('select_impares')?.value || "";
    const reqPrimos = document.getElementById('select_primos')?.value || "";

    const pool = [];
    const start = config.zeroBased ? 0 : 1;
    const end = config.zeroBased ? config.maxNum - 1 : config.maxNum;

    for (let i = start; i <= end; i++) {
        if (!fixedNumbers.has(i) && !excludedNumbers.has(i)) pool.push(i);
    }

    // Validação de segurança para garantir espaço no conjunto
    if (fixedNumbers.size > config.defaultSelect) {
        alert(`Você fixou mais números (${fixedNumbers.size}) do que a quantidade padrão da aposta (${config.defaultSelect})!\nPor favor, remova alguns fixos.`);
        return;
    }

    let tentativas = 0;
    const maxTentativas = 5000;

    while (generatedGames.length < qtdGames && tentativas < maxTentativas) {
        tentativas++;
        let game = [...Array.from(fixedNumbers)];
        let tempPool = [...pool].sort(() => Math.random() - 0.5);

        while (game.length < config.defaultSelect && tempPool.length > 0) {
            game.push(tempPool.pop());
        }

        if (game.length < config.defaultSelect) break;

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

    if (generatedGames.length < qtdGames) {
        alert("Não foi possível gerar todos os jogos com a combinação de filtros selecionada.\nTente relaxar os filtros (ex: deixar Pares ou Primos em 'Todos').");
    }

    renderGeneratedGames();
}

function renderGeneratedGames() {
    const container = document.getElementById('generated_games_list');
    if (!container) return;
    container.innerHTML = '';

    if (generatedGames.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">Nenhum jogo gerado com esses filtros / No games generated / Ningún juego generado.</p>';
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
        alert("Gere pelo menos um jogo antes de salvar!\nGenerate at least one game before saving!");
        return;
    }

    // Proteção de assinatura ao salvar no LocalStorage
    const isAssinante = localStorage.getItem("is_subscriber") === "true";
    if (!isAssinante) {
        if (typeof mostrarDialogoNaoAssinante === 'function') {
            mostrarDialogoNaoAssinante(localStorage.getItem("user_name"));
        } else {
            alert("Apenas assinantes podem salvar jogos!\nOnly subscribers can save games!");
        }
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
    alert(`${generatedGames.length} jogo(s) salvo(s) com sucesso! / Saved successfully!`);
}

function downloadTXT() {
    if (generatedGames.length === 0) {
        alert("Gere pelo menos um jogo antes de baixar!\nGenerate at least one game before downloading!");
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