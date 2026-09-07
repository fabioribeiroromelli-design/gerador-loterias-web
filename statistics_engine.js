const LotteryStatsEngine = {
    // Lista de números primos válidos no universo das loterias (de 1 a 100)
    PRIMES: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97],

    // 1. Frequência e Atraso de Primos vs. Compostos
    getPrimeAnalysis(draws) {
        let totalPrimes = 0;
        let totalComposites = 0;
        const primeCountsPerDraw = {};

        draws.forEach(draw => {
            const numbers = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
            const primeCount = numbers.filter(n => this.PRIMES.includes(n)).length;
            
            if (this.PRIMES.includes(numbers)) totalPrimes++;
            primeCountsPerDraw[primeCount] = (primeCountsPerDraw[primeCount] || 0) + 1;
        });

        return {
            primeDistribution: primeCountsPerDraw, // Ex: { "2": 450, "3": 890 } (quantos concursos tiveram N primos)
            avgPrimesPerDraw: (Object.entries(primeCountsPerDraw).reduce((acc, [k, v]) => acc + (k * v), 0) / (draws.length || 1)).toFixed(2)
        };
    },

    // 2. Análise Detalhada Par / Ímpar
    getEvenOddDetailed(draws) {
        const patterns = {};

        draws.forEach(draw => {
            const numbers = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
            const evens = numbers.filter(n => n % 2 === 0).length;
            const odds = numbers.length - evens;
            const patternKey = `${evens}P - ${odds}I`;

            patterns[patternKey] = (patterns[patternKey] || 0) + 1;
        });

        // Retorna padrões ordenados do mais comum ao mais raro (Ex: "3P - 3I": 540 vezes)
        return Object.entries(patterns)
            .map(([pattern, count]) => ({ pattern, count, percentage: ((count / draws.length) * 100).toFixed(1) }))
            .sort((a, b) => b.count - a.count);
    },

    // 3. Sequências e Consecutivos (Ex: 14-15 ou 22-23-24)
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
            sequenceLengths: maxSequences // Ex: { "2": 800, "3": 120 } (maior sequência no cartão)
        };
    },

    // 4. Análise por Quadrantes (Divisão da cartela em 4 partes)
    getQuadrantAnalysis(draws, totalColumns = 10) {
        const quadrantCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

        draws.forEach(draw => {
            const numbers = (draw.dezenas || draw.listaDezenas || []).map(n => parseInt(n, 10));
            numbers.forEach(n => {
                // Cálculo de posição genérico baseado em matriz de 10 colunas
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

    // 5. Relatório Completo Avançado
    generateAdvancedReport(lotteryName, draws, maxNumber) {
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