<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark">
    <title>Estatísticas das Loterias</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /*
          Sistema de design deste painel — "Quadro de Apuração"
          Paleta base:
            --bg          #121019  fundo principal (tinta escura, não preto puro)
            --surface     #1c1a26  fundo dos cartões
            --surface-2   #262432  fundo de elementos internos (trilhos de barra)
            --border      #363347  linhas divisórias
            --text        #EDEAE3  texto principal
            --text-muted  #9a96ab  texto secundário
            --gold        #E3A83B  destaque (números-chave, seleção ativa)
          Tipografia:
            Big Shoulders Display — títulos e números grandes (estilo placar/quadro de sorteio)
            IBM Plex Sans — texto de interface
            IBM Plex Mono — valores numéricos tabulares
        */
        :root {
            --bg: #121019;
            --surface: #1c1a26;
            --surface-2: #262432;
            --border: #363347;
            --text: #EDEAE3;
            --text-muted: #9a96ab;
            --gold: #E3A83B;
            --gold-dim: rgba(227, 168, 59, 0.16);
            --ink: #14131b;
            --danger: #e2704f;
            --radius: 10px;
            --font-display: 'Big Shoulders Display', sans-serif;
            --font-body: 'IBM Plex Sans', sans-serif;
            --font-mono: 'IBM Plex Mono', monospace;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            padding: 0;
            font-family: var(--font-body);
            background-color: var(--bg);
            background-image:
                radial-gradient(circle at 12% 0%, rgba(227, 168, 59, 0.07), transparent 40%),
                radial-gradient(circle at 88% 10%, rgba(147, 0, 137, 0.12), transparent 45%);
            background-attachment: fixed;
            color: var(--text);
            -webkit-font-smoothing: antialiased;
        }

        /* ---------- Cabeçalho ---------- */
        .header-bar {
            background: linear-gradient(180deg, var(--ink), var(--surface));
            border-bottom: 1px solid var(--border);
            color: var(--text);
            padding: 18px 24px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        .btn-back {
            background: transparent;
            color: var(--text);
            border: 1px solid var(--border);
            padding: 9px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-family: var(--font-body);
            font-weight: 500;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: border-color .15s ease, background .15s ease;
            white-space: nowrap;
        }
        .btn-back:hover { border-color: var(--gold); background: var(--gold-dim); }
        .btn-back:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

        .header-titles h1 {
            margin: 0;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: clamp(1.4rem, 1.1rem + 1.2vw, 1.9rem);
            letter-spacing: 0.01em;
            line-height: 1.1;
        }
        .header-titles p {
            margin: 4px 0 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        /* ---------- Layout geral ---------- */
        .container { max-width: 1080px; margin: 0 auto; padding: 28px 20px 60px; }

        /* ---------- Navegação das loterias ---------- */
        .lottery-grid-nav {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(122px, 1fr));
            gap: 10px;
            margin-bottom: 22px;
        }
        .lottery-card-btn {
            border: none;
            padding: 14px 10px;
            border-radius: 8px;
            color: #fff;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 1.05rem;
            letter-spacing: 0.01em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            min-height: 52px;
            transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
            box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 10px rgba(0,0,0,0.28);
        }
        .lottery-card-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .lottery-card-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .lottery-card-btn.active {
            box-shadow: 0 0 0 3px var(--gold), 0 6px 16px rgba(0,0,0,0.35);
            transform: translateY(-2px);
        }

        /* ---------- Barra de contexto ---------- */
        .context-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 16px 20px;
            border-radius: var(--radius);
        }
        #stats_title {
            margin: 0;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 1.4rem;
            letter-spacing: 0.01em;
        }
        #stats_subtitle {
            margin: 4px 0 0;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
        #badge_fonte {
            font-family: var(--font-body);
            font-size: 0.78rem;
            font-weight: 500;
            color: var(--text-muted);
            padding: 5px 12px;
            border-radius: 20px;
            border: 1px solid var(--border);
            background: var(--surface-2);
            white-space: nowrap;
        }

        /* ---------- Grade de cartões ---------- */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 18px;
            margin-top: 20px;
        }
        .stat-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 22px;
            animation: subir-card .35s ease both;
        }
        .stat-card:nth-child(2) { animation-delay: .05s; }
        .stat-card:nth-child(3) { animation-delay: .10s; }
        .stat-card:nth-child(4) { animation-delay: .15s; }

        @keyframes subir-card {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
            .stat-card { animation: none; }
            .lottery-card-btn, .btn-back { transition: none; }
        }

        .stat-card h3 {
            margin: 0 0 4px;
            color: var(--text);
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 1.15rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .stat-card h3 i { color: var(--gold); font-size: 0.95rem; }
        .stat-card .card-desc {
            margin: 0 0 16px;
            color: var(--text-muted);
            font-size: 0.85rem;
            line-height: 1.4;
            padding-bottom: 14px;
            border-bottom: 1px solid var(--border);
        }

        /* Número em destaque */
        .hero-stat { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
        .hero-stat .hero-number {
            font-family: var(--font-display);
            font-weight: 800;
            font-size: 2.5rem;
            color: var(--gold);
            line-height: 1;
        }
        .hero-stat .hero-label { color: var(--text-muted); font-size: 0.85rem; line-height: 1.3; }

        /* Barras de distribuição */
        .bar-list {
            list-style: none;
            margin: 0;
            padding: 0 4px 0 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-height: 230px;
            overflow-y: auto;
        }
        .bar-list::-webkit-scrollbar { width: 6px; }
        .bar-list::-webkit-scrollbar-track { background: transparent; }
        .bar-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        .bar-row { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 6px 10px; align-items: center; }
        .bar-row .bar-label { font-size: 0.85rem; color: var(--text); }
        .bar-row .bar-value {
            font-family: var(--font-mono);
            font-size: 0.78rem;
            color: var(--text-muted);
            white-space: nowrap;
        }
        .bar-row .bar-track {
            grid-column: 1 / -1;
            height: 7px;
            background: var(--surface-2);
            border-radius: 4px;
            overflow: hidden;
        }
        .bar-row .bar-fill { height: 100%; background: var(--gold); border-radius: 4px; }

        /* Quadrantes */
        .quadrant-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .quadrant-box {
            background: var(--surface-2);
            padding: 14px;
            border-radius: 8px;
            border: 1px solid var(--border);
        }
        .quadrant-box .q-label { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px; }
        .quadrant-box .q-value {
            font-family: var(--font-mono);
            font-weight: 600;
            font-size: 1.3rem;
            color: var(--text);
            display: block;
            margin-bottom: 2px;
        }
        .quadrant-box .q-count { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; }
        .quadrant-box .bar-track { height: 5px; background: var(--surface); border-radius: 3px; overflow: hidden; }
        .quadrant-box .bar-fill { height: 100%; background: var(--gold); border-radius: 3px; }

        .rodape-nota {
            margin-top: 26px;
            color: var(--text-muted);
            font-size: 0.78rem;
            text-align: center;
            line-height: 1.5;
        }

        .estado-vazio {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px 20px;
            color: var(--text-muted);
        }
        .estado-vazio i { color: var(--danger); font-size: 1.4rem; display: block; margin-bottom: 10px; }

        @media (max-width: 600px) {
            .header-bar { padding: 14px 16px; }
            .container { padding: 20px 14px 40px; }
            .hero-stat .hero-number { font-size: 2.1rem; }
            .context-bar { padding: 14px 16px; }
        }
    </style>

    <!-- Scripts de dados (Fallback) -->
    <script src="historico_megasena.js"></script>
    <script src="historico_lotofacil.js"></script>
    <script src="historico_quina.js"></script>
    <script src="historico_lotomania.js"></script>
    <script src="historico_timemania.js"></script>
    <script src="historico_duplasena.js"></script>
    <script src="historico_diadesorte.js"></script>
    <script src="historico_supersete.js"></script>
    <script src="historico_maismilionaria.js"></script>
</head>
<body>

    <header class="header-bar">
        <button class="btn-back" onclick="window.location.href='home.html'">
            <i class="fa-solid fa-arrow-left"></i> Voltar
        </button>
        <div class="header-titles">
            <h1>Estatísticas das loterias</h1>
            <p>Análise histórica dos concursos oficiais da Caixa</p>
        </div>
    </header>

    <main class="container">
        <nav class="lottery-grid-nav">
            <button class="lottery-card-btn" id="btn_megasena" onclick="carregarEstatisticas('megasena')" style="background: #209869;" aria-pressed="false">Mega-Sena</button>
            <button class="lottery-card-btn" id="btn_lotofacil" onclick="carregarEstatisticas('lotofacil')" style="background: #930089;" aria-pressed="false">Lotofácil</button>
            <button class="lottery-card-btn" id="btn_quina" onclick="carregarEstatisticas('quina')" style="background: #260085;" aria-pressed="false">Quina</button>
            <button class="lottery-card-btn" id="btn_lotomania" onclick="carregarEstatisticas('lotomania')" style="background: #f78100;" aria-pressed="false">Lotomania</button>
            <button class="lottery-card-btn" id="btn_timemania" onclick="carregarEstatisticas('timemania')" style="background: #00ff48; color: #14131b;" aria-pressed="false">Timemania</button>
            <button class="lottery-card-btn" id="btn_duplasena" onclick="carregarEstatisticas('duplasena')" style="background: #a61324;" aria-pressed="false">Dupla Sena</button>
            <button class="lottery-card-btn" id="btn_diadesorte" onclick="carregarEstatisticas('diadesorte')" style="background: #cb831d;" aria-pressed="false">Dia de Sorte</button>
            <button class="lottery-card-btn" id="btn_supersete" onclick="carregarEstatisticas('supersete')" style="background: #a8cf45; color: #14131b;" aria-pressed="false">Super Sete</button>
            <button class="lottery-card-btn" id="btn_maismilionaria" onclick="carregarEstatisticas('maismilionaria')" style="background: #1b3582;" aria-pressed="false">+Milionária</button>
        </nav>

        <div class="context-bar">
            <div>
                <h2 id="stats_title">Selecione uma loteria</h2>
                <p id="stats_subtitle"></p>
            </div>
            <span id="badge_fonte"></span>
        </div>

        <div id="stats_container" class="stats-grid"></div>

        <p class="rodape-nota">As estatísticas refletem sorteios já realizados. Cada novo sorteio é um evento independente e aleatório.</p>
    </main>

    <script>
        // Nomes de exibição oficiais de cada loteria (evita concatenações como "MEGASENA")
        const NOMES_LOTERIAS = {
            megasena: 'Mega-Sena',
            lotofacil: 'Lotofácil',
            quina: 'Quina',
            lotomania: 'Lotomania',
            timemania: 'Timemania',
            duplasena: 'Dupla Sena',
            diadesorte: 'Dia de Sorte',
            supersete: 'Super Sete',
            maismilionaria: '+Milionária'
        };

        function pluralizar(quantidade, singular, plural) {
            return Number(quantidade) === 1 ? singular : plural;
        }

        function formatarNumero(valor, casas = 1) {
            const numero = Number(valor);
            return Number.isFinite(numero)
                ? numero.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
                : '0';
        }

        function formatarInteiro(valor) {
            return Number(valor).toLocaleString('pt-BR');
        }

        // SEU MOTOR DE ESTATÍSTICAS
        const LotteryStatsEngine = {
            PRIMES: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97],

            getPrimeAnalysis(draws) {
                const primeCountsPerDraw = {};
                draws.forEach(draw => {
                    const numbers = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
                    const primeCount = numbers.filter(n => this.PRIMES.includes(n)).length;
                    primeCountsPerDraw[primeCount] = (primeCountsPerDraw[primeCount] || 0) + 1;
                });
                return {
                    primeDistribution: primeCountsPerDraw,
                    avgPrimesPerDraw: (Object.entries(primeCountsPerDraw).reduce((acc, [k, v]) => acc + (k * v), 0) / (draws.length || 1)).toFixed(2)
                };
            },

            getEvenOddDetailed(draws) {
                const patterns = {};
                draws.forEach(draw => {
                    const numbers = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
                    const evens = numbers.filter(n => n % 2 === 0).length;
                    const odds = numbers.length - evens;
                    const patternKey = `${evens} ${pluralizar(evens, 'par', 'pares')} / ${odds} ${pluralizar(odds, 'ímpar', 'ímpares')}`;
                    patterns[patternKey] = (patterns[patternKey] || 0) + 1;
                });
                return Object.entries(patterns)
                    .map(([pattern, count]) => ({ pattern, count, percentage: ((count / draws.length) * 100).toFixed(1) }))
                    .sort((a, b) => b.count - a.count);
            },

            getConsecutiveAnalysis(draws) {
                let drawsWithConsecutives = 0;
                const maxSequences = {};
                draws.forEach(draw => {
                    const numbers = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10)).sort((a, b) => a - b);
                    let hasConsecutive = false;
                    let currentSeq = 1;
                    let maxSeqInDraw = 1;

                    for (let i = 0; i < numbers.length - 1; i++) {
                        if (numbers[i + 1] === numbers[i] + 1) {
                            hasConsecutive = true;
                            currentSeq++;
                            if (currentSeq > maxSeqInDraw) maxSeqInDraw = currentSeq;
                        } else {
                            currentSeq = 1;
                        }
                    }
                    if (hasConsecutive) drawsWithConsecutives++;
                    maxSequences[maxSeqInDraw] = (maxSequences[maxSeqInDraw] || 0) + 1;
                });
                return {
                    consecutivePercentage: ((drawsWithConsecutives / (draws.length || 1)) * 100).toFixed(1),
                    sequenceLengths: maxSequences
                };
            },

            getQuadrantAnalysis(draws, totalColumns = 10) {
                const quadrantCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
                draws.forEach(draw => {
                    const numbers = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
                    numbers.forEach(n => {
                        const row = Math.floor((n - 1) / totalColumns);
                        const col = (n - 1) % totalColumns;
                        if (row < 3 && col < 5) quadrantCounts.Q1++;
                        else if (row < 3 && col >= 5) quadrantCounts.Q2++;
                        else if (row >= 3 && col < 5) quadrantCounts.Q3++;
                        else quadrantCounts.Q4++;
                    });
                });
                return quadrantCounts;
            },

            generateAdvancedReport(lotteryName, draws) {
                return {
                    lottery: lotteryName,
                    totalDraws: draws.length,
                    primes: this.getPrimeAnalysis(draws),
                    evenOddPatterns: this.getEvenOddDetailed(draws),
                    consecutives: this.getConsecutiveAnalysis(draws),
                    quadrants: this.getQuadrantAnalysis(draws)
                };
            }
        };

        document.addEventListener('DOMContentLoaded', () => carregarEstatisticas('megasena'));

        function carregarEstatisticas(loteria) {
            destacarBotaoAtivo(loteria);
            const container = document.getElementById('stats_container');
            const title = document.getElementById('stats_title');
            const subtitle = document.getElementById('stats_subtitle');
            const badge = document.getElementById('badge_fonte');
            const nomeExibicao = NOMES_LOTERIAS[loteria] || loteria;

            // Busca os dados (primeiro tenta o LocalStorage) — lógica original, intocada
            let dados = null;
            const salvosMemoria = localStorage.getItem(`historico_${loteria}`) || localStorage.getItem(loteria.toUpperCase());

            if (salvosMemoria) {
                try {
                    dados = JSON.parse(salvosMemoria);
                    badge.textContent = 'Fonte: dados salvos localmente';
                } catch (e) {}
            }

            if (!dados) {
                const varStandard = `HISTORICO_${loteria.toUpperCase()}`;
                const varAlt = `HISTORICO_${loteria.replace('mais', 'mais_').toUpperCase()}`;
                dados = window[varStandard] || window[varAlt];
                badge.textContent = 'Fonte: histórico padrão do sistema';
            }

            if (!dados || !Array.isArray(dados) || dados.length === 0) {
                title.textContent = nomeExibicao;
                subtitle.textContent = '';
                badge.textContent = '';
                container.innerHTML = `
                    <div class="estado-vazio">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        Nenhum dado encontrado para ${nomeExibicao}.
                    </div>`;
                return;
            }

            // Executa o motor sobre a lista de concursos
            const report = LotteryStatsEngine.generateAdvancedReport(loteria, dados);
            title.textContent = nomeExibicao;
            subtitle.textContent = `${formatarInteiro(report.totalDraws)} ${pluralizar(report.totalDraws, 'concurso analisado', 'concursos analisados')}`;

            renderizarCards(report);
        }

        function renderizarCards(report) {
            const container = document.getElementById('stats_container');
            const totalDraws = report.totalDraws || 1;

            // 1. Par / Ímpar — mostra a distribuição completa (sem cortar nos 5 primeiros)
            const linhasParImpar = report.evenOddPatterns.map(p => `
                <li class="bar-row">
                    <span class="bar-label">${p.pattern}</span>
                    <span class="bar-value">${p.count} ${pluralizar(p.count, 'concurso', 'concursos')} (${formatarNumero(p.percentage)}%)</span>
                    <div class="bar-track"><div class="bar-fill" style="width:${p.percentage}%"></div></div>
                </li>`).join('');

            // 2. Números Primos
            const linhasPrimos = Object.entries(report.primes.primeDistribution).map(([k, v]) => {
                const pct = (v / totalDraws) * 100;
                return `
                <li class="bar-row">
                    <span class="bar-label">${k} ${pluralizar(k, 'número primo', 'números primos')}</span>
                    <span class="bar-value">${v} ${pluralizar(v, 'concurso', 'concursos')} (${formatarNumero(pct)}%)</span>
                    <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                </li>`;
            }).join('');

            // 3. Consecutivos
            const linhasSequencias = Object.entries(report.consecutives.sequenceLengths).map(([k, v]) => {
                const pct = (v / totalDraws) * 100;
                const rotulo = Number(k) === 1 ? 'Sem números consecutivos' : `Sequência de ${k} números seguidos`;
                return `
                <li class="bar-row">
                    <span class="bar-label">${rotulo}</span>
                    <span class="bar-value">${v} ${pluralizar(v, 'concurso', 'concursos')} (${formatarNumero(pct)}%)</span>
                    <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                </li>`;
            }).join('');

            // 4. Quadrantes
            const q = report.quadrants;
            const totalDezenas = (q.Q1 + q.Q2 + q.Q3 + q.Q4) || 1;
            const maxQuadrante = Math.max(q.Q1, q.Q2, q.Q3, q.Q4, 1);
            const quadrantesInfo = [
                { chave: 'Q1', nome: 'Superior esquerdo' },
                { chave: 'Q2', nome: 'Superior direito' },
                { chave: 'Q3', nome: 'Inferior esquerdo' },
                { chave: 'Q4', nome: 'Inferior direito' }
            ];
            const quadrantesHtml = quadrantesInfo.map(info => {
                const valor = q[info.chave];
                const pctTotal = (valor / totalDezenas) * 100;
                const pctBarra = (valor / maxQuadrante) * 100;
                return `
                <div class="quadrant-box">
                    <div class="q-label">${info.nome}</div>
                    <span class="q-value">${formatarNumero(pctTotal)}%</span>
                    <div class="q-count">${valor} ${pluralizar(valor, 'dezena sorteada', 'dezenas sorteadas')}</div>
                    <div class="bar-track"><div class="bar-fill" style="width:${pctBarra}%"></div></div>
                </div>`;
            }).join('');

            container.innerHTML = `
                <div class="stat-card">
                    <h3><i class="fa-solid fa-scale-balanced"></i> Padrões de par e ímpar</h3>
                    <p class="card-desc">Quantos números pares e ímpares saem juntos em cada concurso.</p>
                    <ul class="bar-list">${linhasParImpar}</ul>
                </div>

                <div class="stat-card">
                    <h3><i class="fa-solid fa-hashtag"></i> Números primos</h3>
                    <p class="card-desc">Frequência de números primos (2, 3, 5, 7...) entre as dezenas sorteadas.</p>
                    <div class="hero-stat">
                        <span class="hero-number">${formatarNumero(report.primes.avgPrimesPerDraw, 2)}</span>
                        <span class="hero-label">média de primos por concurso</span>
                    </div>
                    <ul class="bar-list">${linhasPrimos}</ul>
                </div>

                <div class="stat-card">
                    <h3><i class="fa-solid fa-link"></i> Números consecutivos</h3>
                    <p class="card-desc">Concursos em que pelo menos dois números seguidos foram sorteados juntos.</p>
                    <div class="hero-stat">
                        <span class="hero-number">${formatarNumero(report.consecutives.consecutivePercentage)}%</span>
                        <span class="hero-label">dos concursos tiveram números consecutivos</span>
                    </div>
                    <ul class="bar-list">${linhasSequencias}</ul>
                </div>

                <div class="stat-card">
                    <h3><i class="fa-solid fa-chart-pie"></i> Distribuição por quadrantes</h3>
                    <p class="card-desc">Como as dezenas sorteadas se distribuem nas quatro áreas do volante.</p>
                    <div class="quadrant-grid">${quadrantesHtml}</div>
                </div>
            `;
        }

        function destacarBotaoAtivo(loteria) {
            document.querySelectorAll('.lottery-card-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            const btn = document.getElementById(`btn_${loteria}`);
            if (btn) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            }
        }
    </script>
</body>
</html>