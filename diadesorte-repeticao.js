// ELEMENTOS DA TELA
const analiseTexto = document.getElementById('analise-texto');
const comparativo = document.getElementById('comparativo');
const tituloAnterior = document.getElementById('titulo-anterior');
const tituloUltimo = document.getElementById('titulo-ultimo');
const gridAnterior = document.getElementById('grid-anterior');
const gridUltimo = document.getElementById('grid-ultimo');
const statsUltimo = document.getElementById('stats-ultimo');
const mesSorte = document.getElementById('mes-sorte');

const inputDezenas = document.getElementById('qtd-dezenas');
const inputRepetidas = document.getElementById('qtd-repetidas');
const inputJogos = document.getElementById('qtd-jogos');
const filterPares = document.getElementById('filter-pares');
const filterImpares = document.getElementById('filter-impares');
const filterPrimos = document.getElementById('filter-primos');

const btnGerar = document.getElementById('btn-gerar');
const progress = document.getElementById('progress');
const containerJogos = document.getElementById('container-jogos');
const btnSalvarTodos = document.getElementById('btn-salvar-todos');

let ultimoConcursoGlobal = null;
let anteriorConcursoGlobal = null;
let jogosGeradosAtuais = [];

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
}

// Extrai as dezenas convertendo "01", "10" para os números 1, 10
function extrairDezenas(item) {
    if (!item || !item.dezenas) return [];
    return item.dezenas.map(Number).filter(n => !isNaN(n));
}

// 1. CARREGAMENTO DOS DADOS (Com suporte ao LocalStorage atualizado)
function carregarDadosDiaDeSorte() {
    let historico = null;

    // 1º Tenta ler os dados salvos/atualizados via download_results.html no LocalStorage
    const dadosSalvos = localStorage.getItem('diadesorte_dados');
    if (dadosSalvos) {
        try {
            historico = JSON.parse(dadosSalvos);
        } catch (e) {
            console.error("Erro ao converter dados do localStorage:", e);
        }
    }

    // 2º Se não encontrou no LocalStorage, lê do arquivo JS local (historico_diadesorte.js)
    if (!historico || !Array.isArray(historico) || historico.length === 0) {
        historico = window.HISTORICO_DIADESORTE;
    }

    // Validação final da lista de resultados
    if (!historico || !Array.isArray(historico) || historico.length < 2) {
        if (analiseTexto) {
            analiseTexto.innerHTML = '<span style="color: #ff6b6b;">Erro ao carregar o histórico. Verifique se realizou o download dos dados.</span>';
        }
        return;
    }

    // Ordena do concurso maior para o menor
    const historicoOrdenado = [...historico].sort((a, b) => Number(b.concurso) - Number(a.concurso));

    ultimoConcursoGlobal = historicoOrdenado[0];
    anteriorConcursoGlobal = historicoOrdenado[1];

    processarExibicaoDiaDeSorte(ultimoConcursoGlobal, anteriorConcursoGlobal);
}

function processarExibicaoDiaDeSorte(ultimo, anterior) {
    const dezenasUltimo = extrairDezenas(ultimo);
    const dezenasAnterior = extrairDezenas(anterior);

    const numUltimo = ultimo.concurso;
    const numAnterior = anterior.concurso;
    const dataUltimo = ultimo.dataApuracao || '';

    // Atualiza cabeçalho do painel de análise
    if (analiseTexto) {
        analiseTexto.innerHTML = `
            <strong>Último Concurso: ${numUltimo} ${dataUltimo ? '(' + dataUltimo + ')' : ''}</strong><br>
            Dezenas: ${dezenasUltimo.map(n => String(n).padStart(2, '0')).sort((a,b)=>a-b).join(' ')}
        `;
    }

    if (comparativo) comparativo.style.display = 'block';
    if (tituloAnterior) tituloAnterior.textContent = `Anterior (${numAnterior})`;
    if (tituloUltimo) tituloUltimo.textContent = `Último (${numUltimo})`;

    const setAnterior = new Set(dezenasAnterior);
    const setUltimo = new Set(dezenasUltimo);

    // Identifica quais dezenas saíram em AMBOS os concursos
    const setRepetidasReais = new Set(
        [...setUltimo].filter(dezena => setAnterior.has(dezena))
    );

    // MONTA O GRID DO CONCURSO ANTERIOR (1 a 31)
    if (gridAnterior) {
        let htmlAnt = '';
        for (let i = 1; i <= 31; i++) {
            const sorteada = setAnterior.has(i);
            const classe = sorteada ? 'ball-panel sorteada' : 'ball-panel';
            htmlAnt += `<div class="${classe}">${String(i).padStart(2, '0')}</div>`;
        }
        gridAnterior.innerHTML = htmlAnt;
    }

    // MONTA O GRID DO ÚLTIMO CONCURSO (1 a 31)
    if (gridUltimo) {
        let htmlUlt = '';
        for (let i = 1; i <= 31; i++) {
            const saiuNoUltimo = setUltimo.has(i);
            const ehRepetida = setRepetidasReais.has(i);

            let classe = 'ball-panel';
            if (ehRepetida) {
                classe += ' repetida';
            } else if (saiuNoUltimo) {
                classe += ' sorteada';
            }

            htmlUlt += `<div class="${classe}">${String(i).padStart(2, '0')}</div>`;
        }
        gridUltimo.innerHTML = htmlUlt;
    }

    // ESTATÍSTICAS DO ÚLTIMO CONCURSO
    if (statsUltimo) {
        const pares = dezenasUltimo.filter(n => n % 2 === 0).length;
        const impares = dezenasUltimo.length - pares;
        const primos = dezenasUltimo.filter(isPrime).length;
        const soma = dezenasUltimo.reduce((a, b) => a + b, 0);

        statsUltimo.textContent = `• Repetidas Reais: ${setRepetidasReais.size} • Pares: ${pares} • Ímpares: ${impares} • Primos: ${primos} • Soma: ${soma}`;
    }

    // MÊS DA SORTE (OCULTO SE NÃO EXISTIR NO BANCO)
    if (mesSorte) {
        const mes = ultimo.nomeTimeCoracaoMesSorte || ultimo.mesSorte || ultimo.mes || '';
        if (mes) {
            mesSorte.style.display = 'block';
            mesSorte.textContent = `🌙 Mês da Sorte: ${mes}`;
        } else {
            mesSorte.style.display = 'none';
        }
    }
}

// 2. GERAÇÃO DE JOGOS
function gerarJogosDiaDeSorte() {
    if (!ultimoConcursoGlobal) {
        alert("Aguarde o carregamento do histórico.");
        return;
    }

    const totalDezenas = parseInt(inputDezenas?.value) || 7;
    const qtdRepetidas = parseInt(inputRepetidas.value) || 4;
    const qtdJogos = parseInt(inputJogos.value) || 10;

    const strictPares = filterPares && filterPares.value !== '' ? parseInt(filterPares.value) : null;
    const strictImpares = filterImpares && filterImpares.value !== '' ? parseInt(filterImpares.value) : null;
    const strictPrimos = filterPrimos && filterPrimos.value !== '' ? parseInt(filterPrimos.value) : null;

    const dezenasUltimo = extrairDezenas(ultimoConcursoGlobal);
    const todasDezenas = Array.from({ length: 31 }, (_, i) => i + 1);
    const dezenasFora = todasDezenas.filter(d => !dezenasUltimo.includes(d));

    if (qtdRepetidas > dezenasUltimo.length) {
        alert(`O número de repetidas não pode ser maior que ${dezenasUltimo.length}.`);
        return;
    }

    if (progress) progress.style.display = 'block';
    containerJogos.innerHTML = '';
    jogosGeradosAtuais = [];

    setTimeout(() => {
        for (let i = 0; i < qtdJogos; i++) {
            let jogoOk = false;
            let tentativas = 0;
            let jogoFinal = [];

            while (!jogoOk && tentativas < 1000) {
                tentativas++;

                const repetidasSorteadas = [...dezenasUltimo]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, qtdRepetidas);

                const faltam = totalDezenas - qtdRepetidas;

                const outrasSorteadas = [...dezenasFora]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, faltam);

                const candidato = [...repetidasSorteadas, ...outrasSorteadas].sort((a, b) => a - b);

                const pares = candidato.filter(n => n % 2 === 0).length;
                const impares = candidato.length - pares;
                const primos = candidato.filter(isPrime).length;

                if (strictPares !== null && pares !== strictPares) continue;
                if (strictImpares !== null && impares !== strictImpares) continue;
                if (strictPrimos !== null && primos !== strictPrimos) continue;

                jogoFinal = candidato;
                jogoOk = true;
            }

            if (!jogoOk) {
                const repetidasSorteadas = [...dezenasUltimo].sort(() => Math.random() - 0.5).slice(0, qtdRepetidas);
                const faltam = totalDezenas - qtdRepetidas;
                const outrasSorteadas = [...dezenasFora].sort(() => Math.random() - 0.5).slice(0, faltam);
                jogoFinal = [...repetidasSorteadas, ...outrasSorteadas].sort((a, b) => a - b);
            }

            jogosGeradosAtuais.push(jogoFinal);
        }

        renderizarJogos();
        if (progress) progress.style.display = 'none';
        if (btnSalvarTodos) btnSalvarTodos.style.display = 'block';
    }, 100);
}

function renderizarJogos() {
    containerJogos.innerHTML = '';

    const dezenasUltimo = extrairDezenas(ultimoConcursoGlobal);

    jogosGeradosAtuais.forEach((jogo, index) => {
        const pares = jogo.filter(n => n % 2 === 0).length;
        const impares = jogo.length - pares;
        const primos = jogo.filter(isPrime).length;
        const repetidasCount = jogo.filter(d => dezenasUltimo.includes(d)).length;
        const soma = jogo.reduce((a, b) => a + b, 0);

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
            <div class="dezenas">
                ${htmlDezenas}
            </div>
            <div class="info">
                • Repetidas: ${repetidasCount} • Pares: ${pares} • Ímpares: ${impares} • Primos: ${primos} • Soma: ${soma}
            </div>
        `;

        containerJogos.appendChild(card);
    });
}

// 3. SALVAR JOGOS DO DIA DE SORTE
function salvarTodosOsJogosDiaDeSorte() {
    if (!jogosGeradosAtuais || jogosGeradosAtuais.length === 0) {
        alert("Nenhum jogo gerado para salvar.");
        return;
    }

    const salvosAnteriores = JSON.parse(localStorage.getItem('saved_games_list') || '[]');
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    const novosJogosFormatados = jogosGeradosAtuais.map(jogo => ({
        id: Date.now() + Math.random(),
        loteria: 'Dia de Sorte',
        data: dataHoje,
        numeros: jogo
    }));

    const listaAtualizada = [...salvosAnteriores, ...novosJogosFormatados];

    localStorage.setItem('saved_games_list', JSON.stringify(listaAtualizada));
    alert(`Sucesso! ${novosJogosFormatados.length} jogo(s) do Dia de Sorte foram salvos.`);
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDiaDeSorte();

    document.getElementById('dec-men')?.addEventListener('click', () => {
        let val = parseInt(inputDezenas.value) || 7;
        if (val > 7) inputDezenas.value = val - 1;
    });

    document.getElementById('dec-mais')?.addEventListener('click', () => {
        let val = parseInt(inputDezenas.value) || 7;
        if (val < 15) inputDezenas.value = val + 1;
    });

    document.getElementById('rep-men')?.addEventListener('click', () => {
        let val = parseInt(inputRepetidas.value) || 0;
        if (val > 0) inputRepetidas.value = val - 1;
    });

    document.getElementById('rep-mais')?.addEventListener('click', () => {
        let val = parseInt(inputRepetidas.value) || 0;
        if (val < 7) inputRepetidas.value = val + 1;
    });

    document.getElementById('jog-men')?.addEventListener('click', () => {
        let val = parseInt(inputJogos.value) || 1;
        if (val > 1) inputJogos.value = val - 1;
    });

    document.getElementById('jog-mais')?.addEventListener('click', () => {
        let val = parseInt(inputJogos.value) || 1;
        if (val < 50) inputJogos.value = val + 1;
    });

    if (btnGerar) btnGerar.addEventListener('click', gerarJogosDiaDeSorte);
    if (btnSalvarTodos) btnSalvarTodos.addEventListener('click', salvarTodosOsJogosDiaDeSorte);
});