// ELEMENTOS DA TELA
const analiseTexto = document.getElementById('analise-texto');
const comparativo = document.getElementById('comparativo');
const tituloAnterior = document.getElementById('titulo-anterior');
const tituloUltimo = document.getElementById('titulo-ultimo');
const gridAnterior = document.getElementById('grid-anterior');
const gridUltimo = document.getElementById('grid-ultimo');
const statsUltimo = document.getElementById('stats-ultimo');

const inputDezenas = document.getElementById('qtd-dezenas');
const inputRepetidas = document.getElementById('qtd-repetidas');
const inputJogos = document.getElementById('qtd-jogos');
const inputPares = document.getElementById('filter-pares');
const inputImpares = document.getElementById('filter-impares');
const inputPrimos = document.getElementById('filter-primos');

const btnGerar = document.getElementById('btn-gerar');
const progress = document.getElementById('progress');
const containerJogos = document.getElementById('container-jogos');
const btnSalvarTodos = document.getElementById('btn-salvar-todos');

let ultimoConcursoGlobal = null;
let anteriorConcursoGlobal = null;
let jogosGeradosAtuais = [];

const PRIMOS_LOTOFACIL = [2, 3, 5, 7, 11, 13, 17, 19, 23];

// 1. CARREGAMENTO DOS DADOS DE HISTÓRICO
function carregarDadosLotofacil() {
    const historico = window.HISTORICO_LOTOFACIL || 
                      window.historicoLotofacil || 
                      window.lotofacilHistorico || 
                      window.lotofacilData;

    if (!historico || !Array.isArray(historico) || historico.length < 2) {
        if (analiseTexto) {
            analiseTexto.innerHTML = '<span style="color: #ff6b6b;">Erro ao carregar o histórico da Lotofácil.</span>';
        }
        return;
    }

    const historicoOrdenado = [...historico].sort((a, b) => Number(b.concurso) - Number(a.concurso));

    ultimoConcursoGlobal = historicoOrdenado[0];
    anteriorConcursoGlobal = historicoOrdenado[1];

    processarExibicao(ultimoConcursoGlobal, anteriorConcursoGlobal);
}

function processarExibicao(ultimo, anterior) {
    const dezenasUltimo = (ultimo.dezenas || []).map(Number);
    const dezenasAnterior = (anterior.dezenas || []).map(Number);

    const numUltimo = ultimo.concurso;
    const numAnterior = anterior.concurso;
    const dataUltimo = ultimo.dataApuracao || ultimo.data || '';

    if (analiseTexto) {
        analiseTexto.innerHTML = `
            <strong>Último Concurso: ${numUltimo} ${dataUltimo ? '(' + dataUltimo + ')' : ''}</strong><br>
            Dezenas: ${dezenasUltimo.map(n => String(n).padStart(2, '0')).sort((a,b)=>a-b).join(' ')}
        `;
    }

    if (comparativo) {
        comparativo.style.display = 'block';

        if (tituloAnterior) tituloAnterior.textContent = `Anterior (${numAnterior})`;
        if (tituloUltimo) tituloUltimo.textContent = `Último (${numUltimo}) • Repetidas em Destaque`;

        const setAnterior = new Set(dezenasAnterior);
        const setUltimo = new Set(dezenasUltimo);

        const setRepetidasReais = new Set(
            [...setUltimo].filter(dezena => setAnterior.has(dezena))
        );

        // Grid Anterior (1 a 25)
        if (gridAnterior) {
            let htmlAnt = '';
            for (let i = 1; i <= 25; i++) {
                const sorteada = setAnterior.has(i);
                const classe = sorteada ? 'ball sorteada' : 'ball';
                htmlAnt += `<div class="${classe}">${String(i).padStart(2, '0')}</div>`;
            }
            gridAnterior.innerHTML = htmlAnt;
        }

        // Grid Último (1 a 25)
        if (gridUltimo) {
            let htmlUlt = '';
            for (let i = 1; i <= 25; i++) {
                const saiuNoUltimo = setUltimo.has(i);
                const ehRepetida = setRepetidasReais.has(i);

                let classe = 'ball';
                if (ehRepetida) {
                    classe += ' repetida';
                } else if (saiuNoUltimo) {
                    classe += ' sorteada';
                }

                htmlUlt += `<div class="${classe}">${String(i).padStart(2, '0')}</div>`;
            }
            gridUltimo.innerHTML = htmlUlt;
        }

        if (statsUltimo) {
            const pares = dezenasUltimo.filter(n => n % 2 === 0).length;
            const impares = dezenasUltimo.length - pares;
            const soma = dezenasUltimo.reduce((a, b) => a + b, 0);

            statsUltimo.textContent = `• Repetidas Reais: ${setRepetidasReais.size} • Pares: ${pares} • Ímpares: ${impares} • Soma: ${soma}`;
        }
    }
}

// 2. CÁLCULO AUTOMÁTICO DE PARES/ÍMPARES
function autoCalcularParesImpares(origem) {
    const totalDezenas = parseInt(inputDezenas?.value) || 15;

    if (origem === 'pares' && inputPares && inputPares.value !== '') {
        const valPares = parseInt(inputPares.value);
        if (valPares <= totalDezenas && valPares >= 0) {
            inputImpares.value = totalDezenas - valPares;
        }
    } else if (origem === 'impares' && inputImpares && inputImpares.value !== '') {
        const valImpares = parseInt(inputImpares.value);
        if (valImpares <= totalDezenas && valImpares >= 0) {
            inputPares.value = totalDezenas - valImpares;
        }
    }
}

// 3. GERAÇÃO DE JOGOS
function gerarJogosLotofacil() {
    if (!ultimoConcursoGlobal) {
        alert("Aguarde o carregamento do histórico.");
        return;
    }

    const qtdDezenas = parseInt(inputDezenas?.value) || 15;
    const qtdRepetidas = parseInt(inputRepetidas?.value) || 9;
    const qtdJogos = parseInt(inputJogos?.value) || 10;

    const valPares = inputPares && inputPares.value !== '' ? parseInt(inputPares.value) : null;
    const valImpares = inputImpares && inputImpares.value !== '' ? parseInt(inputImpares.value) : null;
    const valPrimos = inputPrimos && inputPrimos.value !== '' ? parseInt(inputPrimos.value) : null;

    const dezenasUltimo = (ultimoConcursoGlobal.dezenas || []).map(Number);
    const dezenasFora = Array.from({ length: 25 }, (_, i) => i + 1).filter(d => !dezenasUltimo.includes(d));

    if (qtdRepetidas > qtdDezenas || qtdRepetidas > 15) {
        alert(`O número de repetidas não pode ser maior que o total de dezenas do jogo (${qtdDezenas}) nem maior que 15.`);
        return;
    }

    if (progress) progress.style.display = 'block';
    containerJogos.innerHTML = '';
    jogosGeradosAtuais = [];

    setTimeout(() => {
        let tentativas = 0;
        const maxTentativas = 5000;

        while (jogosGeradosAtuais.length < qtdJogos && tentativas < maxTentativas) {
            tentativas++;

            const repetidasSorteadas = [...dezenasUltimo]
                .sort(() => Math.random() - 0.5)
                .slice(0, qtdRepetidas);

            const faltam = qtdDezenas - qtdRepetidas;

            const outrasSorteadas = [...dezenasFora]
                .sort(() => Math.random() - 0.5)
                .slice(0, faltam);

            const jogo = [...repetidasSorteadas, ...outrasSorteadas].sort((a, b) => a - b);

            const paresCount = jogo.filter(n => n % 2 === 0).length;
            const imparesCount = jogo.length - paresCount;
            const primosCount = jogo.filter(n => PRIMOS_LOTOFACIL.includes(n)).length;

            if (valPares !== null && paresCount !== valPares) continue;
            if (valImpares !== null && imparesCount !== valImpares) continue;
            if (valPrimos !== null && primosCount !== valPrimos) continue;

            jogosGeradosAtuais.push(jogo);
        }

        if (jogosGeradosAtuais.length < qtdJogos) {
            alert(`Foram gerados ${jogosGeradosAtuais.length} jogos que atendem aos filtros.`);
        }

        renderizarJogos();
        if (progress) progress.style.display = 'none';
        if (btnSalvarTodos && jogosGeradosAtuais.length > 0) {
            btnSalvarTodos.style.display = 'block';
        }
    }, 100);
}

function renderizarJogos() {
    if (!containerJogos) return;
    containerJogos.innerHTML = '';

    jogosGeradosAtuais.forEach((jogo, index) => {
        const pares = jogo.filter(n => n % 2 === 0).length;
        const impares = jogo.length - pares;
        const primos = jogo.filter(n => PRIMOS_LOTOFACIL.includes(n)).length;

        const card = document.createElement('div');
        card.className = 'game-card';

        let htmlDezenas = '';
        jogo.forEach(dez => {
            htmlDezenas += `<span>${String(dez).padStart(2, '0')}</span>`;
        });

        card.innerHTML = `
            <div class="header">
                <span class="title">Jogo ${index + 1} (${jogo.length} Dezenas)</span>
            </div>
            <div class="dezenas" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px;">
                ${htmlDezenas}
            </div>
            <div class="info">
                • Pares: ${pares} • Ímpares: ${impares} • Primos: ${primos}
            </div>
        `;

        containerJogos.appendChild(card);
    });
}

// 4. CORREÇÃO DA FUNÇÃO DE SALVAR (INTEGRAÇÃO COM saved_games.js)
function salvarTodosOsJogos() {
    if (!jogosGeradosAtuais || jogosGeradosAtuais.length === 0) {
        alert("Nenhum jogo gerado para salvar.");
        return;
    }

    // Lê a lista padronizada do sistema
    const salvosAnteriores = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    // Mapeia para a estrutura oficial lida por saved_games.js
    const novosJogosFormatados = jogosGeradosAtuais.map(jogo => ({
        id: Date.now() + Math.random(),
        loteria: 'Lotofácil',
        data: dataHoje,
        numeros: jogo
    }));

    const listaAtualizada = [...salvosAnteriores, ...novosJogosFormatados];

    // Grava na chave global saved_games_list
    localStorage.setItem('saved_games_list', JSON.stringify(listaAtualizada));

    alert(`Sucesso! ${novosJogosFormatados.length} jogo(s) da Lotofácil foram salvos.`);
}

// 5. EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosLotofacil();

    // Botões Dezenas
    document.getElementById('dec-men')?.addEventListener('click', () => {
        let val = parseInt(inputDezenas?.value) || 15;
        if (val > 15) {
            inputDezenas.value = val - 1;
            autoCalcularParesImpares('pares');
        }
    });

    document.getElementById('dec-mais')?.addEventListener('click', () => {
        let val = parseInt(inputDezenas?.value) || 15;
        if (val < 20) {
            inputDezenas.value = val + 1;
            autoCalcularParesImpares('pares');
        }
    });

    // Botões Repetidas
    document.getElementById('rep-men')?.addEventListener('click', () => {
        let val = parseInt(inputRepetidas?.value) || 0;
        if (val > 5) inputRepetidas.value = val - 1;
    });

    document.getElementById('rep-mais')?.addEventListener('click', () => {
        let val = parseInt(inputRepetidas?.value) || 0;
        if (val < 15) inputRepetidas.value = val + 1;
    });

    // Botões Jogos
    document.getElementById('jog-men')?.addEventListener('click', () => {
        let val = parseInt(inputJogos?.value) || 1;
        if (val > 1) inputJogos.value = val - 1;
    });

    document.getElementById('jog-mais')?.addEventListener('click', () => {
        let val = parseInt(inputJogos?.value) || 1;
        if (val < 100) inputJogos.value = val + 1;
    });

    // Ouvintes dos filtros
    inputPares?.addEventListener('input', () => autoCalcularParesImpares('pares'));
    inputImpares?.addEventListener('input', () => autoCalcularParesImpares('impares'));
    inputDezenas?.addEventListener('change', () => autoCalcularParesImpares('pares'));

    // Ações dos botões principais
    if (btnGerar) btnGerar.addEventListener('click', gerarJogosLotofacil);
    if (btnSalvarTodos) btnSalvarTodos.addEventListener('click', salvarTodosOsJogos);
});