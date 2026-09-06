const fs = require('fs');
const path = require('path');

const loterias = [
    'megasena', 'lotofacil', 'quina', 
    'lotomania', 'timemania', 'duplasena', 
    'diadesorte', 'supersete', 'maismilionaria'
];

const pastaDados = path.join(__dirname, 'dados');

if (!fs.existsSync(pastaDados)) {
    fs.mkdirSync(pastaDados, { recursive: true });
}

async function atualizarLoterias() {
    console.log(`[${new Date().toLocaleString('pt-BR')}] Iniciando atualização...`);

    for (const loteria of loterias) {
        try {
            const response = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/${loteria}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();

            const jsonLimpo = {
                loteria: data.tipoJogo || loteria,
                concurso: data.numero,
                dataApuracao: data.dataApuracao,
                dezenasSorteadas: data.listaDezenas || data.dezenasSorteadasOrdemSorteio || [],
                acumulado: data.acumulado || false,
                valorEstimadoProximoConcurso: data.valorEstimadoProximoConcurso || 0,
                dataProximoConcurso: data.dataProximoConcurso || ""
            };

            const caminhoArquivo = path.join(pastaDados, `${loteria}.json`);
            fs.writeFileSync(caminhoArquivo, JSON.stringify(jsonLimpo, null, 2), 'utf-8');
            console.log(`✔ ${loteria.toUpperCase()} (Concurso ${data.numero}) salvo com sucesso.`);

        } catch (err) {
            console.error(`❌ Erro ao atualizar ${loteria}:`, err.message);
        }
    }
    console.log('Atualização concluída!\n');
}

atualizarLoterias();