document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. INJETA FONTAWESOME (caso não exista) =====
    if (!document.getElementById('fa-icons')) {
        const fa = document.createElement('link');
        fa.id = 'fa-icons';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    // ===== 2. CRIA A BARRA DE ATALHOS =====
    let shortcutsContainer = document.querySelector('.shortcuts-bar');
    if (!shortcutsContainer) {
        shortcutsContainer = document.createElement('div');
        shortcutsContainer.className = 'shortcuts-bar';

        const shortcuts = [
            { label: 'Gerar Jogos', icon: 'fa-wand-magic-sparkles', url: 'gerar_jogos.html' },
            { label: 'Jogos Salvos', icon: 'fa-bookmark', url: 'saved_games.html' },
            { label: 'Downloads', icon: 'fa-download', url: 'download_results.html' },
            { label: 'Estatísticas', icon: 'fa-chart-pie', url: 'historico.html' },
            { label: 'Filtrar Números', icon: 'fa-filter', url: 'generator.html' },
            { label: 'Sorteio ao Vivo', icon: 'fa-tv', externalUrl: 'https://www.youtube.com/channel/UCPbhr02AfVb2nd5pm12BxTw/live' }
        ];

        shortcuts.forEach(item => {
            const btn = document.createElement('button');
            btn.innerHTML = `<i class="fa-solid ${item.icon}"></i> <span>${item.label}</span>`;
            btn.addEventListener('click', () => {
                if (item.externalUrl) {
                    window.open(item.externalUrl, '_blank');
                } else if (item.url) {
                    window.location.href = item.url;
                }
            });
            shortcutsContainer.appendChild(btn);
        });

        // Insere a barra logo após o header (toolbar)
        const header = document.querySelector('.toolbar');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(shortcutsContainer, header.nextSibling);
        } else {
            // Fallback: insere no início do body
            document.body.prepend(shortcutsContainer);
        }
    }

    // ===== 3. DEFINIÇÃO DAS LOTERIAS (incluindo card premium) =====
    const lotteries = [
        // CARD PREMIUM (destaque)
        {
            id: 'premium',
            name: 'Estratégias Premium',
            type: 'PREMIUM',
            color: '#FFD700',
            icon: 'fa-crown',
            desc: '12 algoritmos avançados para gerar combinações inteligentes',
            isPremium: true
        },
        // Loterias normais
        { id: 'megasena', name: 'Mega-Sena', type: 'MEGA_SENA', concurso: '2810', numbers: '05 - 12 - 24 - 33 - 41 - 58', estimativa: 'R$ 45.000.000', acumulo: true, color: '#209869' },
        { id: 'lotofacil', name: 'Lotofácil', type: 'LOTOFACIL', concurso: '3100', numbers: '01 - 03 - 05 - 08 - 09 - 10 - 12 - 15...', estimativa: 'R$ 1.700.000', acumulo: false, color: '#930089' },
        { id: 'quina', name: 'Quina', type: 'QUINA', concurso: '6450', numbers: '14 - 28 - 39 - 52 - 71', estimativa: 'R$ 12.500.000', acumulo: true, color: '#260085' },
        { id: 'lotomania', name: 'Lotomania', type: 'LOTOMANIA', concurso: '2620', numbers: '02 - 11 - 18 - 25 - 33 - 42...', estimativa: 'R$ 8.000.000', acumulo: true, color: '#f78100' },
        { id: 'timemania', name: 'Timemania', type: 'TIMEMANIA', concurso: '2090', numbers: '07 - 19 - 22 - 45 - 61 - 70 - 79', estimativa: 'R$ 5.200.000', acumulo: true, color: '#2ecc71' },
        { id: 'duplasena', name: 'Dupla Sena', type: 'DUPLA_SENA', concurso: '2665', numbers: '08 - 14 - 27 - 31 - 40 - 49', estimativa: 'R$ 3.800.000', acumulo: true, color: '#a61324' },
        { id: 'diadesorte', name: 'Dia de Sorte', type: 'DIA_DE_SORTE', concurso: '0915', numbers: '03 - 09 - 14 - 18 - 21 - 25 - 30', estimativa: 'R$ 1.200.000', acumulo: false, color: '#cb8322' },
        { id: 'supersete', name: 'Super Sete', type: 'SUPER_SETE', concurso: '0540', numbers: '3 - 7 - 1 - 9 - 4 - 0 - 8', estimativa: 'R$ 2.100.000', acumulo: true, color: '#a8cf45' },
        { id: 'maismilionaria', name: '+Milionária', type: 'MAIS_MILIONARIA', concurso: '0145', numbers: '12 - 21 - 34 - 38 - 42 - 47', estimativa: 'R$ 185.000.000', acumulo: true, color: '#1b365d' }
    ];

    // ===== 4. CONTAINER DO GRID =====
    let container = document.querySelector('#lottery_grid');
    if (!container) {
        container = document.createElement('div');
        container.id = 'lottery_grid';
        container.className = 'lottery-grid';
        const main = document.querySelector('main') || document.body;
        main.appendChild(container);
    }
    container.className = 'lottery-grid';

    // ===== 5. RENDERIZAÇÃO DOS CARDS =====
    container.innerHTML = lotteries.map(lot => {
        // Card Premium
        if (lot.isPremium) {
            return `
                <div class="lottery-card premium-card" onclick="window.location.href='estrategias.html'">
                    <i class="fa-solid ${lot.icon}" style="font-size: 3.5rem; color: #FFD700; margin-bottom: 12px;"></i>
                    <h3>${lot.name}</h3>
                    <p>${lot.desc}</p>
                    <span class="explore-btn"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
                    <div class="lock-badge"><i class="fa-solid fa-lock"></i> Acesso exclusivo</div>
                </div>
            `;
        }

        // Cards normais
        let lotData = { ...lot };
        const savedData = localStorage.getItem('ultimo_resultado_' + lot.id);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                lotData.concurso = parsed.concurso || lot.concurso;
                if (Array.isArray(parsed.dezenasSorteadas) && parsed.dezenasSorteadas.length > 0) {
                    lotData.numbers = parsed.dezenasSorteadas.join(' - ');
                }
                if (parsed.valorEstimadoProximoConcurso) {
                    lotData.estimativa = 'R$ ' + Number(parsed.valorEstimadoProximoConcurso).toLocaleString('pt-BR');
                }
                if (parsed.acumulado !== undefined) {
                    lotData.acumulo = parsed.acumulado;
                }
            } catch (e) { console.error(e); }
        }

        return `
            <div class="lottery-card" style="border-top-color: ${lotData.color};">
                <div class="card-header">
                    <h3 style="color: ${lotData.color};">${lotData.name}</h3>
                    <span class="badge-conc">Concurso: ${lotData.concurso}</span>
                </div>
                <div class="drawn-numbers">${lotData.numbers}</div>
                ${lotData.acumulo ? '<span class="badge-accumulated">Acumulou!</span>' : ''}
                <div class="estimate-prize">Estimativa: <strong style="color: ${lotData.color};">${lotData.estimativa}</strong></div>
                <button class="btn-generate" style="background: ${lotData.color};" onclick="window.location.href='index.html?lottery=${lotData.id}'">
                    <i class="fa-solid fa-filter"></i> Gerar por Filtro
                </button>
            </div>
        `;
    }).join('');
});