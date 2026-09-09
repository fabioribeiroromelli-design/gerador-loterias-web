<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jogos Salvos</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        .grid-loterias { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 15px; }
        .btn-lottery { color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.9rem; transition: transform 0.1s, opacity 0.2s; }
        .btn-lottery:hover { opacity: 0.9; transform: translateY(-2px); }
        .btn-lottery.active { outline: 3px solid #222; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }

        .section-box { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .history-table-container { margin-top: 20px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); overflow-x: auto; }
        table.history-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
        table.history-table th, table.history-table td { padding: 12px 14px; border-bottom: 1px solid #ddd; }
        table.history-table th { background-color: #f4f6f9; color: #333; }
        
        .ball { display: inline-block; background: #27ae60; color: white; width: 28px; height: 28px; line-height: 28px; border-radius: 50%; text-align: center; font-weight: bold; font-size: 12px; margin-right: 4px; margin-bottom: 4px; }
        .ball.hit { background: #f1c40f; color: #2c3e50; border: 2px solid #d4ac0d; }

        .acertos-info { margin-top: 6px; font-size: 13px; font-weight: bold; color: #2c3e50; }

        .btn-action { background: #c0392b; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }
        .btn-action:hover { background: #a93226; }
        
        .btn-clear-all { background: #e74c3c; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; transition: background 0.2s; }
        .btn-clear-all:hover { background: #c0392b; }

        .btn-check-api { background: #2980b9; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; transition: background 0.2s; }
        .btn-check-api:hover { background: #2471a3; }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f6f9;">

    <header class="header-bar" style="background: #800080; color: white; padding: 15px 20px; display: flex; align-items: center; gap: 15px;">
        <button class="btn-back" onclick="window.location.href='home.html'" style="background: white; color: #800080; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold;">← Voltar</button>
        <h1 style="margin: 0; font-size: 1.5rem;">Jogos Salvos</h1>
    </header>

    <main class="container" style="max-width: 1000px; margin: 25px auto; padding: 0 15px;">
        
        <!-- SELEÇÃO DA LOTERIA -->
        <div class="section-box">
            <h2 style="margin-top: 0; font-size: 1.2rem; color: #333;"><i class="fa-solid fa-gamepad"></i> Selecione a Loteria:</h2>
            <div class="grid-loterias">
                <button class="btn-lottery" id="btn_megasena" onclick="mudarLoteria('megasena')" style="background: #209869;">Mega-Sena</button>
                <button class="btn-lottery" id="btn_lotofacil" onclick="mudarLoteria('lotofacil')" style="background: #930089;">Lotofácil</button>
                <button class="btn-lottery" id="btn_quina" onclick="mudarLoteria('quina')" style="background: #260085;">Quina</button>
                <button class="btn-lottery" id="btn_lotomania" onclick="mudarLoteria('lotomania')" style="background: #f78100;">Lotomania</button>
                <button class="btn-lottery" id="btn_timemania" onclick="mudarLoteria('timemania')" style="background: #008822;">Timemania</button>
                <button class="btn-lottery" id="btn_duplasena" onclick="mudarLoteria('duplasena')" style="background: #a61324;">Dupla Sena</button>
                <button class="btn-lottery" id="btn_diadesorte" onclick="mudarLoteria('diadesorte')" style="background: #cb831d;">Dia de Sorte</button>
                <button class="btn-lottery" id="btn_supersete" onclick="mudarLoteria('supersete')" style="background: #7ba818;">Super Sete</button>
                <button class="btn-lottery" id="btn_maismilionaria" onclick="mudarLoteria('maismilionaria')" style="background: #1b3582;">+Milionária</button>
            </div>
        </div>

        <!-- TABELA DE JOGOS SALVOS -->
        <div id="history_display" class="history-table-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                <h3 id="table_title" style="margin: 0; color: #333;">Meus Jogos Salvos</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn-check-api" onclick="atualizarConferenciaAPI()"><i class="fa-solid fa-rotate"></i> Conferir Sorteio</button>
                    <button class="btn-clear-all" onclick="apagarTodosJogos()"><i class="fa-solid fa-trash-can"></i> Apagar Todos</button>
                </div>
            </div>
            
            <table class="history-table">
                <thead>
                    <tr>
                        <th># / ID</th>
                        <th>Data</th>
                        <th>Dezenas Guardadas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="table_body"></tbody>
            </table>
        </div>
    </main>

    <script>
        let loteriaAtual = 'megasena';

        const nomesLoterias = {
            'megasena': 'Mega-Sena',
            'lotofacil': 'Lotofácil',
            'quina': 'Quina',
            'lotomania': 'Lotomania',
            'timemania': 'Timemania',
            'duplasena': 'Dupla Sena',
            'diadesorte': 'Dia de Sorte',
            'supersete': 'Super Sete',
            'maismilionaria': '+Milionária'
        };

        function normalizar(str) {
            return String(str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        }

        // Obtém o último sorteio verificando as chaves do seu localStorage (ex: lottery_cache_Mega-Sena)
        async function buscarUltimoResultadoAPI(loteria, forcarAtualizacao = false) {
            const nomeFormatado = nomesLoterias[loteria] || loteria;
            
            // 1. Tenta recuperar dos caches salvos pelo aplicativo no LocalStorage
            if (!forcarAtualizacao) {
                const chavesCache = [
                    `resultado_conferido_${loteria}`,
                    `lottery_cache_${nomeFormatado}`,
                    `lottery_cache_${loteria}`
                ];

                for (let c of chavesCache) {
                    try {
                        let cache = localStorage.getItem(c);
                        if (cache) {
                            let obj = JSON.parse(cache);
                            let dados = obj.data || obj;
                            if (dados && (dados.dezenas || dados.dezenasOrdemSorteio)) {
                                return {
                                    concurso: dados.concurso || dados.numero,
                                    dezenas: (dados.dezenas || dados.dezenasOrdemSorteio).map(d => String(d).padStart(2, '0'))
                                };
                            }
                        }
                    } catch(e) {}
                }
            }

            // 2. Busca na API caso não ache localmente ou force a atualização
            try {
                let apiName = loteria === 'maismilionaria' ? 'milionaria' : loteria;
                const response = await fetch(`https://loteriascaixa-api.herokuapp.com/api/${apiName}/latest`);
                if (!response.ok) throw new Error();
                
                const data = await response.json();
                let dezenasSorteadas = (data.dezenas || data.dezenasOrdemSorteio || []).map(d => String(d).padStart(2, '0'));

                const resultadoObj = {
                    concurso: data.concurso || data.numero,
                    dezenas: dezenasSorteadas
                };

                localStorage.setItem(`resultado_conferido_${loteria}`, JSON.stringify(resultadoObj));
                return resultadoObj;
            } catch (e) {
                return null;
            }
        }

        function extrairDezenas(jogo) {
            if (Array.isArray(jogo)) return jogo;
            if (!jogo || typeof jogo !== 'object') return [];
            return jogo.dezenas || jogo.numeros || jogo.game || jogo.jogo || [];
        }

        // Lê os jogos buscando em todas as estruturas que apareceram no seu DevTools
        function obterJogosDaLoteria(loteriaId) {
            let jogosEncontrados = [];
            const idNorm = normalizar(loteriaId);

            let chavesParaBuscar = [
                loteriaId,
                idNorm,
                `jogos_${loteriaId}`,
                `jogos_${idNorm}`,
                'saved_games_list',
                'jogos_salvos'
            ];

            chavesParaBuscar.forEach(chave => {
                try {
                    let item = localStorage.getItem(chave);
                    if (!item) return;

                    let parsed = JSON.parse(item);

                    // Se a chave guarda um único objeto com array de dezenas
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        let dez = extrairDezenas(parsed);
                        if (dez.length > 0) jogosEncontrados.push(parsed);
                        return;
                    }

                    if (Array.isArray(parsed)) {
                        parsed.forEach(j => {
                            if (!j) return;

                            // Se for chave global, filtra pelo tipo
                            if (chave === 'saved_games_list' || chave === 'jogos_salvos') {
                                let tipo = normalizar(j.loteria || j.tipo || j.game || '');
                                if (!tipo.includes(idNorm) && !idNorm.includes(tipo)) return;
                            }

                            let dez = extrairDezenas(j);
                            if (dez.length > 0) jogosEncontrados.push(j);
                        });
                    }
                } catch(e) {}
            });

            // Remove duplicados idênticos
            let unicos = [];
            let chavesVistas = new Set();

            jogosEncontrados.forEach(j => {
                let dezStr = extrairDezenas(j).join('-');
                if (!chavesVistas.has(dezStr)) {
                    chavesVistas.add(dezStr);
                    unicos.push(j);
                }
            });

            return unicos;
        }

        async function carregarJogosSalvos(loteria, forcarAPI = false) {
            loteriaAtual = loteria;
            destacarBotaoAtivo(loteria);

            const tbody = document.getElementById('table_body');
            const title = document.getElementById('table_title');
            
            const nomeLoteria = nomesLoterias[loteria] || loteria;
            title.textContent = `Jogos Salvos: ${nomeLoteria.toUpperCase()}`;
            
            const listaJogos = obterJogosDaLoteria(loteria);

            if (listaJogos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #7f8c8d; padding: 20px;">Nenhum jogo salvo encontrado para esta loteria.</td></tr>`;
                return;
            }

            const ultimoSorteio = await buscarUltimoResultadoAPI(loteria, forcarAPI);
            const dezenasSorteadasSet = new Set(ultimoSorteio ? ultimoSorteio.dezenas.map(d => String(parseInt(d, 10))) : []);

            tbody.innerHTML = '';

            listaJogos.forEach((jogo, index) => {
                const tr = document.createElement('tr');
                let dezenasArray = extrairDezenas(jogo);

                let totalAcertos = 0;
                const dezenasHtml = dezenasArray.map(d => {
                    const numLimpo = String(parseInt(d, 10));
                    const formatado = String(d).padStart(2, '0');
                    
                    let isHit = false;
                    if (dezenasSorteadasSet.size > 0 && dezenasSorteadasSet.has(numLimpo)) {
                        isHit = true;
                        totalAcertos++;
                    }
                    
                    return `<span class="ball ${isHit ? 'hit' : ''}">${formatado}</span>`;
                }).join('');

                let infoAcertosHtml = '';
                if (ultimoSorteio && dezenasSorteadasSet.size > 0) {
                    infoAcertosHtml = `<div class="acertos-info"><i class="fa-solid fa-trophy" style="color: #f39c12;"></i> Acertos: ${totalAcertos} (Concurso ${ultimoSorteio.concurso})</div>`;
                } else {
                    infoAcertosHtml = `<div class="acertos-info" style="color: #95a5a6; font-weight: normal;">Clique em "Conferir Sorteio" para atualizar acertos.</div>`;
                }

                const dataJogo = (jogo && typeof jogo === 'object' && (jogo.data || jogo.date)) ? (jogo.data || jogo.date) : new Date().toLocaleDateString('pt-BR');

                tr.innerHTML = `
                    <td style="vertical-align: middle;"><strong>#${index + 1}</strong></td>
                    <td style="vertical-align: middle;">${dataJogo}</td>
                    <td style="vertical-align: middle;">
                        ${dezenasHtml}
                        ${infoAcertosHtml}
                    </td>
                    <td style="vertical-align: middle;">
                        <button class="btn-action" onclick="excluirJogoUnico(${index})">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function mudarLoteria(loteria) {
            carregarJogosSalvos(loteria, false);
        }

        async function atualizarConferenciaAPI() {
            const nomeLoteria = nomesLoterias[loteriaAtual] || loteriaAtual;
            alert(`Buscando o concurso mais recente da ${nomeLoteria}...`);
            await carregarJogosSalvos(loteriaAtual, true);
            alert(`Conferência atualizada com sucesso!`);
        }

        function excluirJogoUnico(index) {
            if (!confirm("Deseja realmente excluir este jogo salvo?")) return;

            const listaAtual = obterJogosDaLoteria(loteriaAtual);
            const jogoParaRemover = listaAtual[index];
            if (!jogoParaRemover) return;

            const idNorm = normalizar(loteriaAtual);
            let chaves = [loteriaAtual, idNorm, `jogos_${loteriaAtual}`, `jogos_${idNorm}`, 'saved_games_list', 'jogos_salvos'];

            chaves.forEach(chave => {
                try {
                    let item = localStorage.getItem(chave);
                    if (!item) return;

                    let parsed = JSON.parse(item);

                    if (Array.isArray(parsed)) {
                        let filtrados = parsed.filter(j => {
                            let dezExistentes = extrairDezenas(j).join(',');
                            let dezRemover = extrairDezenas(jogoParaRemover).join(',');
                            return dezExistentes !== dezRemover;
                        });

                        if (filtrados.length === 0) {
                            localStorage.removeItem(chave);
                        } else {
                            localStorage.setItem(chave, JSON.stringify(filtrados));
                        }
                    }
                } catch(e) {}
            });

            carregarJogosSalvos(loteriaAtual, false);
        }

        function apagarTodosJogos() {
            if (!confirm(`Deseja apagar todos os jogos salvos de ${nomesLoterias[loteriaAtual]}?`)) return;

            const idNorm = normalizar(loteriaAtual);
            let chaves = [loteriaAtual, idNorm, `jogos_${loteriaAtual}`, `jogos_${idNorm}`];

            chaves.forEach(chave => localStorage.removeItem(chave));

            ['saved_games_list', 'jogos_salvos'].forEach(chaveGlobal => {
                try {
                    let item = localStorage.getItem(chaveGlobal);
                    if (item) {
                        let arrayGlobal = JSON.parse(item);
                        if (Array.isArray(arrayGlobal)) {
                            let filtrados = arrayGlobal.filter(j => {
                                let tipo = normalizar(j.loteria || j.tipo || j.game || '');
                                return !tipo.includes(idNorm) && !idNorm.includes(tipo);
                            });
                            localStorage.setItem(chaveGlobal, JSON.stringify(filtrados));
                        }
                    }
                } catch(e) {}
            });

            carregarJogosSalvos(loteriaAtual, false);
        }

        function destacarBotaoAtivo(loteria) {
            document.querySelectorAll('.btn-lottery').forEach(btn => btn.classList.remove('active'));
            const btnAtivo = document.getElementById(`btn_${loteria}`);
            if (btnAtivo) btnAtivo.classList.add('active');
        }

        window.addEventListener('DOMContentLoaded', () => {
            carregarJogosSalvos('megasena', false);
        });
    </script>
</body>
</html>