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
    
    <!-- SDKs do Firebase -->
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>

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
        .header-titles h1 {
            margin: 0;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: clamp(1.4rem, 1.1rem + 1.2vw, 1.9rem);
            letter-spacing: 0.01em;
            line-height: 1.1;
        }
        .header-titles p { margin: 4px 0 0; color: var(--text-muted); font-size: 0.9rem; }
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
            transition: transform .15s ease, filter .15s ease;
            box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 10px rgba(0,0,0,0.28);
        }
        .lottery-card-btn:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .lottery-card-btn.active { box-shadow: 0 0 0 3px var(--gold), 0 6px 16px rgba(0,0,0,0.35); transform: translateY(-2px); }

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
        <button class="btn-back" onclick="window.location.href='home.html'">
            <i class="fa-solid fa-arrow-left"></i> Voltar
        </button>
        <div class="header-titles">
            <h1>Estatísticas das loterias</h1>
            <p>Análise histórica com salvamento local inteligente</p>
        </div>
    </header>

    <main class="container">
        <nav class="lottery-grid-nav">
            <button class="lottery-card-btn" id="btn_megasena" onclick="carregarEstatisticas('megasena')" style="background: #209869;">Mega-Sena</button>
            <button class="lottery-card-btn" id="btn_lotofacil" onclick="carregarEstatisticas('lotofacil')" style="background: #930089;">Lotofácil</button>
            <button class="lottery-card-btn" id="btn_quina" onclick="carregarEstatisticas('quina')" style="background: #260085;">Quina</button>
            <button class="lottery-card-btn" id="btn_lotomania" onclick="carregarEstatisticas('lotomania')" style="background: #f78100;">Lotomania</button>
            <button class="lottery-card-btn" id="btn_timemania" onclick="carregarEstatisticas('timemania')" style="background: #00ff48; color: #14131b;">Timemania</button>
            <button class="lottery-card-btn" id="btn_duplasena" onclick="carregarEstatisticas('duplasena')" style="background: #a61324;">Dupla Sena</button>
            <button class="lottery-card-btn" id="btn_diadesorte" onclick="carregarEstatisticas('diadesorte')" style="background: #cb831d;">Dia de Sorte</button>
            <button class="lottery-card-btn" id="btn_supersete" onclick="carregarEstatisticas('supersete')" style="background: #a8cf45; color: #14131b;">Super Sete</button>
            <button class="lottery-card-btn" id="btn_maismilionaria" onclick="carregarEstatisticas('maismilionaria')" style="background: #1b3582;">+Milionária</button>
        </nav>

        <div class="context-bar">
            <div>
                <h2 id="stats_title">Selecione uma loteria</h2>
                <p id="stats_subtitle"></p>
            </div>
            <span id="badge_fonte">Aguardando...</span>
        </div>

        <div id="stats_container"></div>

        <p class="rodape-nota">As estatísticas utilizam cache local no navegador. Caso ocorra um novo sorteio oficial, limpe os dados ou atualize diretamente pela base.</p>
    </main>

    <script>
        const NOMES_LOTERIAS = {
            megasena: 'Mega-Sena', lotofacil: 'Lotofácil', quina: 'Quina', lotomania: 'Lotomania',
            timemania: 'Timemania', duplasena: 'Dupla Sena', diadesorte: 'Dia de Sorte',
            supersete: 'Super Sete', maismilionaria: '+Milionária'
        };
        const TOTAL_NUMEROS = {
            megasena: 60, lotofacil: 25, quina: 80, lotomania: 100, timemania: 80,
            duplasena: 50, diadesorte: 31, supersete: 7, maismilionaria: 50
        };
        const COLUNAS_GRADE = {
            megasena: 10, lotofacil: 5, quina: 10, lotomania: 10, timemania: 10,
            duplasena: 10, diadesorte: 5, supersete: 10, maismilionaria: 10
        };

        // Função que busca do Cache Local (localStorage) ou do Firebase se não existir
        async function obterHistoricoFirebase(loteria) {
            const cacheKey = `cache_loterias_${loteria}`;
            
            // 1. Tenta buscar do armazenamento local do navegador primeiro
            const dadosLocais = localStorage.getItem(cacheKey);
            if (dadosLocais) {
                try {
                    const historicoParsed = JSON.parse(dadosLocais);
                    if (Array.isArray(historicoParsed) && historicoParsed.length > 0) {
                        console.log(`Carregando ${loteria} do Cache Local do Navegador.`);
                        return { historico: historicoParsed, origem: 'Cache Local' };
                    }
                } catch (e) {
                    console.error("Erro ao ler cache local:", e);
                }
            }

            // 2. Se não tiver no cache, busca do Firebase Firestore
            try {
                if (typeof db === 'undefined') {
                    console.error("Instância 'db' do Firestore não encontrada.");
                    return { historico: [], origem: 'Erro' };
                }

                console.log(`Baixando ${loteria} do Firebase Firestore...`);
                const docRef = db.collection('loterias').doc(loteria);
                const docSnap = await docRef.get();

                if (docSnap.exists) {
                    const dados = docSnap.data();
                    const historico = dados.historico || [];

                    // Salva no localStorage do navegador para as próximas vezes
                    if (historico.length > 0) {
                        localStorage.setItem(cacheKey, JSON.stringify(historico));
                    }

                    return { historico, origem: 'Firebase (Salvo no Cache)' };
                } else {
                    console.warn(`Nenhum documento encontrado para ${loteria} no Firebase.`);
                    return { historico: [], origem: 'Vazio' };
                }
            } catch (error) {
                console.error("Erro ao buscar dados do Firebase:", error);
                return { historico: [], origem: 'Erro' };
            }
        }

        function getConcursoHeader(draw) { return draw.concurso || draw.numero || draw.id || '?'; }
        function getDataConcurso(draw) { return draw.data || draw.dataApuracao || draw.dataSorteio || draw.date || null; }
        function pluralizar(qtd, sing, plur) { return Number(qtd) === 1 ? sing : plur; }

        function calcularEstatisticasNumeros(draws, loteria) {
            const isSuperSete = (loteria === 'supersete');
            const totalNumeros = TOTAL_NUMEROS[loteria] || 60;
            const numeros = isSuperSete ? Array.from({ length: 10 }, (_, i) => i) : Array.from({ length: totalNumeros }, (_, i) => i + 1);
            const numeroValido = (n) => isSuperSete ? (n >= 0 && n <= 9) : (n >= 1 && n <= totalNumeros);

            const freq = {}, ocorrencias = {};
            numeros.forEach(n => { freq[n] = 0; ocorrencias[n] = []; });

            draws.forEach(draw => {
                const numerosDraw = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
                numerosDraw.forEach(n => {
                    if (numeroValido(n)) { freq[n] = (freq[n] || 0) + 1; ocorrencias[n].push(getConcursoHeader(draw)); }
                });
            });

            const valores = Object.values(freq);
            const media = valores.reduce((a, b) => a + b, 0) / (valores.length || 1);
            const desvio = Math.sqrt(valores.reduce((a, b) => a + (b - media) ** 2, 0) / (valores.length || 1));
            const ultimos5Set = new Set(draws.slice(-5).flatMap(d => (d.dezenas || d.listaDezenas || []).map(n => parseInt(n, 10))));

            return { numeros, freq, ocorrencias, media, desvio, ultimos5Set, isSuperSete, totalNumeros };
        }

        function classificarNumero(num, stats) {
            const count = stats.freq[num] || 0;
            let cls = 'mid';
            if (count > stats.media + stats.desvio * 0.8) cls = 'hot';
            else if (count < stats.media - stats.desvio * 0.8) cls = 'cold';
            if (!stats.ultimos5Set.has(Number(num))) cls = 'delay';
            return cls;
        }

        function formatarTooltip(concursos) {
            if (!concursos.length) return 'Nunca sorteado.';
            const recentes = concursos.slice(-5).reverse().join(', ');
            return `Saiu ${concursos.length} ${pluralizar(concursos.length, 'vez', 'vezes')}. Últimos concursos: ${recentes}.`;
        }

        async function carregarEstatisticas(loteria) {
            document.querySelectorAll('.lottery-card-btn').forEach(btn => btn.classList.remove('active'));
            const btnAtivo = document.getElementById('btn_' + loteria);
            if (btnAtivo) btnAtivo.classList.add('active');

            const nomeOficial = NOMES_LOTERIAS[loteria] || loteria;
            document.getElementById('stats_title').innerText = nomeOficial;
            document.getElementById('badge_fonte').innerText = 'Verificando dados...';
            document.getElementById('stats_subtitle').innerText = 'Carregando estatísticas...';

            // Chama a função que gerencia o cache local / Firebase
            const resultado = await obterHistoricoFirebase(loteria);
            const draws = resultado.historico;
            const origemDados = resultado.origem;

            if (!draws || draws.length === 0) {
                document.getElementById('stats_subtitle').innerText = 'Nenhum histórico encontrado.';
                document.getElementById('badge_fonte').innerText = 'Aviso: Dados Vazios';
                document.getElementById('stats_container').innerHTML = `
                    <div class="estado-vazio">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>Não há histórico salvo para <strong>${nomeOficial}</strong>.</p>
                    </div>`;
                return;
            }

            const ultimoConcurso = draws[draws.length - 1];
            const numUltimo = getConcursoHeader(ultimoConcurso);
            const dataUltima = getDataConcurso(ultimoConcurso);

            document.getElementById('stats_subtitle').innerText = `Total de ${draws.length} concursos analisados`;
            document.getElementById('badge_fonte').innerText = `Fonte: ${origemDados} (Concurso ${numUltimo})`;

            const stats = calcularEstatisticasNumeros(draws, loteria);

            const colunas = COLUNAS_GRADE[loteria] || 10;
            let gridHtml = `<div class="number-grid" style="grid-template-columns: repeat(${colunas}, 1fr);">`;
            stats.numeros.forEach(num => {
                const cls = classificarNumero(num, stats);
                const displayNum = stats.isSuperSete ? num : num.toString().padStart(2, '0');
                const tooltipText = formatarTooltip(stats.ocorrencias[num] || []);
                gridHtml += `
                    <div class="number-cell ${cls}" data-number="${num}">
                        ${displayNum}
                        <div class="tooltip">${tooltipText}</div>
                    </div>`;
            });
            gridHtml += '</div>';

            const numerosUltimo = (ultimoConcurso.dezenas || ultimoConcurso.listaDezenas || []).map(n => parseInt(n, 10));
            let linhasUltimo = '';
            const rotulos = { hot: 'Número quente', cold: 'Número frio', mid: 'Frequência média', delay: 'Estava em atraso' };
            
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
                        <span class="bar-label">Número ${display}</span>
                        <span class="bar-value">${count} ${pluralizar(count, 'vez', 'vezes')}</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
                    </li>`;
            });

            document.getElementById('stats_container').className = 'fade-in';
            document.getElementById('stats_container').innerHTML = `
                <div class="painel-principal">
                    <div class="number-grid-wrapper">
                        <h3><i class="fa-solid fa-chart-simple"></i> Frequência dos Números</h3>
                        <p class="card-desc">Histórico completo de saídas por dezena. Carregado instantaneamente do navegador.</p>
                        ${gridHtml}
                    </div>
                    <div class="stat-card last-draw-panel">
                        <h3><i class="fa-solid fa-bullseye"></i> Último Concurso (${numUltimo})</h3>
                        <p class="card-desc">Resultado oficial apurado em ${dataUltima || 'data recente'}.</p>
                        <div class="last-draw-balls">${linhasUltimo}</div>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3><i class="fa-solid fa-fire"></i> Números Mais Frequentes</h3>
                        <p class="card-desc">Dezenas que mais apareceram no histórico.</p>
                        <ul class="bar-list">${listaFrequentes}</ul>
                    </div>
                </div>`;
        }

        window.addEventListener('DOMContentLoaded', () => {
            carregarEstatisticas('megasena');
        });
    </script>
</body>
</html>