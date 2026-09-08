document.addEventListener('DOMContentLoaded', async () => {
    const analiseTexto = document.getElementById('analise-texto');
    const gridAnterior = document.getElementById('grid-anterior');
    const gridUltimo = document.getElementById('grid-ultimo');
    const tituloAnterior = document.getElementById('titulo-anterior');
    const tituloUltimo = document.getElementById('titulo-ultimo');
    const statsUltimo = document.getElementById('stats-ultimo');
    const mesSorte = document.getElementById('mes-sorte');
    const containerJogos = document.getElementById('container-jogos');
    const progress = document.getElementById('progress');
    const btnGerar = document.getElementById('btn-gerar');
    const btnSalvarTodos = document.getElementById('btn-salvar-todos');

    const qtdDezenasInput = document.getElementById('qtd-dezenas');
    const qtdRepetidasInput = document.getElementById('qtd-repetidas');
    const qtdJogosInput = document.getElementById('qtd-jogos');
    const filterPares = document.getElementById('filter-pares');
    const filterImpares = document.getElementById('filter-impares');
    const filterPrimos = document.getElementById('filter-primos');

    document.getElementById('dec-men').addEventListener('click', () => { let v = parseInt(qtdDezenasInput.value) || 7; if (v > 7) qtdDezenasInput.value = v - 1; });
    document.getElementById('dec-mais').addEventListener('click', () => { let v = parseInt(qtdDezenasInput.value) || 7; if (v < 15) qtdDezenasInput.value = v + 1; });
    document.getElementById('rep-men').addEventListener('click', () => { let v = parseInt(qtdRepetidasInput.value) || 4; if (v > 0) qtdRepetidasInput.value = v - 1; });
    document.getElementById('rep-mais').addEventListener('click', () => { let v = parseInt(qtdRepetidasInput.value) || 4; if (v < 7) qtdRepetidasInput.value = v + 1; });
    document.getElementById('jog-men').addEventListener('click', () => { let v = parseInt(qtdJogosInput.value) || 10; if (v > 1) qtdJogosInput.value = v - 1; });
    document.getElementById('jog-mais').addEventListener('click', () => { let v = parseInt(qtdJogosInput.value) || 10; if (v < 50) qtdJogosInput.value = v + 1; });

    function isPrime(n) {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
        return true;
    }

    function shuffleArray(arr) {
        let array = [...arr];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let historico = [];
    let ultimoConcurso = null;
    let anteriorConcurso = null;
    let analise = null;

    function carregarHistoricoLocal() {
        let fonteDados = window.HISTORICO_DIADESORTE || window.HISTORICO_DIADESORTEData;

        if (!fonteDados) {
            const raw = localStorage.getItem('historico_diadesorte');
            if (raw) {
                try { fonteDados = JSON.parse(raw); } catch (e) {}
            }
        }

        if (fonteDados && Array.isArray(fonteDados) && fonteDados.length > 0) {
            historico = fonteDados.map(item => ({
                numero: Number(item.concurso || item.numero || 0),
                data: item.dataApuracao || item.data || '',
                dezenas: (item.dezenas || item.listaDezenas || item.dezenasSorteadas || []).map(n => parseInt(n, 10)),
                mes: item.nomeTimeCoracaoMesSorte || item.mes || ''
            })).filter(item => item.dezenas.length > 0)
              // Ordena do menor para o maior pelo número do concurso
              .sort((a,b) => a.numero - b.numero);
        }

        if (historico.length >= 2) {
            ultimoConcurso = historico[historico.length - 1];
            anteriorConcurso = historico[historico.length - 2];
        } else if (historico.length === 1) {
            ultimoConcurso = historico[0];
        }
    }

    function calcularAnalise() {
        if (historico.length < 2) return null;
        const ult = historico[historico.length - 1];
        const ant = historico[historico.length - 2];
        const repetidas = ult.dezenas.filter(d => ant.dezenas.includes(d));

        const freq = {};
        const ultimos10 = historico.slice(-10);
        ultimos10.forEach(conc => {
            conc.dezenas.forEach(d => { freq[d] = (freq[d] || 0) + 1; });
        });
        const quentes = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0,5).map(e => parseInt(e[0]));

        const ultimos5 = historico.slice(-5);
        const apareceram = new Set(ultimos5.flatMap(c => c.dezenas));
        const atrasados = Array.from({length: 31}, (_,i) => i+1).filter(n => !apareceram.has(n)).slice(0,5);

        return { quentes, atrasados, ultimoConcurso: ult, anteriorConcurso: ant, repetidas };
    }

    function renderizarPainel31(dezenasSorteadas, repetidasSet = new Set()) {
        const sorteadasSet = new Set(dezenasSorteadas);
        let html = '';
        for (let i = 1; i <= 31; i++) {
            let classe = '';
            if (repetidasSet.has(i)) {
                classe = 'repetida';
            } else if (sorteadasSet.has(i)) {
                classe = 'sorteada';
            }
            html += `<div class="ball-panel ${classe}">${String(i).padStart(2, '0')}</div>`;
        }
        return html;
    }

    function exibirAnalise() {
        if (!analise) {
            analiseTexto.textContent = 'Dados insuficientes para análise.';
            return;
        }
        const { quentes, atrasados, ultimoConcurso, anteriorConcurso, repetidas } = analise;

        analiseTexto.innerHTML = `
            <strong>Último Concurso:</strong> ${ultimoConcurso.numero} - ${ultimoConcurso.data}<br>
            <strong>Dezenas Sorteadas:</strong> ${ultimoConcurso.dezenas.sort((a,b)=>a-b).map(n => String(n).padStart(2,'0')).join(' ')}<br>
            <strong>Repetições do Concurso Anterior:</strong> ${repetidas.length} dezenas<br>
            🔥 <strong>Quentes (Últimos 10):</strong> ${quentes.sort((a,b)=>a-b).map(n => String(n).padStart(2,'0')).join(' ')}<br>
            ⏰ <strong>Atrasados:</strong> ${atrasados.sort((a,b)=>a-b).map(n => String(n).padStart(2,'0')).join(' ')}
        `;

        if (anteriorConcurso) {
            tituloAnterior.textContent = `Anterior (${anteriorConcurso.numero} - ${anteriorConcurso.data})`;
            gridAnterior.innerHTML = renderizarPainel31(anteriorConcurso.dezenas);
        }

        if (ultimoConcurso) {
            tituloUltimo.textContent = `Último (${ultimoConcurso.numero} - ${ultimoConcurso.data})`;
            const repetidasSet = new Set(repetidas);
            gridUltimo.innerHTML = renderizarPainel31(ultimoConcurso.dezenas, repetidasSet);

            const pares = ultimoConcurso.dezenas.filter(d => d % 2 === 0).length;
            const impares = ultimoConcurso.dezenas.length - pares;
            const primos = ultimoConcurso.dezenas.filter(isPrime).length;
            const soma = ultimoConcurso.dezenas.reduce((a,b) => a+b, 0);

            statsUltimo.textContent = `• Repetidas: ${repetidas.length} • Pares: ${pares} • Ímpares: ${impares} • Primos: ${primos} • Soma: ${soma}`;
            if (ultimoConcurso.mes) {
                mesSorte.textContent = `🌙 Mês da Sorte: ${ultimoConcurso.mes}`;
            }
        }
    }

    function gerarJogos() {
        if (!analise) return;

        const totalDezenas = parseInt(qtdDezenasInput.value) || 7;
        const qtdRepetidas = parseInt(qtdRepetidasInput.value) || 4;
        const qtdJogos = parseInt(qtdJogosInput.value) || 10;
        const strictPares = filterPares.value !== '' ? parseInt(filterPares.value) : null;
        const strictImpares = filterImpares.value !== '' ? parseInt(filterImpares.value) : null;
        const strictPrimos = filterPrimos.value !== '' ? parseInt(filterPrimos.value) : null;

        const dezenasUltimo = ultimoConcurso.dezenas;
        const range = Array.from({length: 31}, (_,i) => i+1);

        progress.style.display = 'block';
        btnGerar.disabled = true;
        containerJogos.innerHTML = '';
        btnSalvarTodos.style.display = 'none';

        setTimeout(() => {
            const jogos = [];
            for (let j = 0; j < qtdJogos; j++) {
                let tentativas = 0;
                let jogoOk = false;
                let dezenasEscolhidas = [];

                while (!jogoOk && tentativas < 1500) {
                    tentativas++;
                    let selecionadas = new Set();

                    const repetidasEmbaralhadas = shuffleArray([...dezenasUltimo]);
                    for (let i = 0; i < Math.min(qtdRepetidas, repetidasEmbaralhadas.length); i++) {
                        selecionadas.add(repetidasEmbaralhadas[i]);
                    }

                    const novasDisponiveis = shuffleArray(range.filter(n => !dezenasUltimo.includes(n)));
                    let faltam = totalDezenas - selecionadas.size;
                    for (let i = 0; i < Math.min(faltam, novasDisponiveis.length); i++) {
                        selecionadas.add(novasDisponiveis[i]);
                    }

                    const arr = Array.from(selecionadas).sort((a,b) => a-b);
                    if (arr.length !== totalDezenas) continue;

                    const pares = arr.filter(n => n % 2 === 0).length;
                    const impares = arr.filter(n => n % 2 !== 0).length;
                    const primos = arr.filter(isPrime).length;

                    if (strictPares !== null && pares !== strictPares) continue;
                    if (strictImpares !== null && impares !== strictImpares) continue;
                    if (strictPrimos !== null && primos !== strictPrimos) continue;

                    dezenasEscolhidas = arr;
                    jogoOk = true;
                }

                if (!jogoOk) {
                    dezenasEscolhidas = shuffleArray(range).slice(0, totalDezenas).sort((a,b) => a-b);
                }

                const repetidasCount = dezenasEscolhidas.filter(d => dezenasUltimo.includes(d)).length;
                const pares = dezenasEscolhidas.filter(n => n % 2 === 0).length;
                const impares = dezenasEscolhidas.filter(n => n % 2 !== 0).length;
                const primos = dezenasEscolhidas.filter(isPrime).length;
                const soma = dezenasEscolhidas.reduce((a,b) => a+b, 0);

                jogos.push({ dezenas: dezenasEscolhidas, repetidas: repetidasCount, pares, impares, primos, soma });
            }

            exibirJogos(jogos);
            progress.style.display = 'none';
            btnGerar.disabled = false;
            btnSalvarTodos.style.display = 'block';
            window._jogosGerados = jogos;
        }, 50);
    }

    function exibirJogos(jogos) {
        containerJogos.innerHTML = jogos.map((jogo, idx) => `
            <div class="game-card">
                <div class="header">
                    <span class="title">JOGO ${String(idx+1).padStart(2,'0')}</span>
                    <div class="actions">
                        <button class="ver" onclick="verVolante(${idx})">VER</button>
                        <button onclick="salvarJogo(${idx})">💾 Salvar</button>
                    </div>
                </div>
                <div class="dezenas">
                    ${jogo.dezenas.map(d => `<span>${String(d).padStart(2,'0')}</span>`).join('')}
                </div>
                <div class="info">Repetidas: ${jogo.repetidas} | Pares: ${jogo.pares} | Ímpares: ${jogo.impares} | Primos: ${jogo.primos} | Soma: ${jogo.soma}</div>
            </div>
        `).join('');
    }

    window.salvarJogo = function(idx) {
        const jogos = window._jogosGerados;
        if (!jogos || !jogos[idx]) return;

        const saved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
        saved.push({
            id: Date.now() + Math.random(),
            loteria: 'DIA_DE_SORTE',
            data: new Date().toLocaleDateString('pt-BR'),
            numeros: jogos[idx].dezenas,
            estrategia: 'repeticao'
        });

        localStorage.setItem('saved_games_list', JSON.stringify(saved));
        alert('Jogo salvo com sucesso!');
    };

    window.verVolante = function(idx) {
        const jogos = window._jogosGerados;
        if (!jogos || !jogos[idx]) return;
        alert(`Jogo ${idx + 1} - Dia de Sorte:\n${jogos[idx].dezenas.map(n => String(n).padStart(2,'0')).join(' - ')}`);
    };

    btnSalvarTodos.addEventListener('click', function() {
        const jogos = window._jogosGerados;
        if (!jogos || jogos.length === 0) return;

        const saved = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
        jogos.forEach(j => {
            saved.push({
                id: Date.now() + Math.random(),
                loteria: 'DIA_DE_SORTE',
                data: new Date().toLocaleDateString('pt-BR'),
                numeros: j.dezenas,
                estrategia: 'repeticao'
            });
        });

        localStorage.setItem('saved_games_list', JSON.stringify(saved));
        alert(`${jogos.length} jogos salvos com sucesso!`);
    });

    btnGerar.addEventListener('click', gerarJogos);

    carregarHistoricoLocal();
    analise = calcularAnalise();
    exibirAnalise();
});