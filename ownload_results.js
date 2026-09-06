document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-download-lottery');
    const statusEl = document.getElementById('download_status');

    buttons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const lotteryName = button.getAttribute('data-lottery');
            
            statusEl.style.color = '#007bff';
            statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Baixando dados da ${lotteryName}...`;

            try {
                // URL com Proxy CORS para liberar a requisição local (file:///)
                const targetUrl = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${lotteryName}`;
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

                const response = await fetch(proxyUrl);
                
                if (!response.ok) {
                    throw new Error('Falha na resposta da API');
                }

                const data = await response.json();

                // Converte em arquivo JSON e aciona o download automático
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const concurso = data.numero || "resultado";
                const tempLink = document.createElement('a');
                tempLink.href = url;
                tempLink.download = `${lotteryName}_concurso_${concurso}.json`;
                document.body.appendChild(tempLink);
                tempLink.click();
                
                document.body.removeChild(tempLink);
                URL.revokeObjectURL(url);

                statusEl.style.color = '#28a745';
                statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Arquivo <b>${lotteryName}_concurso_${concurso}.json</b> baixado com sucesso!`;

            } catch (error) {
                console.error(error);
                statusEl.style.color = '#dc3545';
                statusEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Erro ao baixar ${lotteryName}. Verifique sua conexão.`;
            }
        });
    });
});