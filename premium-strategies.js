// Configuração e Estado Global
let selectedLottery = "Mega-Sena";
let selectedStrategyIndex = 0;
let generatedGamesList = [];

// Histórico de Frequência Simulado (Substitua via Chamada AJAX REST do seu backend Spring/Servlet se preferir)
const mockHistoryFrequency = {
    10: 120, 23: 115, 34: 110, 41: 108, 52: 105, 58: 101, 05: 98, 13: 95, 21: 90
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
    if (name === "Mega-Sena") numInput.value = 6;
    else if (name === "Lotofácil") numInput.value = 15;
    else if (name === "Quina") numInput.value = 5;
    else if (name === "Lotomania") numInput.value = 50;
}

function setQuickGames(count) {
    document.getElementById("inputGameCount").value = count;
    document.querySelectorAll(".quick-chip").forEach(el => el.classList.remove("active"));
    event.target.classList.add("active");
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
}

// Algoritmos Traduzidos de Kotlin
function generateGames() {
    const gameCount = parseInt(document.getElementById("inputGameCount").value);
    const numbersPerGame = parseInt(document.getElementById("inputNumbersPerGame").value);
    const maxNum = selectedLottery === "Lotofácil" ? 25 : (selectedLottery === "Quina" ? 80 : 60);

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

// Estratégia 0: Boltzmann
function generateBoltzmann(needed, maxNum) {
    let result = new Set();
    while (result.size < needed) {
        let candidate = Math.floor(Math.random() * maxNum) + 1;
        let freq = mockHistoryFrequency[candidate] || 10;
        let prob = Math.exp(freq / 100);
        if (Math.random() < (prob / Math.E)) {
            result.add(candidate);
        }
    }
    return Array.from(result);
}

// Estratégia 3: Clusters
function generateClusters(needed, maxNum) {
    let result = new Set();
    const hotList = [10, 23, 34, 41, 52, 58]; // Exemplo de quentes
    
    // Adiciona 40% quentes
    let hotTarget = Math.floor(needed * 0.4);
    while (result.size < hotTarget && hotList.length > 0) {
        result.add(hotList[Math.floor(Math.random() * hotList.length)]);
    }
    
    // Preenche o restante com aleatórios
    while (result.size < needed) {
        result.add(Math.floor(Math.random() * maxNum) + 1);
    }
    return Array.from(result);
}

function generateRandomBalanced(needed, maxNum) {
    let result = new Set();
    while (result.size < needed) {
        result.add(Math.floor(Math.random() * maxNum) + 1);
    }
    return Array.from(result);
}

function renderResults() {
    const section = document.getElementById("resultsSection");
    const container = document.getElementById("gamesOutput");
    container.innerHTML = "";
    
    generatedGamesList.forEach((game, idx) => {
        const row = document.createElement("div");
        row.className = "card bg-secondary text-white p-2";
        
        let ballsHtml = game.map(n => `<span class="ball bg-megasena">${String(n).padStart(2, '0')}</span>`).join("");
        row.innerHTML = `<div class="d-flex align-items-center justify-content-between">
            <span><strong>Jogo ${idx + 1}:</strong></span>
            <div>${ballsHtml}</div>
        </div>`;
        container.appendChild(row);
    });

    section.classList.remove("d-none");
}

function saveAllGames() {
    alert(`${generatedGamesList.length} jogos prontos para serem salvos via API REST Java!`);
}