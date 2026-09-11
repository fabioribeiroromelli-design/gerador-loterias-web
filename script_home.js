/* ============================================================
   script_home.js — versão premium com mais dados
   ============================================================ */
console.log("[script_home.js] Carregado.");

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

    const fmtR$ = (v) => v > 0 ? 'R$ ' + Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) : 'R$ 0,00';
    const fmtR$k = (v) => {
        if (!v || v <= 0) return 'R$ 0';
        if (v >= 1e9) return 'R$ ' + (v/1e9).toFixed(2).replace('.',',') + ' bi';
        if (v >= 1e6) return 'R$ ' + (v/1e6).toFixed(2).replace('.',',') + ' mi';
        if (v >= 1e3) return 'R$ ' + (v/1e3).toFixed(1).replace('.',',') + ' mil';
        return 'R$ ' + v.toFixed(0);
    };
    const limparZeros = (s) => (s || '').replace(/\u0000/g, '').trim();

    const get = (obj, ...nomes) => {
        if (!obj) return undefined;
        const niveis = [obj, obj.ultimoConcurso, obj.UltimoConcurso, obj.dados, obj.data];
        for (const nivel of niveis) {
            if (!nivel || typeof nivel !== 'object') continue;
            for (const n of nomes) {
                const v = nivel[n];
                if (v !== undefined && v !== null && v !== '' &&
                    !(Array.isArray(v) && v.length === 0)) return v;
            }
        }
        return undefined;
    };

    // ============================================================
    // BUSCA FIRESTORE
    // ============================================================
    async function fetchTodas() {
        const out = {};
        await Promise.all(LOTTERIES.map(async (l) => {
            try {
                const doc = await db.collection('loterias').doc(DOC_IDS[l.name]).get();
                if (doc.exists) out[l.name] = doc.data();
            } catch (e) { console.error(`[Firestore] ❌ ${l.name}:`, e); }
        }));
        return out;
    }

    // ============================================================
    // RENDER — CARD
    // ============================================================
    function renderCard(nome, data) {
        const color = COLORS[nome] || '#6c757d';
        const icon = ICONS[nome] || 'fa-hashtag';
        const cardId = `prz_${nome.replace(/[^a-zA-Z0-9]/g,'')}`;

        if (!data) {
            return `<div class="lottery-card" style="border-top-color:${color};opacity:0.8;">
                <div class="card-header"><h3 style="color:${color};"><i class="fa-solid ${icon}"></i> ${nome}</h3><span class="badge-conc">--</span></div>
                <div style="padding:20px;text-align:center;color:#999;font-size:0.85rem;">Sem dados</div>
                <button class="btn-generate" style="background:${color};" disabled>Aguardando</button>
            </div>`;
        }

        // Metadados do concurso
        const concurso = get(data, 'numero','concurso') ?? '--';
        const dataApur = get(data, 'dataApuracao','data') || '';
        const dataProx = get(data, 'dataProximoConcurso') || '';
        const proxConcurso = get(data, 'numeroConcursoProximo') || '';
        const acumulado = get(data, 'acumulado','acumulou') === true;
        const estimativa = get(data, 'valorEstimadoProximoConcurso') || 0;
        const acumProx = get(data, 'valorAcumuladoProximoConcurso') || 0;
        const arrecadado = get(data, 'valorArrecadado') || 0;
        const especial = get(data, 'indicadorConcursoEspecial') === 1;
        const local = limparZeros(get(data, 'nomeMunicipioUFSorteio','localSorteio') || '');
        const totalFaixa1 = get(data, 'valorTotalPremioFaixaUm') || 0;

        let numbersHtml = '';

        // ---------- LOTECA ----------
        if (nome === 'Loteca') {
            const jogos = get(data, 'listaResultadoEquipeEsportiva','jogos') || [];
            // Verifica se os placares estão zerados (bug da API)
            const todosZerados = jogos.length > 0 && jogos.every(j => {
                const g1 = get(j,'nuGolEquipeUm','golEquipeUm') ?? 0;
                const g2 = get(j,'nuGolEquipeDois','golEquipeDois') ?? 0;
                return g1 === 0 && g2 === 0;
            });

            if (jogos.length > 0) {
                numbersHtml = `<div style="max-height:220px;overflow-y:auto;background:#f8fafc;border-radius:6px;padding:4px;margin:4px 0;">
                    ${jogos.map((j, idx) => {
                        const g1 = get(j,'nuGolEquipeUm','golEquipeUm') ?? 0;
                        const g2 = get(j,'nuGolEquipeDois','golEquipeDois') ?? 0;
                        const colOriginal = get(j, 'colunaVencedora') || '';
                        // Deriva coluna
                        let col = colOriginal;
                        if (!col) {
                            if (g1 > g2) col = '1'; else if (g1 < g2) col = '2'; else col = 'X';
                        }
                        const cores = {
                            'X': { bg:'#fef3c7', color:'#92400e', label:'EMP' },
                            '1': { bg:'#d4edda', color:'#155724', label:'CASA' },
                            '2': { bg:'#cce5ff', color:'#004085', label:'FORA' }
                        };
                        const c = cores[col] || cores['X'];
                        const e1 = get(j,'nomeEquipeUm','nomeTime1') || '?';
                        const e2 = get(j,'nomeEquipeDois','nomeTime2') || '?';
                        // Se tudo zerado, mostra a coluna em vez do placar
                        const placar = todosZerados
                            ? `<span style="background:${c.bg};color:${c.color};padding:1px 6px;border-radius:3px;font-weight:bold;font-size:0.65rem;min-width:28px;text-align:center;">${col}</span>`
                            : `<span style="background:#0f172a;color:#fff;padding:1px 6px;border-radius:3px;font-weight:bold;font-size:0.66rem;">${g1}-${g2}</span>`;

                        return `<div style="display:grid;grid-template-columns:18px 1fr auto 1fr;gap:4px;align-items:center;padding:3px 2px;border-bottom:1px solid #e2e8f0;font-size:0.68rem;">
                            <span style="font-weight:bold;color:${color};text-align:center;">${idx+1}</span>
                            <span style="text-align:right;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e1}</span>
                            ${placar}
                            <span style="color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e2}</span>
                        </div>`;
                    }).join('')}
                </div>
                ${todosZerados ? `<div style="font-size:0.6rem;color:#94a3b8;text-align:center;margin-top:-2px;font-style:italic;">Colunas vencedoras (placar ainda não divulgado)</div>` : ''}`;
            } else {
                numbersHtml = `<div style="text-align:center;padding:20px;color:#999;font-size:0.8rem;">Aguardando jogos</div>`;
            }
        }

        // ---------- FEDERAL ----------
        else if (nome === 'Federal') {
            const dz = get(data, 'listaDezenas','dezenas','bilhetes') || [];
            if (dz.length > 0) {
                numbersHtml = `<div style="background:#f8fafc;border-radius:6px;padding:6px;margin:4px 0;">
                    ${dz.slice(0,5).map((b,i)=>{
                        let v = b;
                        if (b && typeof b === 'object') v = get(b,'numero','bilhete','dezena','premio','valor','number') || JSON.stringify(b);
                        return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;padding:3px 4px;border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b;font-weight:600;font-size:0.65rem;">${i+1}º PRÊMIO</span>
                            <span style="font-family:monospace;font-weight:bold;color:${color};letter-spacing:1.5px;font-size:0.82rem;">${v}</span>
                        </div>`;
                    }).join('')}
                </div>`;
            }
        }

        // ---------- DUPLA SENA ----------
        else if (nome === 'Dupla Sena') {
            const d1 = get(data, 'listaDezenas','dezenas') || [];
            const d2 = get(data, 'listaDezenasSegundoSorteio','dezenasSegundoSorteio') || [];
            const fmtArr = (arr) => arr.map(n => String(parseInt(n,10)).padStart(2,'0')).join(' • ');
            if (d1.length > 0) {
                numbersHtml = `<div style="margin:4px 0;">
                    <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px;">
                        <span style="background:${color};color:#fff;font-size:0.6rem;font-weight:bold;padding:1px 6px;border-radius:10px;">1º</span>
                        <div style="font-size:0.82rem;color:${color};font-weight:bold;letter-spacing:0.3px;">${fmtArr(d1)}</div>
                    </div>
                    ${d2.length > 0 ? `<div style="display:flex;align-items:center;gap:4px;">
                        <span style="background:#64748b;color:#fff;font-size:0.6rem;font-weight:bold;padding:1px 6px;border-radius:10px;">2º</span>
                        <div style="font-size:0.82rem;color:${color};font-weight:bold;letter-spacing:0.3px;">${fmtArr(d2)}</div>
                    </div>` : ''}
                </div>`;
            }
        }

        // ---------- DEMAIS ----------
        else {
            const dz = get(data, 'listaDezenas','dezenas','numerosSorteados') || [];
            if (dz.length > 0) {
                const fmt = dz.map(n => String(parseInt(n,10)).padStart(2,'0'));
                if (nome === 'Lotomania') {
                    numbersHtml = `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin:8px 0;">
                        ${fmt.map(n=>`<span style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;text-align:center;padding:4px 0;border-radius:4px;font-size:0.72rem;font-weight:bold;box-shadow:0 1px 3px rgba(0,0,0,0.15);">${n}</span>`).join('')}
                    </div>`;
                } else if (nome === 'Super Sete') {
                    numbersHtml = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin:8px 0;">
                        ${fmt.map(n=>`<span style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;text-align:center;padding:6px 0;border-radius:4px;font-size:0.85rem;font-weight:bold;box-shadow:0 1px 3px rgba(0,0,0,0.15);">${n}</span>`).join('')}
                    </div>`;
                } else if (nome === '+Milionária') {
                    const trevos = get(data, 'trevosSorteados','trevos') || [];
                    numbersHtml = `<div style="display:flex;flex-wrap:wrap;gap:5px;margin:8px 0;justify-content:center;">
                        ${fmt.map(n=>`<span style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;text-align:center;width:32px;height:32px;line-height:32px;border-radius:50%;font-size:0.78rem;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.15);">${n}</span>`).join('')}
                        ${trevos.map(t=>`<span style="background:linear-gradient(135deg,#FFD700,#f59e0b);color:#000;text-align:center;width:32px;height:32px;line-height:32px;border-radius:50%;font-size:0.78rem;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.15);">★${t}</span>`).join('')}
                    </div>`;
                } else {
                    numbersHtml = `<div style="display:flex;flex-wrap:wrap;gap:5px;margin:8px 0;justify-content:center;">
                        ${fmt.map(n=>`<span style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;text-align:center;width:32px;height:32px;line-height:32px;border-radius:50%;font-size:0.78rem;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.15);">${n}</span>`).join('')}
                    </div>`;
                }
            } else numbersHtml = `<div style="text-align:center;padding:20px;color:#999;font-size:0.8rem;">Sem números</div>`;
        }

        // ---------- RATEIO ----------
        let rateioHtml = '';
        const rateio = get(data, 'listaRateioPremio','rateio') || [];
        if (Array.isArray(rateio) && rateio.length > 0) {
            rateioHtml = rateio.map(r => {
                const g = r.numeroDeGanhadores ?? r.ganhadores ?? 0;
                const gTxt = g === 0 ? '<span style="color:#dc2626;font-weight:bold;">Não houve</span>'
                    : `<span style="color:#059669;font-weight:bold;">${g.toLocaleString('pt-BR')} ${g===1?'ganhador':'ganhadores'}</span>`;
                return `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dotted #e2e8f0;font-size:0.72rem;">
                    <span style="color:#475569;font-weight:600;">${r.descricaoFaixa || 'Faixa '+r.faixa}</span>
                    <div style="text-align:right;"><div>${gTxt}</div><div style="color:#0f172a;font-weight:bold;">${fmtR$(r.valorPremio || r.valor)}</div></div>
                </div>`;
            }).join('');
        }

        const mesSorte = limparZeros(get(data, 'nomeTimeCoracaoMesSorte','mesSorte') || '');
        let badgeExtra = '';
        if (nome === 'Dia de Sorte' && mesSorte) badgeExtra = `<span class="badge-extra"><i class="fa-solid fa-calendar-alt"></i> ${mesSorte}</span>`;
        else if (nome === 'Timemania' && mesSorte) badgeExtra = `<span class="badge-extra"><i class="fa-solid fa-shield-halved"></i> ${mesSorte}</span>`;

        return `
            <div class="lottery-card" style="border-top-color:${color};">
                <div class="card-header">
                    <h3 style="color:${color};"><i class="fa-solid ${icon}"></i> ${nome}</h3>
                    <span class="badge-conc">Conc: ${concurso}</span>
                </div>

                ${numbersHtml}

                <div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0;">
                    ${acumulado
                        ? '<span class="badge-accumulated"><i class="fa-solid fa-fire"></i> Acumulou!</span>'
                        : '<span class="badge-extra" style="background:#e8f5e9;color:#2e7d32;"><i class="fa-solid fa-trophy"></i> Teve Ganhador!</span>'}
                    ${especial ? '<span class="badge-extra" style="background:#fef3c7;color:#92400e;"><i class="fa-solid fa-star"></i> Especial</span>' : ''}
                    ${badgeExtra}
                </div>

                ${local ? `<div style="font-size:0.66rem;color:#94a3b8;margin:2px 0;"><i class="fa-solid fa-location-dot"></i> ${local}</div>` : ''}

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.68rem;color:#64748b;margin:6px 0;padding-top:4px;border-top:1px dashed #e2e8f0;">
                    <div>Arrecadação: <strong style="color:#0f172a;">${fmtR$k(arrecadado)}</strong></div>
                    <div style="text-align:right;">Apurado: <strong style="color:#0f172a;">${dataApur || '--'}</strong></div>
                </div>

                ${estimativa > 0 ? `
                <div style="background:linear-gradient(135deg,${color}15,${color}05);border:1px solid ${color}30;border-radius:6px;padding:6px 8px;margin:4px 0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.62rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;">Próximo ${proxConcurso ? '#'+proxConcurso : ''}</span>
                        ${dataProx ? `<span style="font-size:0.65rem;color:#64748b;font-weight:600;"><i class="fa-regular fa-calendar"></i> ${dataProx}</span>` : ''}
                    </div>
                    <div style="color:${color};font-weight:bold;font-size:0.95rem;margin-top:1px;">${fmtR$k(estimativa)}</div>
                </div>` : ''}

                ${rateioHtml ? `
                    <button onclick="togglePrizes('${cardId}')" style="background:#f1f5f9;border:1px solid ${color}40;color:${color};border-radius:5px;padding:5px 8px;font-size:0.72rem;cursor:pointer;width:100%;display:flex;justify-content:space-between;align-items:center;font-weight:600;margin-top:4px;">
                        <span><i class="fa-solid fa-trophy"></i> Premiação</span>
                        <i class="fa-solid fa-chevron-down" id="icon_${cardId}"></i>
                    </button>
                    <div id="${cardId}" style="display:none;background:#fff;border:1px solid #e2e8f0;border-radius:5px;padding:6px 8px;margin-top:2px;max-height:180px;overflow-y:auto;">${rateioHtml}</div>` : ''}

                <button class="btn-generate" style="background:${color};margin-top:6px;" onclick="window.location.href='generator.html?lottery=${encodeURIComponent(nome)}'">
                    <i class="fa-solid fa-filter"></i> Gerar por Filtro
                </button>
            </div>`;
    }

    // ============================================================
    // CARDS VIP
    // ============================================================
    const vipCard = (titulo, desc, cor, icone, url) => {
        const isVip = window.isSubscriber === true;
        const lockedClass = isVip ? '' : 'vip-card-locked';
        const badgeHtml = isVip ? '' :
            '<span class="vip-badge" style="position:absolute;top:8px;right:8px;background:#dc2626;color:#fff;font-size:0.65rem;font-weight:bold;padding:2px 7px;border-radius:10px;z-index:10;"><i class="fa-solid fa-lock"></i> VIP</span>';
        return `
            <div class="lottery-card vip-protected ${lockedClass}" onclick="navegarProtegido('${url}')" style="border-top-color:${cor};cursor:pointer;position:relative;">
                ${badgeHtml}
                <div style="text-align:center;padding:6px 0;">
                    <i class="fa-solid ${icone}" style="font-size:1.8rem;color:${cor};"></i>
                    <h3 style="color:${cor};margin:6px 0 2px 0;font-size:1rem;">${titulo}</h3>
                    <p style="color:#64748b;font-size:0.72rem;margin:0 0 8px 0;line-height:1.3;">${desc}</p>
                    <div style="background:${cor};color:#fff;padding:5px 12px;border-radius:20px;font-weight:bold;font-size:0.72rem;display:inline-block;">
                        <i class="fa-solid fa-arrow-right"></i> Acessar
                    </div>
                </div>
            </div>`;
    };

    window.togglePrizes = function(id) {
        const el = document.getElementById(id);
        const ic = document.getElementById(`icon_${id}`);
        if (!el) return;
        const aberto = el.style.display === 'block';
        el.style.display = aberto ? 'none' : 'block';
        if (ic) ic.className = aberto ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
    };

    // ============================================================
    // RENDER
    // ============================================================
    try {
        const dados = await fetchTodas();
        let html = '';
        html += vipCard('Estratégias Premium', '12 algoritmos avançados', '#d97706', 'fa-crown', 'estrategias.html');
        html += vipCard('Gerador Avançado', '12 estratégias estatísticas', '#2563eb', 'fa-microchip', 'gerador-avancado.html');
        html += vipCard('Lotofácil - Repetição', 'Estratégia de repetição', '#930089', 'fa-rotate', 'lotofacil-repeticao.html');
        html += vipCard('Lotomania - Estratégia', 'Distribuição por linhas', '#F78100', 'fa-chart-simple', 'lotomania-estrategia.html');
        html += vipCard('Dia de Sorte - Repetição', 'Estratégia de repetição', '#cb8322', 'fa-calendar-day', 'diadesorte-repeticao.html');
        html += vipCard('Sorteio Globo', 'Sorteio animado e interativo', '#2563eb', 'fa-globe', 'sorteio-globo.html');
        LOTTERIES.forEach(l => { html += renderCard(l.name, dados[l.name]); });
        grid.innerHTML = html;
        console.log("[script_home.js] ✅ Renderizados:", grid.children.length, "cards");
    } catch (e) {
        console.error("[script_home.js] ❌ Erro:", e);
    }
});

/* ============================================================
   FUNÇÕES GLOBAIS
   ============================================================ */
window.navegarProtegido = function(url) {
    let emailSalvo = localStorage.getItem('user_email');
    if (!emailSalvo) {
        try {
            const u = JSON.parse(localStorage.getItem('currentUser') || 'null');
            if (u && u.email) emailSalvo = u.email;
        } catch (e) {}
    }
    if (!emailSalvo) { alert("Faça login com Google para continuar."); return; }
    if (window.isSubscriber === true) { window.location.href = url; return; }
    if (typeof window.verificarAssinaturaFirestore === 'function') {
        window.verificarAssinaturaFirestore(emailSalvo).then(function(isAss) {
            window.isSubscriber = isAss;
            localStorage.setItem('isSubscriber', isAss ? 'true' : 'false');
            if (isAss) window.location.href = url;
            else window.mostrarDialogoNaoAssinante(localStorage.getItem('user_name') || emailSalvo);
        });
        return;
    }
    window.mostrarDialogoNaoAssinante(emailSalvo);
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
            <p style="color:#555;font-size:0.9rem;line-height:1.5;margin-bottom:20px;">Esta função é exclusiva para assinantes. Baixe o app no Google Play para desbloquear.</p>
            <a href="https://play.google.com/store/apps/details?id=com.fabioribeiroromelli.geradordejogos" target="_blank" style="display:block;background:#209869;color:#fff;text-decoration:none;padding:13px 20px;border-radius:30px;font-weight:bold;font-size:0.95rem;margin-bottom:12px;">
                <i class="fa-brands fa-google-play"></i> Baixar App e Assinar
            </a>
            <button onclick="document.getElementById('modal-assinatura-exclusivo').remove()" style="background:transparent;border:none;color:#888;font-size:0.85rem;cursor:pointer;padding:8px;text-decoration:underline;">Fechar</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
};