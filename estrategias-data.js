// ============================================================
// 12 ESTRATÉGIAS PREMIUM (baseado no código Kotlin)
// ============================================================
const PREMIUM_STRATEGIES = [
    {
        id: 'boltzmann',
        name: 'Boltzmann Premium',
        emoji: '🌡️',
        shortDesc: 'Probabilidade exponencial baseada em temperatura estatística',
        longDesc: 'Inspirado na distribuição de Boltzmann da física estatística. Cada número recebe uma probabilidade proporcional a e^(freq_norm/T), onde T é a "temperatura" (diversidade) e freq_norm é a frequência histórica normalizada (0 a 1).',
        formula: 'P(n) ∝ exp(freq_norm(n) / T) · penalidadeUso(n)',
        example: 'Mega-Sena → 10 - 23 - 34 - 41 - 52 - 58',
        color: '#3b82f6'
    },
    {
        id: 'regressao',
        name: 'Regressão de Tendência',
        emoji: '📈',
        shortDesc: 'Reta de mínimos quadrados identifica números acima da tendência',
        longDesc: 'Ajusta uma reta de regressão linear (mínimos quadrados) entre o número e sua frequência histórica. Números cuja frequência real supera a prevista são priorizados.',
        formula: 'resíduo(n) = freq_obs(n) − (a + b·n)',
        example: 'Mega-Sena → 05 - 13 - 21 - 34 - 42 - 55',
        color: '#8b5cf6'
    },
    {
        id: 'montecarlo',
        name: 'Monte Carlo Ponderado',
        emoji: '🎲',
        shortDesc: 'Simula 50 mil sorteios com pesos reais do histórico',
        longDesc: 'Executa 50.000 sorteios virtuais usando a distribuição de probabilidade derivada do histórico real. Os números mais frequentes formam o jogo.',
        formula: 'P(n) = (freq(n) + 1) / (Σfreq + N)',
        example: 'Dupla Sena → 07 - 19 - 26 - 33 - 41 - 48',
        color: '#ec4899'
    },
    {
        id: 'clusters',
        name: 'Clusters de Frequência',
        emoji: '🔮',
        shortDesc: 'Divide o volante em zonas: quente (40%), médio (30%), frio (30%)',
        longDesc: 'Classifica todos os números em três grupos baseados na frequência histórica. Seleciona proporcionalmente de cada grupo.',
        formula: 'Score = α·freq_norm + (1−α)·(1/atraso_norm)',
        example: 'Lotomania → 12, 25, 38, 44, 51, 67, 73, 82, 90, 99...',
        color: '#f59e0b'
    },
    {
        id: 'golden',
        name: 'Sequência Dourada',
        emoji: '✨',
        shortDesc: 'Van der Corput × φ = cobertura quasi-aleatória de baixa discrepância',
        longDesc: 'Combina a sequência de Van der Corput (base 2) com a razão áurea φ=1.618. Gera números com distribuição uniforme sem padrões visíveis.',
        formula: 'x_n = VdC(n) · φ mod 1',
        example: 'Mega-Sena → 04 - 12 - 22 - 35 - 47 - 56',
        color: '#14b8a6'
    },
    {
        id: 'softmax',
        name: 'Softmax Adaptativo',
        emoji: '🧠',
        shortDesc: 'Normalização exponencial com temperatura variável por rodada',
        longDesc: 'Aplica a função Softmax sobre as frequências históricas normalizadas. A temperatura T varia a cada jogo, alternando entre concentração e exploração.',
        formula: 'P(n) = exp(freq_norm(n)/T) / Σexp(freq_norm(k)/T)',
        example: 'Quina → 08 - 17 - 29 - 45 - 71',
        color: '#06b6d4'
    },
    {
        id: 'variancia',
        name: 'Eixos de Variância',
        emoji: '📐',
        shortDesc: 'Seleciona números com maior desvio da frequência esperada por quadrante',
        longDesc: 'Divide o volante em 4 quadrantes. Dentro de cada quadrante, prioriza números que mais fogem do comportamento neutro.',
        formula: 'score(n) = |freq_obs(n) − freq_esperada|',
        example: 'Dia de Sorte → 03 - 11 - 18 - 22 - 27 - 30',
        color: '#8b5cf6'
    },
    {
        id: 'markov',
        name: 'Markov Ponderado',
        emoji: '⛓️',
        shortDesc: 'Passeio com saltos ponderados pela frequência do destino',
        longDesc: 'Inicia em um número aleatório e realiza saltos cujo tamanho é amostrado da distribuição histórica, modelando dependências entre números próximos.',
        formula: 'P(j | i) ∝ freq(j) · exp(−|j−i|/λ)',
        example: 'Mega-Sena → 05 - 12 - 18 - 23 - 31 - 42',
        color: '#6b7280'
    },
    {
        id: 'pso',
        name: 'Enxame Inteligente (PSO)',
        emoji: '🐝',
        shortDesc: '20 partículas convergem para o conjunto de máxima frequência',
        longDesc: 'Implementa o algoritmo PSO: 20 partículas representam conjuntos de números. Cada partícula se move em direção ao melhor global.',
        formula: 'fitness(S) = Σ freq(n)·penalidadeUso(n)',
        example: 'Mega-Sena → 09 - 17 - 26 - 34 - 44 - 53',
        color: '#f472b6'
    },
    {
        id: 'lorenz',
        name: 'Atrator de Lorenz',
        emoji: '🌌',
        shortDesc: 'Sistema caótico determinístico com warm-up de 200 iterações',
        longDesc: 'Integra numericamente o sistema de Lorenz (σ=10, ρ=28, β=8/3). Os pontos são mapeados para o range da loteria.',
        formula: 'ẋ=σ(y−x), ẏ=x(ρ−z)−y, ż=xy−βz',
        example: 'Lotofácil → 02 - 06 - 10 - 14 - 18 - 21 - 24...',
        color: '#8b5cf6'
    },
    {
        id: 'hot',
        name: 'Números Quentes',
        emoji: '🔥',
        shortDesc: 'Top frequentes do histórico com variação probabilística entre jogos',
        longDesc: 'Seleciona números mais frequentes com sorteio proporcional à frequência, garantindo variação entre os jogos.',
        formula: 'P(n) ∝ freq(n)²·penalidadeUso(n)',
        example: 'Mega-Sena → 10 - 23 - 34 - 41 - 52 - 58',
        color: '#ef4444'
    },
    {
        id: 'harmonic',
        name: 'Harmônico Freq+Atraso',
        emoji: '⚡',
        shortDesc: 'Pontuação combinada: 60% frequência + 40% tempo de ausência',
        longDesc: 'Calcula score composto: 60% frequência histórica + 40% atraso (tempo sem aparecer). Prioriza números quentes com atraso acima da média.',
        formula: 'score(n) = 0.6·freq_norm(n) + 0.4·atraso_norm(n)',
        example: 'Mega-Sena → 07 - 19 - 28 - 36 - 47 - 55',
        color: '#eab308'
    }
];