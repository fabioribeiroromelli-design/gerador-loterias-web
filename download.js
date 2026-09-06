document.addEventListener('DOMContentLoaded', () => {
    const btnDownload = document.getElementById('btn_start_download');
    const selectType = document.getElementById('select_download_type');
    const statusEl = document.getElementById('download_status');

    btnDownload.addEventListener('click', async () => {
        const lottery = selectType.value;
        statusEl.style.color = '#007bff';
        statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando dados atualizados...';

        try {
            let data = null;

            // Tentativa 1: API Oficial da Caixa
            try {
                const res = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/${lottery}`);
                if (res.ok) data = await res.json();
            } catch (e) {
                console.warn("API Caixa indisponível via CORS, tentando servidor auxiliar...");
            }

            // Tentativa 2: Servidor auxiliar em caso de bloqueio do navegador
            if (!data) {
                const resAlt = await fetch(`https://api.guidi.dev.br/loteria/${lottery}/ultimo`);
                if (resAlt.ok) data = await resAlt.json();
            }

            if (!data) {
                throw new Error("Não foi possível obter os dados da loteria.");
            }

            // Cria o arquivo JSON e dispara o download no navegador
            const concurso = data.numero || data.concurso || "ultimo";
            const fileName = `resultado_${lottery}_concurso_${concurso}.json`;
            const jsonString = JSON.stringify(data, null, 2);

            const blob = new Blob([jsonString], { type: 'application/json' });
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);

            statusEl.style.color = '#28a745';
            statusEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> Download do concurso ${concurso} concluído com sucesso!`;

        } catch (err) {
            statusEl.style.color = '#dc3545';
            statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Erro ao baixar os dados. Verifique sua conexão.';
        }
    });
});