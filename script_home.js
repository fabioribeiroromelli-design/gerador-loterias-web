document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('fa-icons')) {
        const fa = document.createElement('link');
        fa.id = 'fa-icons';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    const COLORS = {
        'Dia de Sorte': '#cb8322', 'Dupla Sena': '#a61324', 'Federal': '#002f6c',
        'Loteca': '#ca1518', 'Lotofácil': '#930089', 'Lotomania': '#F78100',
        '+Milionária': '#1b365d', 'Mega-Sena': '#209869', 'Quina': '#260085',
        'Super Sete': '#a8cf45', 'Timemania': '#2ecc71'
    };

    const ICONS = {
        'Dia de Sorte': 'fa-sun', 'Dupla Sena': 'fa-copy', 'Federal': 'fa-building-columns',
        'Loteca': 'fa-futbol', 'Lotofácil': 'fa-clover', 'Lotomania': 'fa-dice',
        '+Milionária': 'fa-gem', 'Mega-Sena': 'fa-trophy', 'Quina': 'fa-star',
        'Super Sete': 'fa-seven', 'Timemania': 'fa-clock'
    };

    // Ordenação alfabética tratando +Milionária como "Milionária" (letra M)
    const LOTTERIES = [
        { name: 'Dia de Sorte', endpoint: 'diadesorte' },
        { name: 'Dupla Sena', endpoint: 'duplasena' },
        { name: 'Federal', endpoint: 'federal' },
        { name: 'Loteca', endpoint: 'loteca' },
        { name: 'Lotofácil', endpoint: 'lotofacil' },
        { name: 'Lotomania', endpoint: 'lotomania' },
        { name: '+Milionária', endpoint: 'maismilionaria' },
        { name: 'Mega-Sena', endpoint: 'megasena' },
        { name: 'Quina', endpoint: 'quina' },
        { name: 'Super Sete', endpoint: 'supersete' },
        { name: 'Timemania', endpoint: 'timemania' }
    ];

    const CACHE_KEY = 'loterias_cache_data';
    const CACHE_TIME_KEY = 'loterias_cache_time';
    const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos

    async function fetchUltimoConcurso(endpoint, lotteryName) {
        let data = null;
        try {
            const res = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/${endpoint}`);
            if (res.ok) data = await res.json();
        } catch (e) {
            console.warn(`[${lotteryName}] Tentando API auxiliar...`);
        }

        if (!data) {
            try {
                const resAlt = await fetch(`https://api.guidi.dev.br/loteria/${endpoint}/ultimo`);
                if (resAlt.ok) data = await resAlt.json();
            } catch (e) {}
        }

        if (!data && window.DADOS_ULTIMOS_CONCURSOS && window.DADOS_ULTIMOS_CONCURSOS[lotteryName]) {
            data = window.DADOS_ULTIMOS_CONCURSOS[lotteryName];
        }

        return data;
    }

    function renderCard(lotteryName, data) {
        const color = COLORS[lotteryName] || '#6c757d';
        const icon = ICONS[lotteryName] || 'fa-hashtag';
        const cardId = `prizes_${lotteryName.replace(/[^a-zA-Z0-9]/g, '')}`;

        if (!data) {
            return `
                <div class="lottery-card" style="border-top-color: ${color}; opacity: 0.8;">
                    <div class="card-header">
                        <h3 style="color: ${color};"><i class="fa-solid ${icon}"></i> ${lotteryName}</h3>
                        <span class="badge-conc">Erro</span>
                    </div>
                    <div class="drawn-numbers">Indisponível</div>
                    <button class="btn-generate" style="background: ${color};" disabled>Sem Conexão</button>
                </div>
            `;
        }

        const concurso = data.numero || data.concurso || '--';
        const dezenas = data.listaDezenas || data.dezenas || [];
        const acumulado = Boolean(data.acumulado);
        const estimativa = data.valorEstimadoProximoConcurso || 0;
        const dataProximo = data.dataProximoConcurso || '';
        const localSorteio = data.nomeMunicipioUFSorteio || data.localSorteio || '';

        let numbersDisplay = '--';

        if (lotteryName === 'Federal' && dezenas.length > 0) {
            numbersDisplay = `
                <div style="font-size: 0.75rem; text-align: left; width: 100%; background: #f8f9fa; padding: 6px; border-radius: 4px; border: 1px solid #eee;">
                    ${dezenas.slice(0, 5).map((bilhete, i) => `
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 2px 0;">
                            <strong>${i + 1}º Prêmio:</strong> <span>${bilhete}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (lotteryName === 'Loteca') {
            const jogos = data.listaResultadoLoteca || data.listaResultadoEquipe || data.jogos || [];
            if (jogos.length > 0) {
                numbersDisplay = `
                    <div style="font-size: 0.7rem; max-height: 110px; overflow-y: auto; text-align: left; width: 100%; background: #f8f9fa; padding: 6px; border-radius: 4px; border: 1px solid #eee;">
                        ${jogos.map(j => {
                            const num = j.numJogo || j.nuJogo || j.sequencial || '';
                            const e1 = j.nomeEquipeUm || j.nomeTime1 || j.equipeUm || 'Time 1';
                            const e2 = j.nomeEquipeDois || j.nomeTime2 || j.equipeDois || 'Time 2';
                            const g1 = j.golEquipeUm ?? j.golsTime1 ?? j.nuGolEquipeUm ?? '-';
                            const g2 = j.golEquipeDois ?? j.golsTime2 ?? j.nuGolEquipeDois ?? '-';
                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 3px 0;">
                                    <span style="font-weight: bold; color: ${color};">J${num}:</span>
                                    <span style="flex: 1; text-align: center; color: #333; margin: 0 4px;">${e1} <strong>${g1} x ${g2}</strong> ${e2}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                numbersDisplay = `<span style="font-size: 0.78rem; color: #777;">Placares em apuração</span>`;
            }
        } else if (dezenas.length > 0) {
            const formatted = dezenas.map(n => String(parseInt(n, 10)).padStart(2, '0'));
            if (lotteryName === 'Lotomania') {
                numbersDisplay = `<span style="font-size:0.68rem; letter-spacing: 0.5px;">${formatted.join(' ')}</span>`;
            } else {
                numbersDisplay = formatted.join(' - ');
            }
        }

        let rateioHtml = '';
        if (data.listaRateioPremio && data.listaRateioPremio.length > 0) {
            rateioHtml = data.listaRateioPremio.map(item => {
                const desc = item.descricaoFaixa || `${item.faixa} acertos`;
                const g = item.numeroDeGanhadores;
                const ganhadoresTxt = g === 0 
                    ? '<span style="color:#d9534f; font-weight:bold;">Não houve</span>' 
                    : `${g.toLocaleString('pt-BR')} ${g === 1 ? 'ganhador' : 'ganhadores'}`;
                
                const valTxt = item.valorPremio > 0 
                    ? `<strong style="color:#209869;">R$ ${Number(item.valorPremio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>` 
                    : 'R$ 0,00';
                
                return `
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px; border-bottom: 1px dotted #e0e0e0; padding: 4px 0; font-size: 0.72rem; text-align: left;">
                        <span style="color: #333; font-weight: 600;">${desc}</span>
                        <div style="text-align: right;">
                            <div>${ganhadoresTxt}</div>
                            <div>${valTxt}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        let extraBadge = '';
        if (lotteryName === 'Dia de Sorte' && data.nomeTimeCoracaoMesSorte) {
            extraBadge = `<span class="badge-extra"><i class="fa-solid fa-calendar-alt"></i> Mês: ${data.nomeTimeCoracaoMesSorte}</span>`;
        } else if (lotteryName === 'Timemania' && data.nomeTimeCoracaoMesSorte) {
            extraBadge = `<span class="badge-extra"><i class="fa-solid fa-shield-halved"></i> ${data.nomeTimeCoracaoMesSorte}</span>`;
        } else if (lotteryName === '+Milionária' && data.trevosSorteados?.length > 0) {
            extraBadge = `<span class="badge-extra"><i class="fa-solid fa-star"></i> Trevos: ${data.trevosSorteados.join(' - ')}</span>`;
        }

        const estimativaFormatada = estimativa > 0 
            ? 'R$ ' + Number(estimativa).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) 
            : 'R$ 0,00';

        return `
            <div class="lottery-card" style="border-top-color: ${color};">
                <div class="card-header">
                    <h3 style="color: ${color};"><i class="fa-solid ${icon}"></i> ${lotteryName}</h3>
                    <span class="badge-conc">Conc: ${concurso}</span>
                </div>
                <div class="drawn-numbers">${numbersDisplay}</div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0;">
                    ${acumulado 
                        ? '<span class="badge-accumulated"><i class="fa-solid fa-fire"></i> Acumulou!</span>' 
                        : '<span class="badge-extra" style="background:#e8f5e9; color:#2e7d32;"><i class="fa-solid fa-trophy"></i> Teve Ganhador!</span>'
                    }
                    ${extraBadge}
                </div>

                ${localSorteio ? `<div style="font-size: 0.68rem; color: #777; margin: 2px 0;"><i class="fa-solid fa-location-dot"></i> Sorteio em: ${localSorteio}</div>` : ''}

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: #555; margin: 6px 0; border-top: 1px dashed #eee; padding-top: 4px;">
                    <span>Próx. Estimado: <strong style="color: ${color};">${estimativaFormatada}</strong></span>
                    ${dataProximo ? `<span>Data: <strong>${dataProximo}</strong></span>` : ''}
                </div>

                ${rateioHtml ? `
                    <div style="margin: 6px 0;">
                        <button onclick="togglePrizes('${cardId}')" style="background: #f8f9fa; border: 1px solid ${color}; color: ${color}; border-radius: 4px; padding: 4px 8px; font-size: 0.72rem; cursor: pointer; width: 100%; display: flex; justify-content: space-between; align-items: center; font-weight: 600;">
                            <span><i class="fa-solid fa-trophy"></i> Premiação</span>
                            <i class="fa-solid fa-chevron-down" id="icon_${cardId}"></i>
                        </button>
                        <div id="${cardId}" style="display: none; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; padding: 6px 8px; margin-top: 4px; max-height: 160px; overflow-y: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-weight: bold; font-size: 0.73rem; color: ${color}; margin-bottom: 4px; border-bottom: 1px solid ${color}; padding-bottom: 2px;">Detalhamento da Premiação</div>
                            ${rateioHtml}
                        </div>
                    </div>
                ` : ''}

                <button class="btn-generate" style="background: ${color};" onclick="window.location.href='generator.html?lottery=${encodeURIComponent(lotteryName)}'">
                    <i class="fa-solid fa-filter"></i> Gerar por Filtro
                </button>
            </div>
        `;
    }

    function renderPremiumCard() {
        return `
            <div class="lottery-card premium-card" onclick="window.location.href='premium-strategies.html'">
                <i class="fa-solid fa-crown" style="font-size: 2.8rem; color: #FFD700; margin-bottom: 6px;"></i>
                <h3 style="color: #FFD700; margin: 0 0 4px 0;">Estratégias Premium</h3>
                <p style="color: #ccc; margin: 0 0 8px 0; font-size: 0.85rem;">12 algoritmos avançados</p>
                <span class="explore-btn"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
                <div class="lock-badge"><i class="fa-solid fa-lock"></i> Acesso exclusivo</div>
            </div>
        `;
    }

    window.togglePrizes = function(id) {
        const el = document.getElementById(id);
        const icon = document.getElementById(`icon_${id}`);
        if (!el) return;
        if (el.style.display === 'none') {
            el.style.display = 'block';
            if (icon) icon.className = 'fa-solid fa-chevron-up';
        } else {
            el.style.display = 'none';
            if (icon) icon.className = 'fa-solid fa-chevron-down';
        }
    };

    const grid = document.getElementById('lottery_grid');
    if (!grid) return;

    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const cachedDataStr = localStorage.getItem(CACHE_KEY);
    const now = Date.now();

    let results = null;

    if (cachedTime && cachedDataStr && (now - parseInt(cachedTime, 10)) < CACHE_DURATION_MS) {
        try {
            results = JSON.parse(cachedDataStr);
        } catch (e) {
            results = null;
        }
    }

    if (!results) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1.2rem; color: #666;"><i class="fa-solid fa-spinner fa-spin"></i> Buscando resultados das loterias...</div>';
        const promises = LOTTERIES.map(lot => fetchUltimoConcurso(lot.endpoint, lot.name));
        results = await Promise.all(promises);

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(results));
            localStorage.setItem(CACHE_TIME_KEY, now.toString());
        } catch (e) {}
    }

    let html = renderPremiumCard();

    LOTTERIES.forEach((lot, index) => {
        html += renderCard(lot.name, results[index]);
    });

    grid.innerHTML = html;
});