/* ============================================================
   script_home.js — Grid de 6 colunas, Lotofácil e Lotomania (5/linha),
   detalhes independentes por card e efeito hover de destaque.
   ============================================================ */
console.log("[script_home.js] Carregado.");

// Injeta CSS para forçar 6 colunas por linha, hover de destaque e transições
const styleGrid = document.createElement('style');
styleGrid.innerHTML = `
    #lottery_grid {
        display: grid !important;
        grid-template-columns: repeat(6, 1fr) !important;
        gap: 12px;
    }
    @media (max-width: 1400px) { #lottery_grid { grid-template-columns: repeat(5, 1fr) !important; } }
    @media (max-width: 1200px) { #lottery_grid { grid-template-columns: repeat(4, 1fr) !important; } }
    @media (max-width: 992px) { #lottery_grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media (max-width: 768px) { #lottery_grid { grid-template-columns: repeat(2, 1fr) !important; } }
    @media (max-width: 480px) { #lottery_grid { grid-template-columns: 1fr !important; } }

    .lottery-card {
        transition: transform 0.25s ease, box-shadow 0.25s ease !important;
    }
    .lottery-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.12) !important;
    }
`;
document.head.appendChild(styleGrid);

// Função global para expandir/recolher individualmente cada card (sanfona isolada)
window.toggleLotteryDetails = function(cardId) {
    const div = document.getElementById(`detalhes-${cardId}`);
    const btn = document.getElementById(`btn-detalhes-${cardId}`);
    if (!div || !btn) return;

    if (div.style.display === 'none' || div.style.display === '') {
        div.style.display = 'block';
        btn.innerHTML = `<i class="fa-solid fa-chevron-up"></i> Ocultar Detalhes`;
    } else {
        div.style.display = 'none';
        btn.innerHTML = `<i class="fa-solid fa-chevron-down"></i> Ver Detalhes`;
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('lottery_grid');
    if (!grid) return;

    const COLORS = {
        'Dia de Sorte':'#cb8322','Dupla Sena':'#a61324','Federal':'#002f6c',
        'Loteca':'#ca1518','Lotofácil':'#930089','Lotomania':'#F78100',
        '+Milionária':'#1b365d','Mega-Sena':'#209869','Quina':'#260085',
        'Super Sete':'#a8cf45','Timemania':'#2ecc71'
    };
    const ICONS = {
        'Dia de Sorte':'fa-sun','Dupla Sena':'fa-copy','Federal':'fa-building-columns',
        'Loteca':'fa-futbol','Lotofácil':'fa-clover','Lotomania':'fa-dice',
        '+Milionária':'fa-gem','Mega-Sena':'fa-trophy','Quina':'fa-star',
        'Super Sete':'fa-seven','Timemania':'fa-clock'
    };
    const DOC_IDS = {
        'Dia de Sorte':'diadesorte','Dupla Sena':'duplasena','Federal':'federal',
        'Loteca':'loteca','Lotofácil':'lotofacil','Lotomania':'lotomania',
        '+Milionária':'maismilionaria','Mega-Sena':'megasena','Quina':'quina',
        'Super Sete':'supersete','Timemania':'timemania'
    };
    const LOTTERIES = Object.keys(DOC_IDS).map(n => ({ name: n }));

    const fmtR$ = (v) => {
        const num = parseFloat(v) || 0;
        return num > 0 ? 'R$ ' + num.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) : 'R$ 0,00';
    };
    const fmtR$k = (v) => {
        const num = parseFloat(v) || 0;
        if (!num || num <= 0) return 'R$ 0';
        if (num >= 1e9) return 'R$ ' + (num/1e9).toFixed(2).replace('.',',') + ' bi';
        if (num >= 1e6) return 'R$ ' + (num/1e6).toFixed(2).replace('.',',') + ' mi';
        if (num >= 1e3) return 'R$ ' + (num/1e3).toFixed(1).replace('.',',') + ' mil';
        return 'R$ ' + num.toFixed(0);
    };
    const limpar = (s) => (s || '').replace(/\u0000/g, '').trim();

    // Normalização universal corrigida para o NOVO Firestore
    function pegarDados(docData) {
        if (!docData) return null;

        // Se houver sub-objeto, desestrutura, mas mantendo a prioridade nos atributos diretos do novo banco
        let base = { ...docData };
        if (docData.ultimoCompleto && typeof docData.ultimoCompleto === 'object') {
            base = { ...docData.ultimoCompleto, ...base };
        } else if (docData.resultado && typeof docData.resultado === 'object') {
            base = { ...docData.resultado, ...base };
        }

        return {
            ...base,
            concurso: base.concurso || base.numero || base.concursoAtual || '--',
            dataApuracao: base.dataApuracao || base.data || base.dataSorteio || '',
            dataProximoConcurso: base.dataProximoConcurso || base.dataProximo || base.dataProximoConcurso || '',
            numeroConcursoProximo: base.numeroConcursoProximo || base.proximoConcurso || '',
            acumulado: base.acumulado === true || base.acumulou === true || String(base.acumulado).toLowerCase() === 'sim' || String(base.acumulou).toLowerCase() === 'true',
            valorEstimadoProximoConcurso: base.valorEstimadoProximoConcurso || base.valorEstimadoProximo || base.estimativaProximo || 0,
            valorArrecadado: base.valorArrecadado || base.arrecadacaoTotal || 0,
            localSorteio: base.nomeMunicipioUFSorteio || base.localSorteio || base.local || '',
            listaDezenas: base.dezenas || base.listaDezenas || base.numeros || base.dezenasSorteio1 || [],
            listaDezenasSegundoSorteio: base.listaDezenasSegundoSorteio || base.dezenasSorteio2 || base.dezenas2 || [],
            listaRateioPremio: base.listaRateioPremio || base.rateio || base.premiacao || [],
            listaResultadoEquipeEsportiva: base.listaResultadoEquipeEsportiva || base.jogos || base.jogosLoteca || [],
            trevosSorteados: base.trevosSorteados || base.trevos || [],
            nomeTimeCoracaoMesSorte: base.nomeTimeCoracaoMesSorte || base.nomeTimeCoracao || base.mesSorte || ''
        };
    }

    async function fetchTodas() {
        const out = {};
        await Promise.all(LOTTERIES.map(async (l) => {
            try {
                // 1. Busca padrão: coleção 'loterias' e ID do documento igual a DOC_IDS[l.name] (ex: diadesorte)
                let doc = await db.collection('loterias').doc(DOC_IDS[l.name]).get();
                if (doc.exists) {
                    out[l.name] = pegarDados(doc.data());
                } else {
                    // 2. Fallback para coleção independente
                    doc = await db.collection(DOC_IDS[l.name]).doc('latest').get();
                    if (doc.exists) {
                        out[l.name] = pegarDados(doc.data());
                    }
                }
            } catch (e) { console.error(`[Firestore] ❌ ${l.name}:`, e); }
        }));
        return out;
    }

    // ============================================================
    // RENDER CARD
    // ============================================================
    function renderCard(nome, data) {
        const color = COLORS[nome] || '#6c757d';
        const icon = ICONS[nome] || 'fa-hashtag';
        const cardId = DOC_IDS[nome] || nome.replace(/[^a-zA-Z0-9]/g, '');

        if (!data) {
            return `<div class="lottery-card" style="border-top-color:${color};opacity:0.8;display:flex;flex-direction:column;height:100%;">
                <div class="card-header"><h3 style="color:${color};"><i class="fa-solid ${icon}"></i> ${nome}</h3><span class="badge-conc">--</span></div>
                <div style="padding:20px;text-align:center;color:#999;font-size:0.85rem;flex-grow:1;">Sem dados</div>
                <div style="margin-top:auto;">
                    <button class="btn-generate" style="background:${color};width:100%;" disabled>Aguarde</button>
                </div>
            </div>`;
        }

        const concurso = data.concurso;
        const dataApur = data.dataApuracao;
        const dataProx = data.dataProximoConcurso;
        const proxConcurso = data.numeroConcursoProximo;
        const acumulado = data.acumulado;
        const estimativa = data.valorEstimadoProximoConcurso;
        const arrecadado = data.valorArrecadado;
        const localSorteio = limpar(data.localSorteio);
        const listaDezenas = data.listaDezenas;
        const rateio = data.listaRateioPremio;

        // ================= NÚMEROS =================
        let numbersHtml = '';

        if (nome === 'Loteca') {
            const jogos = data.listaResultadoEquipeEsportiva;
            if (jogos && jogos.length > 0) {
                numbersHtml = `
                    <div style="max-height:260px;overflow-y:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:4px;margin:6px 0;box-shadow:inset 0 1px 3px rgba(0,0,0,0.03);">
                        ${jogos.map((j, idx) => {
                            const g1 = j.golEquipeUm ?? j.nuGolEquipeUm ?? j.gols1 ?? 0;
                            const g2 = j.golEquipeDois ?? j.nuGolEquipeDois ?? j.gols2 ?? 0;
                            let corE1 = '#475569'; let corE2 = '#475569';
                            let pesoE1 = '500'; let pesoE2 = '500';

                            if (g1 > g2) { corE1 = '#15803d'; pesoE1 = 'bold'; corE2 = '#dc2626'; } 
                            else if (g1 < g2) { corE1 = '#dc2626'; corE2 = '#15803d'; pesoE2 = 'bold'; }

                            const e1 = j.nomeEquipeUm || j.time1 || '?'; 
                            const e2 = j.nomeEquipeDois || j.time2 || '?';
                            return `
                                <div style="display:grid;grid-template-columns:22px 1fr auto 1fr;gap:4px;align-items:center;padding:5px 3px;border-bottom:1px solid #f8fafc;font-size:0.7rem;">
                                    <span style="font-weight:bold;color:#cbd5e1;text-align:center;font-size:0.6rem;">${idx+1}</span>
                                    <span style="text-align:right;color:${corE1};font-weight:${pesoE1};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e1}</span>
                                    <div style="background:#f1f5f9;border-radius:4px;padding:2px 6px;display:flex;align-items:center;justify-content:center;min-width:38px;border:1px solid #e2e8f0;">
                                        <span style="color:${corE1};font-weight:bold;font-size:0.75rem;">${g1}</span>
                                        <span style="color:#94a3b8;margin:0 3px;font-size:0.6rem;">x</span>
                                        <span style="color:${corE2};font-weight:bold;font-size:0.75rem;">${g2}</span>
                                    </div>
                                    <span style="color:${corE2};font-weight:${pesoE2};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e2}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        }
        else if (nome === 'Federal') {
            const premios = data.premios || [];
            const lista = premios.length > 0 ? premios.map(p => p.bilhete || p) : listaDezenas;
            if (lista && lista.length > 0) {
                numbersHtml = `<div style="background:#f8fafc;border-radius:6px;padding:6px;margin:6px 0;">
                    ${lista.slice(0,5).map((b,i)=>{
                        const v = (b && typeof b === 'object') ? (b.bilhete || b.numero || b.bilheteGanho) : b;
                        return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;padding:4px 6px;border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b;font-weight:700;font-size:0.65rem;">${i+1}º PRÊMIO</span>
                            <span style="font-family:'Courier New',monospace;font-weight:bold;color:${color};letter-spacing:2px;font-size:0.85rem;">${String(v).padStart(5,'0')}</span>
                        </div>`;
                    }).join('')}
                </div>`;
            }
        }
        else if (nome === 'Dupla Sena') {
            const d1 = listaDezenas;
            const d2 = data.listaDezenasSegundoSorteio;
            const bolas = (arr, cor) => arr.map(n => `<span style="display:inline-block;background:${cor};color:#fff;width:24px;height:24px;line-height:24px;border-radius:50%;text-align:center;font-weight:bold;font-size:0.7rem;margin:1.5px;">${String(n).padStart(2,'0')}</span>`).join('');
            numbersHtml = `<div style="margin:6px 0;">
                <div style="font-size:0.65rem;color:#64748b;font-weight:700;margin-bottom:2px;">1º SORTEIO</div>
                <div style="text-align:center;">${bolas(d1, color)}</div>
                ${d2 && d2.length > 0 ? `<div style="font-size:0.65rem;color:#64748b;font-weight:700;margin-top:6px;margin-bottom:2px;">2º SORTEIO</div>
                    <div style="text-align:center;">${bolas(d2, '#8e44ad')}</div>` : ''}
            </div>`;
        }
        else if (listaDezenas && listaDezenas.length > 0) {
            const fmt = listaDezenas.map(n => String(n).padStart(2, '0'));
            
            if (nome === 'Lotofácil' || nome === 'Lotomania') {
                numbersHtml = `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:6px 0;justify-items:center;">
                    ${fmt.map(n=>`<span style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;width:26px;height:26px;line-height:26px;border-radius:50%;text-align:center;font-size:0.72rem;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.15);">${n}</span>`).join('')}
                </div>`;
            } else if (nome === '+Milionária') {
                const trevos = data.trevosSorteados || [];
                numbersHtml = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;justify-content:center;">
                    ${fmt.map(n=>`<span style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;text-align:center;width:28px;height:28px;line-height:28px;border-radius:50%;font-size:0.72rem;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.15);">${n}</span>`).join('')}
                    ${trevos.map(t=>`<span style="background:linear-gradient(135deg,#FFD700,#f59e0b);color:#000;text-align:center;width:28px;height:28px;line-height:28px;border-radius:50%;font-size:0.72rem;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.2);">★${t}</span>`).join('')}
                </div>`;
            } else {
                numbersHtml = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;justify-content:center;">
                    ${fmt.map(n=>`<span style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;text-align:center;width:28px;height:28px;line-height:28px;border-radius:50%;font-size:0.72rem;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.15);">${n}</span>`).join('')}
                </div>`;
            }
        }

        // ================= RATEIO =================
        let rateioHtml = '';
        if (Array.isArray(rateio) && rateio.length > 0) {
            rateioHtml = rateio.map(r => {
                const g = r.numeroDeGanhadores ?? r.ganhadores ?? 0;
                const desc = r.descricaoFaixa || r.faixa || r.descricao || 'Faixa';
                const val = r.valorPremio ?? r.premio ?? 0;

                const gTxt = g === 0
                    ? '<span style="color:#dc2626;font-weight:bold;">Não houve</span>'
                    : `<span style="color:#059669;font-weight:bold;">${g.toLocaleString('pt-BR')} ${g===1?'ganhador':'ganhadores'}</span>`;
                return `<div style="display:grid;grid-template-columns:1fr auto;gap:6px;padding:4px 0;border-bottom:1px dotted #e2e8f0;font-size:0.7rem;">
                    <span style="color:#475569;font-weight:700;">${desc}</span>
                    <div style="text-align:right;">
                        <div>${gTxt}</div>
                        <div style="color:#0f172a;font-weight:bold;">${fmtR$(val)}</div>
                    </div>
                </div>`;
            }).join('');
        }

        const mesSorte = limpar(data.nomeTimeCoracaoMesSorte);
        let badgeExtra = '';
        if (nome === 'Dia de Sorte' && mesSorte) badgeExtra = `<span class="badge-extra" style="background:#fef3c7;color:#92400e;"><i class="fa-solid fa-calendar-alt"></i> Mês: ${mesSorte}</span>`;
        else if (nome === 'Timemania' && mesSorte) badgeExtra = `<span class="badge-extra" style="background:#d4edda;color:#155724;"><i class="fa-solid fa-shield-halved"></i> ${mesSorte}</span>`;

        return `
            <div class="lottery-card" style="border-top-color:${color}; display:flex; flex-direction:column; height:100%;">
                <div class="card-header">
                    <h3 style="color:${color};"><i class="fa-solid ${icon}"></i> ${nome}</h3>
                    <span class="badge-conc">Conc: ${concurso}</span>
                </div>

                <div style="flex-grow:1; display:flex; flex-direction:column;">
                    ${numbersHtml}

                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0;">
                        ${acumulado
                            ? '<span class="badge-accumulated"><i class="fa-solid fa-fire"></i> Acumulou!</span>'
                            : '<span class="badge-extra" style="background:#e8f5e9;color:#2e7d32;"><i class="fa-solid fa-trophy"></i> Teve Ganhador!</span>'}
                        ${badgeExtra}
                    </div>
                    
                    <!-- BOTÃO INDIVIDUAL DA SANFONA -->
                    <div style="text-align:center; margin-top: 8px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
                        <button id="btn-detalhes-${cardId}" onclick="toggleLotteryDetails('${cardId}')" style="background:transparent; border:none; color:${color}; font-size:0.72rem; font-weight:bold; cursor:pointer; width:100%; display:flex; align-items:center; justify-content:center; gap:5px;">
                            <i class="fa-solid fa-chevron-down"></i> Ver Detalhes
                        </button>
                    </div>

                    <!-- CONTAINER DOS DETALHES (ISOLADO POR CARD) -->
                    <div id="detalhes-${cardId}" style="display:none; margin-top: 8px; animation: fadeIn 0.3s ease;">
                        ${localSorteio ? `<div style="font-size:0.65rem;color:#94a3b8;margin:3px 0;"><i class="fa-solid fa-location-dot"></i> ${localSorteio}</div>` : ''}

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.68rem;color:#64748b;margin:4px 0;padding:4px 0;border-top:1px dashed #e2e8f0;">
                            <div><i class="fa-solid fa-sack-dollar"></i> Arrecadação: <strong style="color:#0f172a;">${fmtR$k(arrecadado)}</strong></div>
                            <div style="text-align:right;"><i class="fa-regular fa-calendar-check"></i> Apurado: <strong style="color:#0f172a;">${dataApur || '--'}</strong></div>
                        </div>

                        ${estimativa > 0 ? `
                        <div style="background:linear-gradient(135deg,${color}18,${color}08);border:1px solid ${color}40;border-radius:6px;padding:6px 8px;margin:4px 0;">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span style="font-size:0.62rem;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">
                                    <i class="fa-solid fa-arrow-right"></i> Próximo ${proxConcurso ? '#'+proxConcurso : ''}
                                </span>
                                ${dataProx ? `<span style="font-size:0.65rem;color:#475569;font-weight:700;"><i class="fa-regular fa-calendar"></i> ${dataProx}</span>` : ''}
                            </div>
                            <div style="color:${color};font-weight:900;font-size:0.95rem;margin-top:2px;">${fmtR$k(estimativa)}</div>
                        </div>` : ''}

                        ${rateioHtml ? `
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;margin:4px 0;">
                                <div style="font-size:0.68rem;color:${color};font-weight:800;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid ${color}30;padding-bottom:3px;margin-bottom:3px;">
                                    <i class="fa-solid fa-trophy"></i> Premiação
                                </div>
                                ${rateioHtml}
                            </div>` : ''}
                    </div>
                </div>

                <div style="margin-top:auto; padding-top:8px;">
                    <button class="btn-generate" style="background:${color}; width:100%;" onclick="window.location.href='generator.html?lottery=${encodeURIComponent(nome)}'">
                        <i class="fa-solid fa-filter"></i> Gerar por Filtro
                    </button>
                </div>
            </div>`;
    }

    // ============================================================
    // CARDS VIP
    // ============================================================
    const vipCard = (titulo, desc, cor, icone, url, dados = null) => {
        const isVip = window.isSubscriber === true;
        const lockedClass = isVip ? '' : 'vip-card-locked';
        const badgeHtml = isVip ? '' :
            '<span class="vip-badge" style="position:absolute;top:8px;right:8px;background:#dc2626;color:#fff;font-size:0.62rem;font-weight:bold;padding:2px 6px;border-radius:10px;z-index:10;"><i class="fa-solid fa-lock"></i> VIP</span>';

        let miniInfo = '';
        if (dados && dados.listaRateioPremio && dados.listaRateioPremio.length > 0) {
            const faixa1 = dados.listaRateioPremio[0];
            const valPremio = faixa1.valorPremio ?? faixa1.premio ?? 0;
            const numGanhadores = faixa1.numeroDeGanhadores ?? faixa1.ganhadores ?? 0;

            if (faixa1 && valPremio > 0) {
                miniInfo = `
                    <div style="background:${cor}12;border:1px dashed ${cor}40;border-radius:6px;padding:5px 6px;margin:6px 0;font-size:0.62rem;">
                        <div style="color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;">Última faixa 1</div>
                        <div style="color:${cor};font-weight:900;font-size:0.8rem;">${fmtR$(valPremio)}</div>
                        ${numGanhadores > 0
                            ? `<div style="color:#059669;font-weight:700;">${numGanhadores} ganhador${numGanhadores===1?'':'es'}</div>`
                            : '<div style="color:#dc2626;font-weight:700;">Sem ganhador</div>'}
                    </div>`;
            }
        }

        return `
            <div class="lottery-card vip-protected ${lockedClass}" onclick="navegarProtegido('${url}')" style="border-top-color:${cor};cursor:pointer;position:relative; display:flex; flex-direction:column; height:100%;">
                ${badgeHtml}
                <div style="flex-grow:1; display:flex; flex-direction:column; justify-content:center;">
                    <div style="text-align:center;padding:4px 0;">
                        <i class="fa-solid ${icone}" style="font-size:2rem;color:${cor};"></i>
                        <h3 style="color:${cor};margin:8px 0 3px 0;font-size:0.98rem;">${titulo}</h3>
                        <p style="color:#64748b;font-size:0.72rem;margin:0 0 6px 0;line-height:1.3;">${desc}</p>
                    </div>
                    ${miniInfo}
                </div>
                <div style="text-align:center; margin-top:auto; padding-top:8px;">
                    <div style="background:${cor};color:#fff;padding:7px 12px;border-radius:20px;font-weight:bold;font-size:0.78rem;display:inline-block; width:100%;">
                        <i class="fa-solid fa-arrow-right"></i> Acessar
                    </div>
                </div>
            </div>`;
    };

    // ============================================================
    // RENDER
    // ============================================================
    try {
        const dados = await fetchTodas();
        let html = '';

        html += vipCard('Estratégias Premium', '12 algoritmos avançados', '#d97706', 'fa-crown', 'estrategias.html', dados['Mega-Sena']);
        html += vipCard('Gerador Avançado', '12 estratégias estatísticas', '#2563eb', 'fa-microchip', 'gerador-avancado.html', dados['Quina']);
        html += vipCard('Lotofácil - Repetição', 'Estratégia de repetição', '#930089', 'fa-rotate', 'lotofacil-repeticao.html', dados['Lotofácil']);
        html += vipCard('Lotomania - Estratégia', 'Distribuição por linhas', '#F78100', 'fa-chart-simple', 'lotomania-estrategia.html', dados['Lotomania']);
        html += vipCard('Dia de Sorte - Repetição', 'Estratégia de repetição', '#cb8322', 'fa-calendar-day', 'diadesorte-repeticao.html', dados['Dia de Sorte']);
        html += vipCard('Sorteio Globo', 'Sorteio animado e interativo', '#2563eb', 'fa-globe', 'sorteio-globo.html', dados['Timemania']);

        LOTTERIES.forEach(l => { html += renderCard(l.name, dados[l.name]); });

        grid.innerHTML = html;
        console.log("[script_home.js] ✅ Renderizados:", grid.children.length, "cards");
    } catch (e) {
        console.error("[script_home.js] ❌ Erro:", e);
    }
});

/* ============================================================
   NAVEGAÇÃO E MODAL
   ============================================================ */
window.navegarProtegido = function(url) {
    let email = localStorage.getItem('user_email');
    if (!email) {
        try {
            const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (u && u.email) email = u.email;
        } catch (e) {}
    }
    if (!email) { alert("Faça login com Google para continuar."); return; }
    if (window.isSubscriber === true) { window.location.href = url; return; }
    if (typeof window.verificarAssinaturaFirestore === 'function') {
        window.verificarAssinaturaFirestore(email).then(function(isAss) {
            window.isSubscriber = isAss;
            localStorage.setItem('isSubscriber', isAss ? 'true' : 'false');
            if (isAss) window.location.href = url;
            else window.mostrarDialogoNaoAssinante(localStorage.getItem('user_name') || email);
        });
        return;
    }
    window.mostrarDialogoNaoAssinante(email);
};

window.mostrarDialogoNaoAssinante = function(nomeUsuario) {
    const antigo = document.getElementById('modal-assinatura-exclusivo');
    if (antigo) antigo.remove();
    const modal = document.createElement('div');
    modal.id = 'modal-assinatura-exclusivo';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;z-index:99999;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:16px;padding:30px 24px;max-width:440px;width:90%;text-align:center;box-shadow:0 15px 35px rgba(0,0,0,0.3);border-top:6px solid #209869;font-family:inherit;">
            <div style="width:65px;height:65px;background:#e8f5e9;color:#209869;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 20px auto;"><i class="fa-solid fa-crown"></i></div>
            <h3 style="color:#1a1a1a;margin:0 0 10px 0;font-size:1.3rem;">Olá, ${nomeUsuario || 'Visitante'}!</h3>
            <p style="color:#555;font-size:0.9rem;line-height:1.5;margin-bottom:20px;">Função exclusiva para assinantes. Baixe nosso app no Google Play para desbloquear.</p>
            <a href="https://play.google.com/store/apps/details?id=com.fabioribeiroromelli.geradordejogos" target="_blank" style="display:block;background:#209869;color:#fff;text-decoration:none;padding:13px 20px;border-radius:30px;font-weight:bold;font-size:0.95rem;margin-bottom:12px;">
                <i class="fa-brands fa-google-play"></i> Baixar App e Assinar
            </a>
            <button onclick="document.getElementById('modal-assinatura-exclusivo').remove()" style="background:transparent;border:none;color:#888;font-size:0.85rem;cursor:pointer;padding:8px;text-decoration:underline;">Fechar</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
};
