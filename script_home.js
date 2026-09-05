const i18nHome = {
    pt: {
        title: "Loterias Disponíveis",
        btnGenerate: "Gerar Jogo",
        conc: "Concurso",
        accumulated: "Acumulou!",
        nextPrize: "Estimativa:",
        premiumTitle: "💎 Estratégias Premium",
        premiumSub: "12 estratégias exclusivas",
        premiumDesc: "Matemática avançada e IA"
    },
    en: {
        title: "Available Lotteries",
        btnGenerate: "Generate Game",
        conc: "Draw",
        accumulated: "Rollover!",
        nextPrize: "Est. Prize:",
        premiumTitle: "💎 Premium Strategies",
        premiumSub: "12 exclusive strategies",
        premiumDesc: "Advanced math & AI"
    },
    es: {
        title: "Loterías Disponibles",
        btnGenerate: "Generar Juego",
        conc: "Sorteo",
        accumulated: "¡Acumulado!",
        nextPrize: "Estimación:",
        premiumTitle: "💎 Estrategias Premium",
        premiumSub: "12 estrategias exclusivas",
        premiumDesc: "Matemática avanzada e IA"
    }
};

// Dados simulados mantendo o padrão exato da MainActivity do Android
const lotteryData = [
    { key: "MEGA_SENA", name: "Mega-Sena", color: "#209869", concurso: "2810", numbers: "05 - 12 - 24 - 33 - 41 - 58", accumulated: true, estimate: "R$ 45.000.000" },
    { key: "LOTOFACIL", name: "Lotofácil", color: "#930089", concurso: "3100", numbers: "01 - 03 - 05 - 08 - 09 - 10 - 12 - 15...", accumulated: false, estimate: "R$ 1.700.000" },
    { key: "QUINA", name: "Quina", color: "#261490", concurso: "6450", numbers: "14 - 28 - 39 - 52 - 71", accumulated: true, estimate: "R$ 12.500.000" },
    { key: "LOTOMANIA", name: "Lotomania", color: "#f78100", concurso: "2620", numbers: "02 - 11 - 18 - 25 - 33 - 42...", accumulated: true, estimate: "R$ 8.000.000" },
    { key: "TIMEMANIA", name: "Timemania", color: "#00ff80", colorText: "#000", concurso: "2090", numbers: "07 - 19 - 22 - 45 - 61 - 70 - 79", accumulated: false, estimate: "R$ 5.200.000" },
    { key: "DUPLA_SENA", name: "Dupla Sena", color: "#a61324", concurso: "2665", numbers: "08 - 14 - 27 - 31 - 40 - 49", accumulated: true, estimate: "R$ 3.800.000" },
    { key: "DIA_DE_SORTE", name: "Dia de Sorte", color: "#cb852b", concurso: "0915", numbers: "03 - 09 - 14 - 18 - 21 - 25 - 30", accumulated: false, estimate: "R$ 1.200.000" },
    { key: "SUPER_SETE", name: "Super Sete", color: "#a8cf45", colorText: "#000", concurso: "0540", numbers: "3 - 7 - 1 - 9 - 4 - 0 - 8", accumulated: true, estimate: "R$ 2.100.000" },
    { key: "MAIS_MILIONARIA", name: "+Milionária", color: "#1c325c", concurso: "0145", numbers: "12 - 21 - 34 - 38 - 42 - 47", accumulated: true, estimate: "R$ 185.000.000" },
    { key: "LOTECA", name: "Loteca", color: "#ca1323", concurso: "1112", numbers: "📋 Ver Placares", accumulated: false, estimate: "R$ 600.000" }
];

let currentLang = 'pt';

window.onload = () => {
    const txt = i18nHome[currentLang];
    document.getElementById('home_title').textContent = txt.title;
    const grid = document.getElementById('lottery_grid');
    grid.innerHTML = '';

    // Renderiza cada card de loteria
    lotteryData.forEach(lottery => {
        const card = document.createElement('div');
        card.className = 'lottery-card';
        card.style.borderTop = `6px solid ${lottery.color}`;
        
        card.innerHTML = `
            <div class="card-header">
                <h2 style="color: ${lottery.color}">${lottery.name}</h2>
                <span class="badge-conc">${txt.conc}: ${lottery.concurso}</span>
            </div>
            <div class="card-body">
                <p class="drawn-numbers">${lottery.numbers}</p>
                ${lottery.accumulated ? `<span class="badge-accumulated">${txt.accumulated}</span>` : ''}
                <p class="estimate-prize">${txt.nextPrize} <strong>${lottery.estimate}</strong></p>
            </div>
            <button class="btn-primary mt-10">${txt.btnGenerate}</button>
        `;

        card.onclick = () => {
            window.location.href = `index.html?type=${lottery.key}`;
        };

        grid.appendChild(card);
    });

    // Card Especial "Estratégias Premium" (Semelhante ao app Android)
    const premiumCard = document.createElement('div');
    premiumCard.className = 'lottery-card premium-card';
    premiumCard.innerHTML = `
        <h2>${txt.premiumTitle}</h2>
        <p class="premium-sub">${txt.premiumSub}</p>
        <p class="premium-desc">${txt.premiumDesc}</p>
        <button class="btn-premium mt-10">${txt.btnGenerate}</button>
    `;
    grid.appendChild(premiumCard);
};