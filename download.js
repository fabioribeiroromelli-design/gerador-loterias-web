document.addEventListener('DOMContentLoaded', () => {
    const btnDownload = document.getElementById('btn_start_download');
    const selectType = document.getElementById('select_download_type');
    const statusEl = document.getElementById('download_status');

    if (!btnDownload) return;

    btnDownload.addEventListener('click', async () => {
        const lottery = selectType ? selectType.value : 'megasena';
        statusEl.style.color = '#007bff';
        statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando e atualizando no Firebase...';

        try {
            let data = null;

            // 1. Busca os dados atualizados da API
            try {
                const res = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/${lottery}`);
                if (res.ok) data = await res.json();
            } catch (e) {
                console.warn("API Caixa indisponível via CORS, tentando servidor auxiliar...");
            }

            if (!data) {
                const resAlt = await fetch(`https://api.guidi.dev.br/loteria/${lottery}/ultimo`);
                if (resAlt.ok) data = await resAlt.json();
            }

            if (!data) {
                throw new Error("Não foi possível obter os dados da loteria.");
            }

            // 2. Salva diretamente no Firestore
            const concurso = String(data.numero || data.concurso);
            
            // Assume que 'db' é a sua instância do Firestore já inicializada
            await db.collection('loterias').doc(lottery).collection('concursos').doc(concurso).set(data, { merge: true });

            statusEl.style.color = '#28a745';
            statusEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> Concurso ${concurso} atualizado no Firebase com sucesso!`;

            // Para verificar o resultado: atualize a tabela na tela
            if (typeof carregarDadosFirebase === 'function') {
                carregarDadosFirebase(lottery);
            }

        } catch (err) {
            console.error(err);
            statusEl.style.color = '#dc3545';
            statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Erro ao atualizar os dados.';
        }
    });
});