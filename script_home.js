/* ============================================================
   script_home.js — API Caixa (estrutura oficial)
   ============================================================ */
console.log("[script_home.js] Carregado.");

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('lottery_grid');
    if (!grid) { console.error("#lottery_grid não encontrado"); return; }

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
        if (v >= 1e6) return 'R$ ' + (v/1e6).toFixed(2).replace('.',',') + ' mi';
        if (v >= 1e3) return 'R$ ' + (v/1e3).toFixed(1).replace('.',',') + ' mil';
        return 'R$ ' + v.toFixed(0);
    };

    function limparZeros(s) {
        // Remove caracteres nulos \u0000 que a API retorna
        return (s || '').replace(/\u0000/g, '').trim();
    }

    // ============================================================
    // BUSCA FIRESTORE
    // ============================================================
    async function fetchTodas() {
        const out = {};
        await Promise.all(LOTTERIES.map(async (l) => {
            try {
                const doc = await db.collection('loterias').doc(DOC_IDS[l.name]).get();
                if (doc.exists) {
                    out[l.name] = doc.data();
                    console.log(`[Firestore] ✅ ${l.name}`);
                }
            } catch (e) { console.error(`[Firestore] ❌ ${l.name}:`, e); }
        }));
        return out;
    }

    // ============================================================
    // RENDER — CARD DE RESULTADO
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

        const concurso = data.numero ?? '--';
        const dataApur = data.dataApuracao || '';
        const dataProx = data.dataProximoConcurso || '';
        const acumulado = data.acumulado === true;
        const estimativa = data.valorEstimadoProximoConcurso || 0;
        const acumProx = data.valorAcumuladoProximoConcurso || 0;
        const arrecadado = data.valorArrecadado || 0;
        const local = limparZeros(data.nomeMunicipioUFSorteio) || limparZeros(data.localSorteio) || '';

        let numbersHtml = '';

        // ---------- LOTECA ----------
        if (nome === 'Loteca') {
            const jogos = data.listaResultadoEquipeEsportiva || [];
            if (jogos.length > 0) {
                numbersHtml = `
                    <div style="max-height:200px;overflow-y:auto;background:#f8fafc;border-radius:6px;padding:4px;margin:4px 0;">
                        ${jogos.map((j, idx) => {
                            const g1 = j.nuGolEquipeUm ?? 0;
                            const g2 = j.nuGolEquipeDois ?? 0;
                            // Deriva a coluna pelo placar
                            let col = 'X';
                            if (g1 > g2) col = '1';
                            else if (g1 < g2) col = '2';
                            const cores = {
                                'X': { bg:'#fff3cd', color:'#856404' },
                                '1': { bg:'#d4edda', color:'#155724' },
                                '2': { bg:'#cce5ff', color:'#004085' }
                            };
                            const c = cores[col];
                            const e1 = j.nomeEquipeUm || '?';
                            const e2 = j.nomeEquipeDois || '?';
                            return `
                                <div style="display:grid;grid-template-columns:18px 1fr auto 1fr 18px;gap:3px;align-items:center;padding:3px 2px;border-bottom:1px solid #e2e8f0;font-size:0.68rem;">
                                    <span style="font-weight:bold;color:${color};text-align:center;">${idx+1}</span>
                                    <span style="text-align:right;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e1}</span>
                                    <span style="background:#0f172a;color:#fff;padding:1px 5px;border-radius:3px;font-weight:bold;font-size:0.66rem;">${g1}-${g2}</span>
                                    <span style="color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e2}</span>
                                    <span style="background:${c.bg};color:${c.color};border-radius:3px;font-weight:bold;font-size:0.62rem;text-align:center;">${col}</span>
                                </div>`;
                        }).join('')}
                    </div>`;
            } else {
                numbersHtml = `<div style="text-align:center;padding:20px;color:#999;font-size:0.8rem;">Aguardando jogos</div>`;
            }
        }

        // ---------- FEDERAL ----------
        else if (nome === 'Federal') {
            const dz = data.listaDezenas || [];
            if (dz.length > 0) {
                numbersHtml = `<div style="background:#f8fafc;border-radius:6px;padding:6px;margin:4px 0;">
                    ${dz.slice(0,5).map((b,i)=>`
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;padding:2px 4px;border-bottom:1px solid #e2e8f0;">
                            <span style="color:#64748b;font-weight:600;">${i+1}º Prêmio</span>
                            <span style="font-family:monospace;font-weight:bold;color:${color};letter-spacing:1px;">${b}</span>
                        </div>`).join('')}
                </div>`;
            }
        }

        // ---------- DUPLA SENA (2 sorteios) ----------
        else if (nome === 'Dupla Sena') {
            const d1 = data.listaDezenas || [];
            const d2 = data.listaDezenasSegundoSorteio || [];
            const fmtArr = (arr) => arr.map(n => String(parseInt(n,10)).padStart(2,'0')).join(' - ');
            if (d1.length > 0) {
                numbersHtml = `<div style="margin:4px 0;">
                    <div style="font-size:0.68rem;color:#64748b;font-weight:600;margin-bottom:2px;">1º Sorteio</div>
                    <div style="font-size:0.82rem;color:${color};font-weight:bold;letter-spacing:0.3px;">${fmtArr(d1)}</div>
                    ${d2.length > 0 ? `
                        <div style="font-size:0.68rem;color:#64748b;font-weight:600;margin-top:6px;margin-bottom:2px;">2º Sorteio</div>
                        <div style="font-size:0.82rem;color:${color};font-weight:bold;letter-spacing:0.3px;">${fmtArr(d2)}</div>
                    ` : ''}
                </div>`;
            }
        }

        // ---------- DEMAIS ----------
        else {
            const dz = data.listaDezenas || [];
            if (dz.length > 0) {
                const fmt = dz.map(n => String(parseInt(n,10)).padStart(2,'0'));
                if (nome === 'Lotomania') {
                    // Lotomania tem 20 números — grade 5x4
                    numbersHtml = `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin:6px 0;">
                        ${fmt.map(n=>`<span style="background:${color};color:#fff;text-align:center;padding:3px 0;border-radius:3px;font-size:0.72rem;font-weight:bold;">${n}</span>`).join('')}
                    </div>`;
                } else if (nome === 'Super Sete') {
                    // Super Sete: 7 colunas de 1 dígito
                    numbersHtml = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin:6px 0;">
                        ${fmt.map((n,i)=>`<span style="background:${color};color:#fff;text-align:center;padding:5px 0;border-radius:3px;font-size:0.85rem;font-weight:bold;">${n}</span>`).join('')}
                    </div>`;
                } else if (nome === '+Milionária') {
                    // +Milionária: 6 dezenas + 2 trevos
                    numbersHtml = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;justify-content:center;">
                        ${fmt.map(n=>`<span style="background:${color};color:#fff;text-align:center;width:30px;height:30px;line-height:30px;border-radius:50%;font-size:0.75rem;font-weight:bold;">${n}</span>`).join('')}
                        ${(data.trevosSorteados||[]).map(t=>`<span style="background:#FFD700;color:#000;text-align:center;width:30px;height:30px;line-height:30px;border-radius:50%;font-size:0.75rem;font-weight:bold;">★${t}</span>`).join('')}
                    </div>`;
                } else {
                    numbersHtml = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0;justify-content:center;">
                        ${fmt.map(n=>`<span style="background:${color};color:#fff;text-align:center;width:30px;height:30px;line-height:30px;border-radius:50%;font-size:0.75rem;font-weight:bold;">${n}</span>`).join('')}
                    </div>`;
                }
            } else {
                numbersHtml = `<div style="text-align:center;padding:20px;color:#999;font-size:0.8rem;">Sem números</div>`;
            }
        }

        // ---------- RATEIO (colapsável) ----------
        let rateioHtml = '';
        const rateio = data.listaRateioPremio || [];
        if (rateio.length > 0) {
            rateioHtml = rateio.map(r => {
                const g = r.numeroDeGanhadores || 0;
                const gTxt = g === 0 ? '<span style="color:#dc2626;font-weight:bold;">Não houve</span>'
                    : `<span style="color:#059669;font-weight:bold;">${g.toLocaleString('pt-BR')} ${g===1?'ganhador':'ganhadores'}</span>`;
                return `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dotted #e2e8f0;font-size:0.72rem;">
                    <span style="color:#475569;font-weight:600;">${r.descricaoFaixa || 'Faixa '+r.faixa}</span>
                    <div style="text-align:right;">
                        <div>${gTxt}</div>
                        <div style="color:#0f172a;font-weight:bold;">${fmtR$(r.valorPremio)}</div>
                    </div>
                </div>`;
            }).join('');
        }

        // ---------- BADGES ----------
        const mesSorte = limparZeros(data.nomeTimeCoracaoMesSorte);
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
                    ${badgeExtra}
                </div>

                ${local ? `<div style="font-size:0.66rem;color:#94a3b8;margin:2px 0;"><i class="fa-solid fa-location-dot"></i> ${local}</div>` : ''}

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.68rem;color:#64748b;margin:6px 0;padding-top:4px;border-top:1px dashed #e2e8f0;">
                    <div>Arrecadação: <strong style="color:#0f172a;">${fmtR$k(arrecadado)}</strong></div>
                    <div style="text-align:right;">Apurado: <strong style="color:#0f172a;">${dataApur || '--'}</strong></div>
                </div>

                ${estimativa > 0 ? `
                <div style="background:linear-gradient(135deg,${color}15,${color}05);border:1px solid ${color}30;border-radius:6px;padding:6px 8px;margin:4px 0;">
                    <div style="font-size:0.65rem;color:#64748b;font-weight:600;text-transform:uppercase;">Próximo Concurso</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">
                        <span style="color:${color};font-weight:bold;font-size:0.9rem;">${fmtR$k(estimativa)}</span>
                        ${dataProx ? `<span style="font-size:0.7rem;color:#475569;font-weight:600;">${dataProx}</span>` : ''}
                    </div>
                </div>` : ''}

                ${rateioHtml ? `
                    <button onclick="togglePrizes('${cardId}')" style="background:#f1f5f9;border:1px solid ${color}40;color:${color};border-radius:5px;padding:5px 8px;font-size:0.72rem;cursor:pointer;width:100%;display:flex;justify-content:space-between;align-items:center;font-weight:600;margin-top:4px;">
                        <span><i class="fa-solid fa-trophy"></i> Premiação</span>
                        <i class="fa-solid fa-chevron-down" id="icon_${cardId}"></i>
                    </button>
                    <div id="${cardId}" style="display:none;background:#fff;border:1px solid #e2e8f0;border-radius:5px;padding:6px 8px;margin-top:2px;max-height:180px;overflow-y:auto;">
                        ${rateioHtml}
                    </div>` : ''}

                <button class="btn-generate" style="background:${color};margin-top:6px;" onclick="window.location.href='generator.html?lottery=${encodeURIComponent(nome)}'">
                    <i class="fa-solid fa-filter"></i> Gerar por Filtro
                </button>
            </div>`;
    }

    // ===== CARDS VIP =====
    const vipCard = (titulo, desc, cor, icone, url, badge) => `
        <div class="lottery-card vip-protected" onclick="navegarProtegido('${url}')" style="border-top-color:${cor};cursor:pointer;position:relative;">
            <span style="position:absolute;top:8px;right:8px;background:#dc2626;color:#fff;font-size:0.65rem;font-weight:bold;padding:2px 7px;border-radius:10px;z-index:10;"><i class="fa-solid fa-lock"></i> VIP</span>
            <div style="text-align:center;padding:6px 0;">
                <i class="fa-solid ${icone}" style="font-size:1.8rem;color:${cor};"></i>
                <h3 style="color:${cor};margin:6px 0 2px 0;font-size:1rem;">${titulo}</h3>
                <p style="color:#64748b;font-size:0.72rem;margin:0 0 8px 0;line-height:1.3;">${desc}</p>
                ${badge || ''}
                <div style="background:${cor};color:#fff;padding:5px 12px;border-radius:20px;font-weight:bold;font-size:0.72rem;display:inline-block;">
                    <i class="fa-solid fa-arrow-right"></i> Acessar
                </div>
            </div>
        </div>`;

    window.togglePrizes = function(id) {
        const el = document.getElementById(id);
        const ic = document.getElementById(`icon_${id}`);
        if (!el) return;
        const aberto = el.style.display === 'block';
        el.style.display = aberto ? 'none' : 'block';
        if (ic) ic.className = aberto ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
    };

    // ===== RENDER =====
    try {
        const dados = await fetchTodas();
        let html = '';

        // Cards VIP primeiro
        html += vipCard('Estratégias Premium', '12 algoritmos avançados', '#d97706', 'fa-crown', 'estrategias.html');
        html += vipCard('Gerador Avançado', '12 estratégias estatísticas', '#2563eb', 'fa-microchip', 'gerador-avancado.html');
        html += vipCard('Lotofácil - Repetição', 'Estratégia de repetição', '#930089', 'fa-rotate', 'lotofacil-repeticao.html');
        html += vipCard('Lotomania - Estratégia', 'Distribuição por linhas', '#F78100', 'fa-chart-simple', 'lotomania-estrategia.html');
        html += vipCard('Dia de Sorte - Repetição', 'Estratégia de repetição', '#cb8322', 'fa-calendar-day', 'diadesorte-repeticao.html');
        html += vipCard('Sorteio Globo', 'Sorteio animado e interativo', '#2563eb', 'fa-globe', 'sorteio-globo.html');

        // Depois os resultados
        LOTTERIES.forEach(l => { html += renderCard(l.name, dados[l.name]); });

        grid.innerHTML = html;
        console.log("[script_home.js] ✅ Renderizados:", grid.children.length, "cards");
    } catch (e) {
        console.error("[script_home.js] ❌ Erro:", e);
    }
});