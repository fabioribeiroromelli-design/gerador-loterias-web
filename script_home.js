document.addEventListener('DOMContentLoaded', () => {
    // 1. Injeta os estilos do FontAwesome (ícones)
    if (!document.getElementById('fa-icons')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.id = 'fa-icons';
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    // 2. Cria a barra de atalhos no topo
    let shortcutsContainer = document.querySelector('.shortcuts-bar');
    if (!shortcutsContainer) {
        shortcutsContainer = document.createElement('div');
        shortcutsContainer.className = 'shortcuts-bar';
        shortcutsContainer.setAttribute('style', `
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            max-width: 1200px;
            margin: 15px auto;
            padding: 0 10px;
        `);

        // MAPEAMENTO INVERTIDO CONFORME SOLICITADO:
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
            btn.setAttribute('style', `
                display: flex;
                align-items: center;
                gap: 8px;
                background: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 10px 14px;
                font-weight: 600;
                color: #444;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                transition: all 0.2s ease;
            `);
            btn.innerHTML = `<i class="fa-solid ${item.icon}" style="color: #001489; font-size: 1.1rem;"></i> <span>${item.label}</span>`;
            
            btn.addEventListener('mouseover', () => btn.style.background = '#f5f5f5');
            btn.addEventListener('mouseout', () => btn.style.background = '#ffffff');
            btn.addEventListener('click', () => {
                if (item.externalUrl) {
                    window.open(item.externalUrl, '_blank');
                } else if (item.url) {
                    window.location.href = item.url;
                }
            });

            shortcutsContainer.appendChild(btn);
        });

        document.body.insertBefore(shortcutsContainer, document.body.children[1] || document.body.firstChild);
    }

    // 3. Definição base das loterias COM AS CORES OFICIAIS DA CAIXA
    const lotteries = [
        { id: 'megasena', name: 'Mega-Sena', type: 'MEGA_SENA', concurso: '2810', numbers: '05 - 12 - 24 - 33 - 41 - 58', estimativa: 'R$ 45.000.000', acumulo: true, color: '#209869' },
        { id: 'lotofacil', name: 'Lotofácil', type: 'LOTOFACIL', concurso: '3100', numbers: '01 - 03 - 05 - 08 - 09 - 10 - 12 - 15...', estimativa: 'R$ 1.700.000', acumulo: false, color: '#930089' },
        { id: 'quina', name: 'Quina', type: 'QUINA', concurso: '6450', numbers: '14 - 28 - 39 - 52 - 71', estimativa: 'R$ 12.500.000', acumulo: true, color: '#260085' },
        { id: 'lotomania', name: 'Lotomania', type: 'LOTOMANIA', concurso: '2620', numbers: '02 - 11 - 18 - 25 - 33 - 42...', estimativa: 'R$ 8.000.000', acumulo: true, color: '#f78100' },
        { id: 'timemania', name: 'Timemania', type: 'TIMEMANIA', concurso: '2090', numbers: '07 - 19 - 22 - 45 - 61 - 70 - 79', estimativa: 'R$ 5.200.000', acumulo: false, color: '#00ff2b' },
        { id: 'duplasena', name: 'Dupla Sena', type: 'DUPLA_SENA', concurso: '2665', numbers: '08 - 14 - 27 - 31 - 40 - 49', estimativa: 'R$ 3.800.000', acumulo: true, color: '#a61324' },
        { id: 'diadesorte', name: 'Dia de Sorte', type: 'DIA_DE_SORTE', concurso: '0915', numbers: '03 - 09 - 14 - 18 - 21 - 25 - 30', estimativa: 'R$ 1.200.000', acumulo: false, color: '#cb8322' },
        { id: 'supersete', name: 'Super Sete', type: 'SUPER_SETE', concurso: '0540', numbers: '3 - 7 - 1 - 9 - 4 - 0 - 8', estimativa: 'R$ 2.100.000', acumulo: true, color: '#a8cf45' },
        { id: 'maismilionaria', name: '+Milionária', type: 'MAIS_MILIONARIA', concurso: '0145', numbers: '12 - 21 - 34 - 38 - 42 - 47', estimativa: 'R$ 185.000.000', acumulo: true, color: '#1b365d' }
    ];

    let container = document.querySelector('.main-content, .grid-container, main, #lottery_grid');

    if (!container || container.tagName === 'BODY') {
        container = document.createElement('main');
        document.body.appendChild(container);
    }

    container.setAttribute('style', 'display: grid !important; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)) !important; gap: 20px !important; padding: 10px 20px 20px 20px !important; max-width: 1200px !important; margin: 0 auto !important;');

    // 4. Renderização sincronizada com o localStorage
    container.innerHTML = lotteries.map(lot => {
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
            } catch (e) {
                console.error("Erro ao carregar dados locais para " + lot.id, e);
            }
        }

        // REDIRECIONAMENTO DOS CARDS PARA A TELA DE FILTROS (generator.html)
        return `
            <div style="background: #fff; border-radius: 12px; border-top: 6px solid ${lotData.color}; box-shadow: 0 4px 10px rgba(0,0,0,0.08); padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h3 style="margin: 0; color: ${lotData.color}; font-size: 1.2rem;">${lotData.name}</h3>
                        <span style="font-size: 0.8rem; background: #eee; padding: 2px 6px; border-radius: 4px;">Concurso: ${lotData.concurso}</span>
                    </div>
                    <div style="font-size: 0.9rem; font-weight: bold; margin-bottom: 8px; color: #444; word-break: break-all;">${lotData.numbers}</div>
                    ${lotData.acumulo ? '<span style="background: #dc3545; color: #fff; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: bold;">Acumulou!</span>' : ''}
                    <div style="font-size: 0.85rem; color: #666; margin-top: 8px;">Estimativa: <strong style="color: ${lotData.color};">${lotData.estimativa}</strong></div>
                </div>
                <button onclick="window.location.href='generator.html?lottery=${lotData.id}'" style="margin-top: 15px; background: ${lotData.color}; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fa-solid fa-filter"></i> Gerar por Filtro
                </button>
            </div>
        `;
    }).join('');
});