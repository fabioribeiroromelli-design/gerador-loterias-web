document.addEventListener('DOMContentLoaded', async () => {
    // ===== 1. INJETAR FONTAWESOME E BIBLIOTECA GOOGLE AUTH =====
    if (!document.getElementById('fa-icons')) {
        const fa = document.createElement('link');
        fa.id = 'fa-icons';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);
    }

    // Garante que a flag global de controle exista corretamente
    if (window._googleAuthInitialized === undefined) {
        window._googleAuthInitialized = false;
    }

    const existingGsiScript = document.getElementById('google-gsi-script');
    if (!existingGsiScript) {
        const gsi = document.createElement('script');
        gsi.id = 'google-gsi-script';
        gsi.src = 'https://accounts.google.com/gsi/client';
        gsi.async = true;
        gsi.defer = true;
        gsi.onload = () => {
            initGoogleAuth();
        };
        document.head.appendChild(gsi);
    } else {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            initGoogleAuth();
        } else {
            existingGsiScript.addEventListener('load', () => {
                initGoogleAuth();
            }, { once: true });
        }
    }

    function initGoogleAuth() {
        if (window._googleAuthInitialized) return;
        
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
            return;
        }

        window._googleAuthInitialized = true;

        // Procura se já existe um container específico no HTML para o botão do Google (evitando duplicar)
        let authContainer = document.getElementById('google_auth_container');
        if (!authContainer) {
            // Se não existir, procura por alguma classe padrão ou barra de topo para injetar de forma limpa sem duplicar
            authContainer = document.querySelector('.login-container') || document.querySelector('.toolbar');
            if (!authContainer) {
                authContainer = document.createElement('div');
                authContainer.id = 'google_auth_container';
                document.body.prepend(authContainer);
            }
        }

        try {
            google.accounts.id.initialize({
                client_id: "383374785711-e00t37fkf9q6aqe5imqi0nnh29v2npq4.apps.googleusercontent.com",
                callback: handleCredentialResponse,
                ux_mode: "popup"
            });

            google.accounts.id.renderButton(
                authContainer,
                { theme: "outline", size: "medium", text: "signin_with" }
            );
        } catch (error) {
            console.error("Erro ao inicializar Google Auth:", error);
            window._googleAuthInitialized = false;
        }
    }

    // ===== 2. BARRA DE ATALHOS =====
    function createShortcuts() {
        let container = document.querySelector('.shortcuts-bar');
        if (container) return container;

        container = document.createElement('div');
        container.className = 'shortcuts-bar';

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
            container.appendChild(btn);
        });

        const header = document.querySelector('.toolbar');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(container, header.nextSibling);
        } else {
            document.body.prepend(container);
        }
        return container;
    }
    createShortcuts();

    // ===== 3. CORES E ÍCONES DAS LOTERIAS =====
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

    const LOTTERIES = [
        { name: 'Dia de Sorte' },
        { name: 'Dupla Sena' },
        { name: 'Federal' },
        { name: 'Loteca' },
        { name: 'Lotofácil' },
        { name: 'Lotomania' },
        { name: '+Milionária' },
        { name: 'Mega-Sena' },
        { name: 'Quina' },
        { name: 'Super Sete' },
        { name: 'Timemania' }
    ];

    // ===== 4. FUNÇÃO PARA PEGAR OS DADOS DIRETO DO ARQUIVO LOCAL (dados_loteria.js) =====
    function fetchUltimoConcursoLocal(lotteryName) {
        if (window.DADOS_ULTIMOS_CONCURSOS && window.DADOS_ULTIMOS_CONCURSOS[lotteryName]) {
            return window.DADOS_ULTIMOS_CONCURSOS[lotteryName];
        }
        return null;
    }

    // ===== 5. RENDERIZAÇÃO DOS CARDS DE LOTERIAS =====
    function renderCard(lotteryName, data) {
        const color = COLORS[lotteryName] || '#6c757d';
        const icon = ICONS[lotteryName] || 'fa-hashtag';
        const cardId = `prizes_${lotteryName.replace(/[^a-zA-Z0-9]/g, '')}`;

        if (!data) {
            return `
                <div class="lottery-card" style="border-top-color: ${color}; opacity: 0.8;">
                    <div class="card-header">
                        <h3 style="color: ${color};"><i class="fa-solid ${icon}"></i> ${lotteryName}</h3>
                        <span class="badge-conc">Indisponível</span>
                    </div>
                    <div class="drawn-numbers">Sem dados</div>
                    <button class="btn-generate" style="background: ${color};" disabled>Aguardando Atualização</button>
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

    // ===== 6. CARDS ESPECIAIS (GERADORES) =====
    function renderPremiumCard() {
        return `
            <div class="lottery-card premium-card" onclick="window.location.href='estrategias.html'">
                <i class="fa-solid fa-crown" style="font-size: 2.8rem; color: #FFD700; margin-bottom: 6px;"></i>
                <h3 style="color: #FFD700; margin: 0 0 4px 0;">Estratégias Premium</h3>
                <p style="color: #ccc; margin: 0 0 8px 0; font-size: 0.85rem;">12 algoritmos avançados</p>
                <span class="explore-btn"><i class="fa-solid fa-arrow-right"></i> Explorar</span>
                <div class="lock-badge"><i class="fa-solid fa-lock"></i> Acesso exclusivo</div>
            </div>
        `;
    }

    function renderAvancadoCard() {
        return `
            <div class="lottery-card card-avancado" onclick="window.location.href='gerador-avancado.html'">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-microchip" style="font-size: 2rem; color: #2563eb;"></i>
                    <h3 style="color: #1e40af; margin: 0;">Gerador Avançado</h3>
                </div>
                <p style="color: #1e3a5f; font-size: 0.85rem; margin: 8px 0;">12 estratégias estatísticas e matemáticas</p>
                <span class="access-btn" style="background: #2563eb; color: white; padding: 4px 14px; border-radius: 30px; font-weight: bold; font-size: 0.8rem;">
                    <i class="fa-solid fa-arrow-right"></i> Acessar
                </span>
            </div>
        `;
    }

    function renderLotofacilRepeticaoCard() {
        return `
            <div class="lottery-card card-lotofacil-rep" onclick="window.location.href='lotofacil-repeticao.html'">
                <i class="fa-solid fa-rotate" style="font-size: 2rem; color: #930089; margin-bottom: 6px;"></i>
                <h3 style="color: #930089; margin: 0 0 4px 0;">Lotofácil - Repetição</h3>
                <p style="color: #555; font-size: 0.8rem; margin: 0 0 8px 0;">Estratégia baseada na repetição do último concurso</p>
                <span class="access-btn" style="background: #930089; color: white; padding: 4px 14px; border-radius: 30px; font-weight: bold; font-size: 0.75rem;">
                    <i class="fa-solid fa-arrow-right"></i> Acessar
                </span>
            </div>
        `;
    }

    function renderLotomaniaEstrategiaCard() {
        return `
            <div class="lottery-card card-lotomania-est" onclick="window.location.href='lotomania-estrategia.html'">
                <i class="fa-solid fa-chart-simple" style="font-size: 2rem; color: #F78100; margin-bottom: 6px;"></i>
                <h3 style="color: #F78100; margin: 0 0 4px 0;">Lotomania - Estratégia</h3>
                <p style="color: #555; font-size: 0.8rem; margin: 0 0 8px 0;">Distribuição equilibrada por linhas (5 por linha)</p>
                <span class="access-btn" style="background: #F78100; color: white; padding: 4px 14px; border-radius: 30px; font-weight: bold; font-size: 0.75rem;">
                    <i class="fa-solid fa-arrow-right"></i> Acessar
                </span>
            </div>
        `;
    }

    function renderDiadesorteRepeticaoCard() {
        return `
            <div class="lottery-card card-diadesorte-rep" onclick="window.location.href='diadesorte-repeticao.html'">
                <i class="fa-solid fa-calendar-day" style="font-size: 2rem; color: #cb8322; margin-bottom: 6px;"></i>
                <h3 style="color: #cb8322; margin: 0 0 4px 0;">Dia de Sorte - Repetição</h3>
                <p style="color: #555; font-size: 0.8rem; margin: 0 0 8px 0;">Estratégia baseada na repetição do último concurso</p>
                <span class="access-btn" style="background: #cb8322; color: white; padding: 4px 14px; border-radius: 30px; font-weight: bold; font-size: 0.75rem;">
                    <i class="fa-solid fa-arrow-right"></i> Acessar
                </span>
            </div>
        `;
    }

    function renderSorteioGloboCard() {
        return `
            <div class="lottery-card card-sorteio-globo" onclick="window.location.href='sorteio-globo.html'">
                <i class="fa-solid fa-globe" style="font-size: 2rem; color: #60a5fa; margin-bottom: 6px;"></i>
                <h3 style="color: #60a5fa; margin: 0 0 4px 0;">Sorteio Globo</h3>
                <p style="color: #94a3b8; font-size: 0.8rem; margin: 0 0 8px 0;">Sorteio interativo com animações e sons</p>
                <span class="access-btn" style="background: #2563eb; color: white; padding: 4px 14px; border-radius: 30px; font-weight: bold; font-size: 0.75rem;">
                    <i class="fa-solid fa-arrow-right"></i> Acessar
                </span>
            </div>
        `;
    }

    // ===== 7. FUNÇÃO PARA TOGGLE DA PREMIAÇÃO =====
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

    // ===== 8. CARREGAMENTO PRINCIPAL INSTANTÂNEO =====
    const grid = document.getElementById('lottery_grid');
    if (!grid) return;

    let results = LOTTERIES.map(lot => fetchUltimoConcursoLocal(lot.name));

    // ===== MONTA O GRID: CARDS ESPECIAIS + LOTERIAS =====
    let html = '';
    
    html += renderPremiumCard();
    html += renderAvancadoCard();
    html += renderLotofacilRepeticaoCard();
    html += renderLotomaniaEstrategiaCard();
    html += renderDiadesorteRepeticaoCard();
    html += renderSorteioGloboCard();

    LOTTERIES.forEach((lot, index) => {
        html += renderCard(lot.name, results[index]);
    });

    grid.innerHTML = html;
});

// ===== FUNÇÃO DE DIÁLOGO ELEGANTE PARA NÃO ASSINANTES =====
function mostrarDialogoNaoAssinante(nomeUsuario) {
    // Remove modal anterior se já existir
    const modalAntigo = document.getElementById('modal-assinatura-exclusivo');
    if (modalAntigo) modalAntigo.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-assinatura-exclusivo';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(5px);
        display: flex; justify-content: center; align-items: center; z-index: 99999;
        animation: fadeIn 0.3s ease;
    `;

    overlay.innerHTML = `
        <div style="
            background: #ffffff; width: 90%; max-width: 420px; border-radius: 16px;
            padding: 30px 24px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.3);
            font-family: inherit; position: relative; border-top: 6px solid #209869;
        ">
            <div style="
                width: 65px; height: 65px; background: #e8f5e9; color: #209869; border-radius: 50%;
                display: flex; align-items: center; justify-content: center; font-size: 30px;
                margin: 0 auto 20px auto; box-shadow: 0 4px 10px rgba(32, 152, 105, 0.2);
            ">
                <i class="fa-solid fa-crown"></i>
            </div>
            
            <h3 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 1.4rem;">Olá, ${nomeUsuario || 'Visitante'}!</h3>
            <p style="color: #555; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">
                Identificamos que você ainda não possui uma assinatura ativa do aplicativo. Para desbloquear todas as estratégias avançadas e recursos exclusivos, baixe nosso app e assine um plano!
            </p>
            
            <a href="https://play.google.com/store/apps/details?id=com.fabioribeiroromelli.geradordejogos" target="_blank" style="
                display: block; background: #209869; color: white; text-decoration: none;
                padding: 14px 20px; border-radius: 30px; font-weight: bold; font-size: 1rem;
                box-shadow: 0 4px 15px rgba(32, 152, 105, 0.4); margin-bottom: 12px; transition: background 0.2s;
            ">
                <i class="fa-brands fa-google-play"></i> Baixar App e Assinar
            </a>

            <button id="fechar_modal_assinatura" style="
                background: transparent; border: none; color: #888; font-size: 0.9rem;
                cursor: pointer; padding: 8px; font-weight: 600; text-decoration: underline;
            ">
                Continuar apenas navegando
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('fechar_modal_assinatura').addEventListener('click', () => {
        overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function handleCredentialResponse(response) {
    if (!response || !response.credential) {
        console.error("Nenhuma credencial retornada pelo Google.");
        return;
    }

    const responsePayload = parseJwt(response.credential);

    if (responsePayload && responsePayload.email) {
        try {
            localStorage.setItem("user_email", responsePayload.email);
            localStorage.setItem("user_name", responsePayload.name || '');
        } catch (e) {
            console.warn("Não foi possível salvar os dados do usuário no localStorage:", e);
        }

        // Verifica se o usuário é assinante
        const isAssinante = localStorage.getItem("is_subscriber") === "true";

        if (!isAssinante) {
            // Chama o modal elegante ao invés do alert padrão
            mostrarDialogoNaoAssinante(responsePayload.name);
        } else {
            alert(`Bem-vindo de volta, ${responsePayload.name || 'Usuário'}! Login de assinante verificado.`);
        }
    } else {
        alert("Não foi possível extrair as informações da conta do Google.");
    }
}
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar JWT:", e);
        return null;
    }
}