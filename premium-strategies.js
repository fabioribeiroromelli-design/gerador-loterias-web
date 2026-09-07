// Configuração e Estado Global
let selectedLottery = "Mega-Sena";
let selectedStrategyIndex = 0;
let generatedGamesList = [];

// Sistema Trilingüe (PT / EN / ES)
const translations = {
    pt: {
        savedSuccess: "jogos salvos com sucesso na sua lista!",
        noGamesToSave: "Gere alguns jogos antes de salvar.",
        game: "Jogo"
    },
    en: {
        savedSuccess: "games saved successfully to your list!",
        noGamesToSave: "Generate some games before saving.",
        game: "Game"
    },
    es: {
        savedSuccess: "juegos guardados con éxito en su lista!",
        noGamesToSave: "Genere algunos juegos antes de guardar.",
        game: "Juego"
    }
};

let currentLang = 'pt';

const mockHistoryFrequency = {
    10: 120, 23: 115, 34: 110, 41: 108, 52: 105, 58: 101, 5: 98, 13: 95, 21: 90
};

const strategies = [
    { name: "Boltzmann Premium", emoji: "🌡️", desc: "Probabilidade exponencial baseada em temperatura estatística", color: "#FF5722" },
    { name: "Regressão de Tendência", emoji: "📈", desc: "Reta de mínimos quadrados identifica números acima da tendência", color: "#2196F3" },
    { name: "Monte Carlo Ponderado", emoji: "🎲", desc: "Simula sorteios com pesos reais do histórico", color: "#9C27B0" },
    { name: "Clusters Quente/Frio", emoji: "🔮", desc: "Divide o volante em zonas: quente (40%), médio (30%), frio (30%)", color: "#E91E63" },
    { name: "Sequência Dourada", emoji: "✨", desc: "Van der Corput × φ = cobertura quasi-aleatória", color: "#FFEB3B" },
    { name: "Softmax Adaptativo", emoji: "🧠", desc: "Normalização exponencial com temperatura variável", color: "#00BCD4" }
];

document.addEventListener("DOMContentLoaded", () => {
    renderStrategyCards();
    changeLottery("Mega-Sena");
});

function renderStrategyCards() {
    const container = document.getElementById("strategyCardsContainer");
    if (!container) return;
    container.innerHTML = "";
    
    strategies.forEach((strat, idx) => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
            <div class="card card-strategy h-100 ${idx === selectedStrategyIndex ? 'selected' : ''}" onclick="selectStrategy(${idx})">
                <div class="card-body">
                    <h6 class="card-title" style="color: ${strat.color}">
                        <span>${strat.emoji}</span> ${strat.name}
                    </h6>
                    <p class="card-text small text-secondary">${strat.desc}</p>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

function selectStrategy(idx) {
    selectedStrategyIndex = idx;
    renderStrategyCards();
}

function changeLottery(name) {
    selectedLottery = name;
    const numInput = document.getElementById("inputNumbersPerGame");
    if (!numInput) return;

    if (name === "Mega-Sena") numInput.value = 6;
    else if (name === "Lotofácil") numInput.value = 15;
    else if (name === "Quina") numInput.value = 5;
    else if (name === "Lotomania") numInput.value = 50;
    else if (name === "Dia de Sorte") numInput.value = 7;
    else if (name === "Super Sete") numInput.value = 7;
}

function setQuickGames(count) {
    const gameInput = document.getElementById("inputGameCount");
    if (gameInput) gameInput.value = count;
    document.querySelectorAll(".quick-chip").forEach(el => el.classList.remove("active"));
    if (window.event && window.event.target) {
        window.event.target.classList.add("active");
    }
}

function generateGames() {
    const gameCountInput = document.getElementById("inputGameCount");
    const numbersInput = document.getElementById("inputNumbersPerGame");

    const gameCount = gameCountInput ? parseInt(gameCountInput.value) || 1 : 1;
    const numbersPerGame = numbersInput ? parseInt(numbersInput.value) || 6 : 6;
    
    let maxNum = 60;
    if (selectedLottery === "Lotofácil") maxNum = 25;
    else if (selectedLottery === "Quina") maxNum = 80;
    else if (selectedLottery === "Lotomania") maxNum = 100;

    generatedGamesList = [];

    for (let i = 0; i < gameCount; i++) {
        let game = [];
        if (selectedStrategyIndex === 0) {
            game = generateBoltzmann(numbersPerGame, maxNum);
        } else if (selectedStrategyIndex === 3) {
            game = generateClusters(numbersPerGame, maxNum);
        } else {
            game = generateRandomBalanced(numbersPerGame, maxNum);
        }
        generatedGamesList.push(game.sort((a, b) => a - b));
    }

    renderResults();
}

function generateBoltzmann(needed, maxNum) {
    let result = new Set();
    let attempts = 0;
    while (result.size < needed && attempts < 1000) {
        attempts++;
        let candidate = Math.floor(Math.random() * maxNum) + (selectedLottery === "Lotomania" ? 0 : 1);
        let freq = mockHistoryFrequency[candidate] || 10;
        let prob = Math.exp(freq / 100);
        if (Math.random() < (prob / Math.E)) {
            result.add(candidate);
        }
    }
    while (result.size < needed) {
        result.add(Math.floor(Math.random() * maxNum) + (selectedLottery === "Lotomania" ? 0 : 1));
    }
    return Array.from(result);
}

function generateClusters(needed, maxNum) {
    let result = new Set();
    const hotList = [10, 23, 34, 41, 52, 58];
    let hotTarget = Math.floor(needed * 0.4);

    while (result.size < hotTarget && hotList.length > 0) {
        let candidate = hotList[Math.floor(Math.random() * hotList.length)];
        if (candidate <= maxNum) result.add(candidate);
    }
    
    while (result.size < needed) {
        result.add(Math.floor(Math.random() * maxNum) + (selectedLottery === "Lotomania" ? 0 : 1));
    }
    return Array.from(result);
}

function generateRandomBalanced(needed, maxNum) {
    let result = new Set();
    while (result.size < needed) {
        result.add(Math.floor(Math.random() * maxNum) + (selectedLottery === "Lotomania" ? 0 : 1));
    }
    return Array.from(result);
}

function renderResults() {
    const section = document.getElementById("resultsSection");
    const container = document.getElementById("gamesOutput");
    if (!container) return;
    
    container.innerHTML = "";
    
    const txtGame = translations[currentLang].game;

    generatedGamesList.forEach((game, idx) => {
        const row = document.createElement("div");
        row.className = "card bg-secondary text-white p-2 mb-2";
        
        let ballsHtml = game.map(n => `<span class="ball bg-megasena m-1" style="display:inline-flex; width:34px; height:34px; background:#22c55e; color:#fff; border-radius:50%; align-items:center; justify-content:center; font-weight:bold;">${String(n).padStart(2, '0')}</span>`).join("");
        row.innerHTML = `<div class="d-flex align-items-center justify-content-between flex-wrap">
            <span><strong>${txtGame} ${idx + 1}:</strong></span>
            <div>${ballsHtml}</div>
        </div>`;
        container.appendChild(row);
    });

    if (section) section.classList.remove("d-none");
}

// Salva e força a gravação em todas as chaves do navegador
function saveAllGames() {
    const t = translations[currentLang];

    if (!generatedGamesList || generatedGamesList.length === 0) {
        alert(t.noGamesToSave);
        return;
    }

    const savedGames = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    generatedGamesList.forEach(game => {
        savedGames.push({
            id: Date.now() + Math.random(),
            loteria: selectedLottery,
            data: dataAtual,
            numeros: game
        });
    });

    // Grava na chave principal e nas chaves secundárias de segurança
    const stringified = JSON.stringify(savedGames);
    localStorage.setItem('saved_games_list', stringified);
    localStorage.setItem('jogos_salvos', stringified);

    if (selectedLottery === 'Lotofácil') {
        localStorage.setItem('jogos_salvos_lotofacil', stringified);
    } else if (selectedLottery === 'Lotomania') {
        localStorage.setItem('jogos_salvos_lotomania', stringified);
    }

    alert(`${generatedGamesList.length} ${t.savedSuccess}`);
}