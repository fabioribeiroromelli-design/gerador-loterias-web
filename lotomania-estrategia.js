// ELEMENTOS DA TELA
const analiseTexto = document.getElementById('analise-texto');
const comparativo = document.getElementById('comparativo');
const tituloAnterior = document.getElementById('titulo-anterior');
const tituloUltimo = document.getElementById('titulo-ultimo');
const gridAnterior = document.getElementById('grid-anterior');
const gridUltimo = document.getElementById('grid-ultimo');
const statsUltimo = document.getElementById('stats-ultimo');

const inputRepetidas = document.getElementById('qtd-repetidas');
const inputJogos = document.getElementById('qtd-jogos');
const btnGerar = document.getElementById('btn-gerar');
const progress = document.getElementById('progress');
const containerJogos = document.getElementById('container-jogos');
const btnSalvarTodos = document.getElementById('btn-salvar-todos');

let ultimoConcursoGlobal = null;
let anteriorConcursoGlobal = null;
let jogosGeradosAtuais = [];

// 1. CARREGAMENTO DOS DADOS
function carregarDadosLotomania() {
    const historico = window.HISTORICO_LOTOMANIA || 
                      window.historicoLotomania || 
                      window.lotomaniaHistorico || 
                      window.lotomaniaData;

    if (!historico || !Array.isArray(historico) || historico.length < 2) {
        if (analiseTexto) {
            analiseTexto.innerHTML = '<span style="color: #ff6b6b;">Erro ao carregar o histórico da Lotomania.</span>';
        }
        return;
    }

    const historicoOrdenado = [...historico].sort((a, b) => Number(b.concurso) - Number(a.concurso));

    ultimoConcursoGlobal = historicoOrdenado[0];
    anteriorConcursoGlobal = historicoOrdenado[1];

    processarExibicaoLotomania(ultimoConcursoGlobal, anteriorConcursoGlobal);
}

function processarExibicaoLotomania(ultimo, anterior) {
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

        if (gridAnterior) {
            let htmlAnt = '';
            for (let i = 0; i <= 99; i++) {
                const sorteada = setAnterior.has(i);
                const classe = sorteada ? 'ball sorteada' : 'ball';
                htmlAnt += `<div class="${classe}">${String(i).padStart(2, '0')}</div>`;
            }
            gridAnterior.innerHTML = htmlAnt;
        }

        if (gridUltimo) {
            let htmlUlt = '';
            for (let i = 0; i <= 99; i++) {
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

// 2. GERAÇÃO DE JOGOS
function gerarJogosLotomania() {
    if (!ultimoConcursoGlobal) {
        alert("Aguarde o carregamento do histórico.");
        return;
    }

    const qtdRepetidas = parseInt(inputRepetidas.value) || 10;
    const qtdJogos = parseInt(inputJogos.value) || 10;

    const dezenasUltimo = (ultimoConcursoGlobal.dezenas || []).map(Number);
    const todasDezenas = Array.from({ length: 100 }, (_, i) => i);
    const dezenasFora = todasDezenas.filter(d => !dezenasUltimo.includes(d));

    if (qtdRepetidas > dezenasUltimo.length) {
        alert(`O número de repetidas não pode ser maior que 20.`);
        return;
    }

    if (progress) progress.style.display = 'block';
    containerJogos.innerHTML = '';
    jogosGeradosAtuais = [];

    setTimeout(() => {
        for (let i = 0; i < qtdJogos; i++) {
            const repetidasSorteadas = [...dezenasUltimo]
                .sort(() => Math.random() - 0.5)
                .slice(0, qtdRepetidas);

            const faltam = 50 - qtdRepetidas;

            const outrasSorteadas = [...dezenasFora]
                .sort(() => Math.random() - 0.5)
                .slice(0, faltam);

            const jogo = [...repetidasSorteadas, ...outrasSorteadas].sort((a, b) => a - b);
            jogosGeradosAtuais.push(jogo);
        }

        renderizarJogos();
        if (progress) progress.style.display = 'none';
        if (btnSalvarTodos) btnSalvarTodos.style.display = 'block';
    }, 100);
}

function renderizarJogos() {
    containerJogos.innerHTML = '';

    jogosGeradosAtuais.forEach((jogo, index) => {
        const pares = jogo.filter(n => n % 2 === 0).length;
        const impares = 50 - pares;

        const card = document.createElement('div');
        card.className = 'game-card';

        let htmlDezenas = '';
        jogo.forEach(dez => {
            htmlDezenas += `<span>${String(dez).padStart(2, '0')}</span>`;
        });

        card.innerHTML = `
            <div class="header">
                <span class="title">Jogo ${index + 1} (50 Dezenas)</span>
            </div>
            <div class="dezenas">
                ${htmlDezenas}
            </div>
            <div class="info">
                • Pares: ${pares} • Ímpares: ${impares}
            </div>
        `;

        containerJogos.appendChild(card);
    });
}

// 3. SALVAR JOGOS DA LOTOMANIA
function salvarTodosOsJogosLotomania() {
    if (!jogosGeradosAtuais || jogosGeradosAtuais.length === 0) {
        alert("Nenhum jogo gerado para salvar.");
        return;
    }

    const salvosAnteriores = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    const novosJogosFormatados = jogosGeradosAtuais.map(jogo => ({
        id: Date.now() + Math.random(),
        loteria: 'Lotomania',
        data: dataHoje,
        numeros: jogo
    }));

    const listaAtualizada = [...salvosAnteriores, ...novosJogosFormatados];

    localStorage.setItem('saved_games_list', JSON.stringify(listaAtualizada));
    alert(`Sucesso! ${novosJogosFormatados.length} jogo(s) da Lotomania foram salvos.`);
}

// 4. EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosLotomania();

    document.getElementById('rep-men')?.addEventListener('click', () => {
        let val = parseInt(inputRepetidas.value) || 0;
        if (val > 0) inputRepetidas.value = val - 1;
    });

    document.getElementById('rep-mais')?.addEventListener('click', () => {
        let val = parseInt(inputRepetidas.value) || 0;
        if (val < 20) inputRepetidas.value = val + 1;
    });

    document.getElementById('jog-men')?.addEventListener('click', () => {
        let val = parseInt(inputJogos.value) || 1;
        if (val > 1) inputJogos.value = val - 1;
    });

    document.getElementById('jog-mais')?.addEventListener('click', () => {
        let val = parseInt(inputJogos.value) || 1;
        if (val < 50) inputJogos.value = val + 1;
    });

    if (btnGerar) btnGerar.addEventListener('click', gerarJogosLotomania);
    if (btnSalvarTodos) btnSalvarTodos.addEventListener('click', salvarTodosOsJogosLotomania);
});