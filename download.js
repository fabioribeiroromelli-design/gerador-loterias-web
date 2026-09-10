document.addEventListener('DOMContentLoaded', () => {
    const btnDownload = document.getElementById('btn_start_download');
    const selectType = document.getElementById('select_download_type');
    const statusEl = document.getElementById('download_status');

    if (!btnDownload) return;

    btnDownload.addEventListener('click', async () => {
        // Garante que o nome da loteria vá em minúsculas para a API
        const lottery = selectType ? selectType.value.toLowerCase() : 'megasena';
        
        if (statusEl) {
            statusEl.style.color = '#007bff';
            statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando e atualizando no Firebase...';
        }

        try {
            let data = null;

            // 1. Tenta buscar na API auxiliar (Evita problemas severos de CORS no browser)
            try {
                const resAlt = await fetch(`https://api.guidi.dev.br/loteria/${lottery}/ultimo`);
                if (resAlt.ok) {
                    data = await resAlt.json();
                }
            } catch (e) {
                console.warn("API auxiliar indisponível, tentando API oficial...");
            }

            // 2. Se falhar, tenta a API oficial da Caixa
            if (!data) {
                try {
                    const res = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/${lottery}`);
                    if (res.ok) {
                        data = await res.json();
                    }
                } catch (e) {
                    console.warn("API Caixa indisponível via CORS.");
                }
            }

            if (!data) {
                throw new Error("Não foi possível obter os dados da loteria em nenhuma das fontes.");
            }

            // Padroniza a extração do número do concurso dependendo da API que respondeu
            const concurso = String(data.numero || data.concurso || data.darrelo);
            
            if (!concurso || concurso === "undefined") {
                throw new Error("Número do concurso não identificado no retorno da API.");
            }
            
            // Salva diretamente no Firestore (Certifique-se de que 'db' está declarado globalmente)
            if (typeof db !== 'undefined') {
                await db.collection('loterias').doc(lottery).collection('concursos').doc(concurso).set(data, { merge: true });
            } else {
                throw new Error("Instância do Firestore ('db') não encontrada.");
            }

            if (statusEl) {
                statusEl.style.color = '#28a745';
                statusEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> Concurso ${concurso} atualizado no Firebase com sucesso!`;
            }

            // Atualiza a tabela na tela se a função existir
            if (typeof carregarDadosFirebase === 'function') {
                carregarDadosFirebase(lottery);
            }

        }Congressos catch (err) {
            console.error(err);
            if (statusEl) {
                statusEl.style.color = '#dc3545';
                statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Erro ao atualizar os dados.';
            }
        }
    });
});