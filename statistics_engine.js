<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark">
    <title>Estatísticas das Loterias</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
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
            --delay: #c0392b;
            --cold: #3a3a5a;
            --mid: #6a5a3a;
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
            background-image: radial-gradient(circle at 12% 0%, rgba(227, 168, 59, 0.07), transparent 40%),
                              radial-gradient(circle at 88% 10%, rgba(147, 0, 137, 0.12), transparent 45%);
            background-attachment: fixed;
            color: var(--text);
            -webkit-font-smoothing: antialiased;
        }
        .header-bar {
            background: linear-gradient(180deg, var(--ink), var(--surface));
            border-bottom: 1px solid var(--border);
            padding: 18px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
        }
        .header-left {
            display: flex;
            align-items: center;
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
            text-decoration: none;
            white-space: nowrap;
        }
        .btn-back:hover { border-color: var(--gold); background: var(--gold-dim); }
        .header-titles h1 {
            margin: 0;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: clamp(1.4rem, 1.1rem + 1.2vw, 1.9rem);
            letter-spacing: 0.01em;
            line-height: 1.1;
        }
        .header-titles p { margin: 4px 0 0; color: var(--text-muted); font-size: 0.9rem; }
        
        .lang-selector {
            background: var(--surface-2);
            color: var(--text);
            border: 1px solid var(--border);
            padding: 8px 12px;
            border-radius: 8px;
            font-family: var(--font-body);
            cursor: pointer;
        }

        .container { max-width: 1080px; margin: 0 auto; padding: 28px 20px 60px; }

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
            opacity: 0.75;
            transition: transform .15s ease, filter .15s ease, opacity .15s ease;
            box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 10px rgba(0,0,0,0.28);
        }
        .lottery-card-btn:hover, .lottery-card-btn.active { opacity: 1; transform: translateY(-2px); filter: brightness(1.08); }
        .lottery-card-btn.active { box-shadow: 0 0 0 3px var(--gold), 0 6px 16px rgba(0,0,0,0.35); }

        /* Cores Temáticas Consistentes */
        .btn-megasena { background-color: #209869; }
        .btn-lotofacil { background-color: #930089; }
        .btn-quina { background-color: #260085; }
        .btn-lotomania { background-color: #f78100; }
        .btn-timemania { background-color: #00ff48; color: #14131b !important; }
        .btn-duplasena { background-color: #a61324; }
        .btn-diadesorte { background-color: #cb831d; }
        .btn-supersete { background-color: #a8cf45; color: #14131b !important; }
        .btn-maismilionaria { background-color: #1b3582; }

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
            margin-bottom: 20px;
        }
        #stats_title { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: 1.4rem; letter-spacing: 0.01em; }
        #stats_subtitle { margin: 4px 0 0; color: var(--text-muted); font-size: 0.85rem; }
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

        #stats_container.fade-in { animation: entrar .35s ease; }
        @keyframes entrar { from { opacity: 0; } to { opacity: 1; } }

        .painel-principal {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
            gap: 20px;
            margin-bottom: 20px;
            align-items: start;
        }
        @media (max-width: 900px) {
            .painel-principal { grid-template-columns: 1fr; }
        }

        .number-grid-wrapper, .stat-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 22px;
        }
        .number-grid-wrapper h3, .stat-card h3 {
            margin: 0 0 4px;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 1.15rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .number-grid-wrapper h3 i, .stat-card h3 i { color: var(--gold); font-size: 0.95rem; }
        .number-grid-wrapper .card-desc, .stat-card .card-desc {
            margin: 0 0 16px;
            color: var(--text-muted);
            font-size: 0.85rem;
            line-height: 1.4;
            padding-bottom: 14px;
            border-bottom: 1px solid var(--border);
        }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }

        .number-grid { display: grid; gap: 8px; margin-top: 4px; justify-items: center; }
        .number-cell {
            aspect-ratio: 1 / 1;
            width: 100%;
            min-width: 32px;
            max-width: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 0.8rem;
            background: var(--surface-2);
            color: var(--text);
            border: 1px solid var(--border);
            cursor: pointer;
            transition: transform 0.12s ease, box-shadow 0.12s ease;
            position: relative;
        }
        .number-cell:hover { transform: scale(1.1); box-shadow: 0 0 12px rgba(227, 168, 59, 0.35); z-index: 2; }
        .number-cell.hot { background: var(--gold); color: var(--ink); border-color: var(--gold); }
        .number-cell.cold { background: var(--cold); color: var(--text-muted); border-color: var(--cold); }
        .number-cell.delay { background: var(--delay); color: #fff; border-color: var(--delay); }
        .number-cell.mid { background: var(--mid); color: var(--text); border-color: var(--mid); }

        .tooltip {
            display: none;
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--surface);
            border: 1px solid var(--gold);
            border-radius: 8px;
            padding: 8px 12px;
            font-family: var(--font-body);
            font-weight: 400;
            font-size: 0.72rem;
            color: var(--text);
            min-width: 150px;
            max-width: 220px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.6);
            z-index: 10;
            pointer-events: none;
            white-space: normal;
            line-height: 1.4;
        }
        .number-cell:hover .tooltip { display: block; }

        .last-draw-panel { border-left: 3px solid var(--gold); }
        .last-draw-balls { display: flex; flex-direction: column; gap: 8px; max-height: 480px; overflow-y: auto; padding-right: 4px; }
        .last-draw-balls::-webkit-scrollbar { width: 6px; }
        .last-draw-balls::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .last-draw-ball-row {
            display: flex; align-items: center; gap: 12px;
            background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 7px 12px;
        }
        .mini-ball {
            width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            font-family: var(--font-display); font-weight: 700; font-size: 0.92rem;
            border: 1px solid var(--border); background: var(--surface); color: var(--text);
        }
        .mini-ball.hot { background: var(--gold); color: var(--ink); border-color: var(--gold); }
        .mini-ball.cold { background: var(--cold); color: var(--text-muted); border-color: var(--cold); }
        .mini-ball.mid { background: var(--mid); color: var(--text); border-color: var(--mid); }
        .mini-ball.delay { background: var(--delay); color: #fff; border-color: var(--delay); }
        .ball-status-label { font-size: 0.8rem; color: var(--text-muted); }

        .bar-list { list-style: none; margin: 0; padding: 0 4px 0 0; display: flex; flex-direction: column; gap: 10px; max-height: 230px; overflow-y: auto; }
        .bar-list::-webkit-scrollbar { width: 6px; }
        .bar-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        .bar-row { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 6px 10px; align-items: center; }
        .bar-row .bar-label { font-size: 0.85rem; color: var(--text); }
        .bar-row .bar-value { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; }
        .bar-row .bar-track { grid-column: 1 / -1; height: 7px; background: var(--surface-2); border-radius: 4px; overflow: hidden; }
        .bar-row .bar-fill { height: 100%; background: var(--gold); border-radius: 4px; }

        .rodape-nota { margin-top: 26px; color: var(--text-muted); font-size: 0.78rem; text-align: center; line-height: 1.5; }
        .estado-vazio { grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted); }
        .estado-vazio i { color: var(--danger); font-size: 1.4rem; display: block; margin-bottom: 10px; }
    </style>
</head>
<body>

    <header class="header-bar">
        <div class="header-left">
            <a href="index.html" class="btn-back">
                <i class="fa-solid fa-arrow-left"></i> <span data-i18n="back">Voltar</span>
            </a>
            <div class="header-titles">
                <h1 data-i18n="page_title">Estatísticas das loterias</h1>
                <p data-i18n="page_subtitle">Análise histórica inteligente via arquivos locais</p>
            </div>
        </div>
        <select id="lang_selector" class="lang-selector" onchange="mudarIdioma(this.value)">
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="es">Español</option>
        </select>
    </header>

    <main class="container">
        <!-- Navegação com parâmetros exatos no padrão que funciona -->
        <nav class="lottery-grid-nav">
            <button class="lottery-card-btn btn-megasena active" onclick="carregarEstatisticas('megasena', 'Mega-Sena', this)">Mega-Sena</button>
            <button class="lottery-card-btn btn-lotofacil" onclick="carregarEstatisticas('lotofacil', 'Lotofácil', this)">Lotofácil</button>
            <button class="lottery-card-btn btn-quina" onclick="carregarEstatisticas('quina', 'Quina', this)">Quina</button>
            <button class="lottery-card-btn btn-lotomania" onclick="carregarEstatisticas('lotomania', 'Lotomania', this)">Lotomania</button>
            <button class="lottery-card-btn btn-timemania" onclick="carregarEstatisticas('timemania', 'Timemania', this)">Timemania</button>
            <button class="lottery-card-btn btn-duplasena" onclick="carregarEstatisticas('duplasena', 'Dupla Sena', this)">Dupla Sena</button>
            <button class="lottery-card-btn btn-diadesorte" onclick="carregarEstatisticas('diadesorte', 'Dia de Sorte', this)">Dia de Sorte</button>
            <button class="lottery-card-btn btn-supersete" onclick="carregarEstatisticas('supersete', 'Super Sete', this)">Super Sete</button>
            <button class="lottery-card-btn btn-maismilionaria" onclick="carregarEstatisticas('maismilionaria', '+Milionária', this)">+Milionária</button>
        </nav>

        <div class="context-bar">
            <div>
                <h2 id="stats_title" data-i18n="select_lottery">Selecione uma loteria</h2>
                <p id="stats_subtitle"></p>
            </div>
            <span id="badge_fonte" data-i18n="waiting">Aguardando...</span>
        </div>

        <div id="stats_container"></div>

        <p class="rodape-nota" data-i18n="footer_note">As estatísticas utilizam os arquivos JSON locais do repositório para análise dinâmica dos concursos oficiais.</p>
    </main>

    <script>
        let currentLang = 'pt';
        let currentLottery = 'megasena';
        let currentLotteryName = 'Mega-Sena';

        const i18n = {
            pt: {
                back: "Voltar",
                page_title: "Estatísticas das loterias",
                page_subtitle: "Análise histórica inteligente via arquivos locais",
                select_lottery: "Selecione uma loteria",
                waiting: "Aguardando...",
                checking: "Verificando dados...",
                loading: "Carregando estatísticas...",
                no_history: "Nenhum histórico encontrado para",
                empty_warning: "Aviso: Dados Vazios",
                analyzed_total: (total) => `Total de ${total} concursos analisados`,
                source_label: (origem, num) => `Fonte: ${origem} (Concurso ${num})`,
                freq_title: "Frequência dos Números",
                freq_desc: "Histórico completo de saídas por dezena calculado sobre toda a base.",
                last_draw_title: (num) => `Último Concurso (${num})`,
                last_draw_desc: "Resultado oficial apurado no sorteio mais recente.",
                top_freq_title: "Números Mais Frequentes",
                top_freq_desc: "Dezenas que mais apareceram no histórico.",
                hot_num: "Número quente",
                cold_num: "Número frio",
                mid_num: "Frequência média",
                delay_num: "Em atraso prolongado",
                never_drawn: "Nunca sorteado.",
                times_drawn: (count) => `Saiu ${count} ${count === 1 ? 'vez' : 'vezes'}.`,
                last_draws_label: "Últimos concursos: ",
                number_label: "Número ",
                footer_note: "As estatísticas utilizam os arquivos JSON locais do repositório para análise dinâmica dos concursos oficiais."
            },
            en: {
                back: "Back",
                page_title: "Lottery Statistics",
                page_subtitle: "Smart historical analysis via local files",
                select_lottery: "Select a lottery",
                waiting: "Waiting...",
                checking: "Checking data...",
                loading: "Loading statistics...",
                no_history: "No history found for",
                empty_warning: "Warning: Empty Data",
                analyzed_total: (total) => `Total of ${total} draws analyzed`,
                source_label: (origem, num) => `Source: ${origem} (Draw ${num})`,
                freq_title: "Number Frequency",
                freq_desc: "Complete historical draw count per number calculated from the full dataset.",
                last_draw_title: (num) => `Last Draw (${num})`,
                last_draw_desc: "Official result from the most recent draw.",
                top_freq_title: "Most Frequent Numbers",
                top_freq_desc: "Numbers that appeared the most in history.",
                hot_num: "Hot number",
                cold_num: "Cold number",
                mid_num: "Average frequency",
                delay_num: "Overdue number",
                never_drawn: "Never drawn.",
                times_drawn: (count) => `Drawn ${count} ${count === 1 ? 'time' : 'times'}.`,
                last_draws_label: "Recent draws: ",
                number_label: "Number ",
                footer_note: "Statistics use local repository JSON files for dynamic analysis of official draws."
            },
            es: {
                back: "Volver",
                page_title: "Estadísticas de Loterías",
                page_subtitle: "Análisis histórico inteligente mediante archivos locales",
                select_lottery: "Seleccione una lotería",
                waiting: "Esperando...",
                checking: "Verificando datos...",
                loading: "Cargando estadísticas...",
                no_history: "No se encontró historial para",
                empty_warning: "Aviso: Datos Vacíos",
                analyzed_total: (total) => `Total de ${total} sorteos analizados`,
                source_label: (origem, num) => `Fuente: ${origem} (Sorteo ${num})`,
                freq_title: "Frecuencia de Números",
                freq_desc: "Historial completo de salidas por decena calculado sobre toda la base.",
                last_draw_title: (num) => `Último Sorteo (${num})`,
                last_draw_desc: "Resultado oficial verificado en el sorteo más reciente.",
                top_freq_title: "Números Más Frequentes",
                top_freq_desc: "Decenas que más aparecieron en el historial.",
                hot_num: "Número caliente",
                cold_num: "Número frío",
                mid_num: "Frecuencia media",
                delay_num: "En retraso prolongado",
                never_drawn: "Nunca sorteado.",
                times_drawn: (count) => `Salió ${count} ${count === 1 ? 'vez' : 'veces'}.`,
                last_draws_label: "Últimos sorteos: ",
                number_label: "Número ",
                footer_note: "Las estadísticas utilizan los archivos JSON locales del repositorio para el análisis dinámico de los sorteos oficiales."
            }
        };

        const TOTAL_NUMEROS = {
            megasena: 60, lotofacil: 25, quina: 80, lotomania: 100, timemania: 80,
            duplasena: 50, diadesorte: 31, supersete: 7, maismilionaria: 50
        };
        const COLUNAS_GRADE = {
            megasena: 10, lotofacil: 5, quina: 10, lotomania: 10, timemania: 10,
            duplasena: 10, diadesorte: 5, supersete: 10, maismilionaria: 10
        };

        function mudarIdioma(lang) {
            currentLang = lang;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[currentLang][key]) {
                    el.innerText = i18n[currentLang][key];
                }
            });
            carregarEstatisticas(currentLottery, currentLotteryName);
        }

        async function obterHistoricoLocal(loteria) {
            try {
                const cacheBuster = new Date().getTime();
                const arquivoJson = `./historico_${loteria.toLowerCase()}.json?v=${cacheBuster}`;
                const response = await fetch(arquivoJson);
                
                if (!response.ok) {
                    throw new Error(`Arquivo ${arquivoJson} não encontrado (404)`);
                }
                
                const historico = await response.json();
                if (Array.isArray(historico) && historico.length > 0) {
                    return { historico, origem: 'JSON Local' };
                }
                return { historico: [], origem: 'Vazio' };
            } catch (error) {
                console.error("Erro ao carregar histórico JSON local:", error);
                return { historico: [], origem: 'Erro' };
            }
        }

        function getConcursoHeader(draw) { return draw.concurso || draw.numero || draw.id || '?'; }

        function calcularEstatisticasNumeros(draws, loteria) {
            const isSuperSete = (loteria === 'supersete');
            const totalNumeros = TOTAL_NUMEROS[loteria] || 60;
            const numeros = isSuperSete ? Array.from({ length: 10 }, (_, i) => i) : Array.from({ length: totalNumeros }, (_, i) => i + 1);
            const numeroValido = (n) => isSuperSete ? (n >= 0 && n <= 9) : (n >= 1 && n <= totalNumeros);

            const freq = {}, ocorrencias = {}, atrasoAtual = {};
            numeros.forEach(n => { freq[n] = 0; ocorrencias[n] = []; atrasoAtual[n] = draws.length; });

            draws.forEach((draw) => {
                const concursoNum = getConcursoHeader(draw);
                const numerosDraw = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
                
                numerosDraw.forEach(n => {
                    if (numeroValido(n)) {
                        freq[n] = (freq[n] || 0) + 1;
                        ocorrencias[n].push(concursoNum);
                        atrasoAtual[n] = 0;
                    }
                });

                numeros.forEach(n => {
                    if (!numerosDraw.includes(n)) {
                        if (ocorrencias[n].length > 0) {
                            atrasoAtual[n]++;
                        }
                    }
                });
            });

            const valores = Object.values(freq);
            const media = valores.reduce((a, b) => a + b, 0) / (valores.length || 1);
            const desvio = Math.sqrt(valores.reduce((a, b) => a + (b - media) ** 2, 0) / (valores.length || 1));

            return { numeros, freq, ocorrencias, atrasoAtual, media, desvio, isSuperSete, totalNumeros };
        }

        function classificarNumero(num, stats) {
            const count = stats.freq[num] || 0;
            const atraso = stats.atrasoAtual[num] || 0;

            if (atraso >= 15 && count > 0) return 'delay';
            if (count > stats.media + stats.desvio * 0.7) return 'hot';
            if (count < stats.media - stats.desvio * 0.7) return 'cold';
            return 'mid';
        }

        function formatarTooltip(concursos, atraso) {
            const t = i18n[currentLang];
            if (!concursos.length) return t.never_drawn;
            const recentes = concursos.slice(-5).reverse().join(', ');
            return `${t.times_drawn(concursos.length)} ${t.last_draws_label}${recentes}. (Atraso: ${atraso} concursos)`;
        }

        async function carregarEstatisticas(loteria, nomeExibicao, elementoBotao) {
            currentLottery = loteria;
            currentLotteryName = nomeExibicao || currentLotteryName;

            document.querySelectorAll('.lottery-card-btn').forEach(btn => btn.classList.remove('active'));
            if (elementoBotao) {
                elementoBotao.classList.add('active');
            } else {
                const btnEncontrado = document.querySelector(`.btn-${loteria}`);
                if (btnEncontrado) btnEncontrado.classList.add('active');
            }

            const t = i18n[currentLang];
            document.getElementById('stats_title').innerText = currentLotteryName;
            document.getElementById('badge_fonte').innerText = t.checking;
            document.getElementById('stats_subtitle').innerText = t.loading;

            const resultado = await obterHistoricoLocal(loteria);
            const draws = resultado.historico;
            const origemDados = resultado.origem;

            if (!draws || draws.length === 0) {
                document.getElementById('stats_subtitle').innerText = `${t.no_history} ${currentLotteryName}.`;
                document.getElementById('badge_fonte').innerText = t.empty_warning;
                document.getElementById('stats_container').innerHTML = `
                    <div class="estado-vazio">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>${t.no_history} <strong>${currentLotteryName}</strong>.</p>
                    </div>`;
                return;
            }

            const ultimoConcurso = draws[draws.length - 1];
            const numUltimo = getConcursoHeader(ultimoConcurso);

            document.getElementById('stats_subtitle').innerText = t.analyzed_total(draws.length);
            document.getElementById('badge_fonte').innerText = t.source_label(origemDados, numUltimo);

            const stats = calcularEstatisticasNumeros(draws, loteria);

            const colunas = COLUNAS_GRADE[loteria] || 10;
            let gridHtml = `<div class="number-grid" style="grid-template-columns: repeat(${colunas}, 1fr);">`;
            stats.numeros.forEach(num => {
                const cls = classificarNumero(num, stats);
                const displayNum = stats.isSuperSete ? num : num.toString().padStart(2, '0');
                const tooltipText = formatarTooltip(stats.ocorrencias[num] || [], stats.atrasoAtual[num]);
                gridHtml += `
                    <div class="number-cell ${cls}" data-number="${num}">
                        ${displayNum}
                        <div class="tooltip">${tooltipText}</div>
                    </div>`;
            });
            gridHtml += '</div>';

            const numerosUltimo = (ultimoConcurso.dezenas || ultimoConcurso.listaDezenas || []).map(n => parseInt(n, 10));
            let linhasUltimo = '';
            const rotulos = { hot: t.hot_num, cold: t.cold_num, mid: t.mid_num, delay: t.delay_num };
            
            [...numerosUltimo].sort((a, b) => a - b).forEach(n => {
                const cls = classificarNumero(n, stats);
                const display = stats.isSuperSete ? n : n.toString().padStart(2, '0');
                linhasUltimo += `<div class="last-draw-ball-row"><span class="mini-ball ${cls}">${display}</span><span class="ball-status-label">${rotulos[cls] || ''}</span></div>`;
            });

            const top5 = Object.entries(stats.freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const maiorFreq = top5.length ? top5[0][1] : 1;
            let listaFrequentes = '';
            top5.forEach(([num, count]) => {
                const display = stats.isSuperSete ? num : num.toString().padStart(2, '0');
                const pct = Math.round((count / maiorFreq) * 100);
                listaFrequentes += `
                    <li class="bar-row">
                        <span class="bar-label">${t.number_label}${display}</span>
                        <span class="bar-value">${count} ${t.times_drawn(count).toLowerCase()}</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
                    </li>`;
            });

            document.getElementById('stats_container').className = 'fade-in';
            document.getElementById('stats_container').innerHTML = `
                <div class="painel-principal">
                    <div class="number-grid-wrapper">
                        <h3><i class="fa-solid fa-chart-simple"></i> ${t.freq_title}</h3>
                        <p class="card-desc">${t.freq_desc}</p>
                        ${gridHtml}
                    </div>
                    <div class="stat-card last-draw-panel">
                        <h3><i class="fa-solid fa-bullseye"></i> ${t.last_draw_title(numUltimo)}</h3>
                        <p class="card-desc">${t.last_draw_desc}</p>
                        <div class="last-draw-balls">${linhasUltimo}</div>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3><i class="fa-solid fa-fire"></i> ${t.top_freq_title}</h3>
                        <p class="card-desc">${t.top_freq_desc}</p>
                        <ul class="bar-list">${listaFrequentes}</ul>
                    </div>
                </div>`;
        }

        window.addEventListener('DOMContentLoaded', () => {
            const btnMega = document.querySelector('.btn-megasena');
            carregarEstatisticas('megasena', 'Mega-Sena', btnMega);
        });
    </script>
</body>
</html>
