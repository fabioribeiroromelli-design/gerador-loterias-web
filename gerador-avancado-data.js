// ============================================================
// 12 ESTRATÉGIAS AVANÇADAS (baseado no AdvancedGameGeneratorActivity)
// ============================================================
const AVANCADO_STRATEGIES = [
    {
        id: 'sum',
        name: 'Soma Histórica',
        emoji: '∑',
        shortDesc: 'Gera jogos com soma próxima à média histórica',
        example: 'Mega-Sena → 08 - 17 - 24 - 43 - 47 - 58',
        color: '#3b82f6'
    },
    {
        id: 'hot',
        name: 'Números Quentes',
        emoji: '🔥',
        shortDesc: 'Prioriza números mais frequentes no histórico',
        example: 'Mega-Sena → 10 - 23 - 34 - 41 - 52 - 58',
        color: '#ef4444'
    },
    {
        id: 'balanced',
        name: 'Balanceado Puro',
        emoji: '⚖',
        shortDesc: 'Sorteio completamente aleatório sem viés',
        example: 'Mega-Sena → 12 - 25 - 33 - 41 - 49 - 55',
        color: '#22c55e'
    },
    {
        id: 'delta',
        name: 'Delta System',
        emoji: 'Δ',
        shortDesc: 'Baseado nos intervalos entre números sorteados',
        example: 'Mega-Sena → 05 - 13 - 21 - 34 - 42 - 55',
        color: '#f59e0b'
    },
    {
        id: 'fibonacci',
        name: 'Fibonacci Lotérico',
        emoji: 'φ',
        shortDesc: 'Usa a sequência de Fibonacci adaptada',
        example: 'Mega-Sena → 02 - 05 - 13 - 21 - 34 - 55',
        color: '#8b5cf6'
    },
    {
        id: 'cycle',
        name: 'Ciclo de Frequência',
        emoji: '◎',
        shortDesc: 'Dá preferência a números em ascensão',
        example: 'Mega-Sena → 09 - 17 - 26 - 34 - 44 - 53',
        color: '#06b6d4'
    },
    {
        id: 'delay',
        name: 'Atraso Ponderado',
        emoji: '⏱',
        shortDesc: 'Prioriza números há mais tempo sem sair',
        example: 'Mega-Sena → 07 - 19 - 28 - 36 - 47 - 55',
        color: '#f472b6'
    },
    {
        id: 'quadrant',
        name: 'Quadrantes do Volante',
        emoji: '⊞',
        shortDesc: 'Espalha números por todas as partes do volante',
        example: 'Mega-Sena → 04 - 18 - 27 - 35 - 42 - 56',
        color: '#14b8a6'
    },
    {
        id: 'gaussian',
        name: 'Soma Gaussiana',
        emoji: '∿',
        shortDesc: 'Versão científica com distribuição normal',
        example: 'Mega-Sena → 06 - 15 - 22 - 33 - 41 - 52',
        color: '#8b5cf6'
    },
    {
        id: 'lifecycle',
        name: 'Ciclo de Vida',
        emoji: '🔄',
        shortDesc: 'Analisa frequência e atraso para timing preciso',
        example: 'Mega-Sena → 11 - 20 - 29 - 38 - 46 - 54',
        color: '#facc15'
    },
    {
        id: 'entropy',
        name: 'Entropia Setorial',
        emoji: '📊',
        shortDesc: 'Distribui números por setores inteligentes',
        example: 'Mega-Sena → 03 - 14 - 25 - 36 - 44 - 57',
        color: '#ec4899'
    },
    {
        id: 'fourier',
        name: 'Ciclos de Fourier',
        emoji: '🌊',
        shortDesc: 'Detecta padrões cíclicos ocultos',
        example: 'Mega-Sena → 08 - 16 - 27 - 35 - 49 - 58',
        color: '#6b7280'
    }
];