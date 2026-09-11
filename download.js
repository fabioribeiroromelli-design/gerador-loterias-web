document.addEventListener('DOMContentLoaded', () => {
    const btnDownload = document.getElementById('btn_start_download');
    const selectType = document.getElementById('select_download_type');
    const statusEl = document.getElementById('download_status');

    if (!btnDownload) return;

    btnDownload.addEventListener('click', async () => {
        const lottery = selectType ? selectType.value.toLowerCase() : 'megasena';

        if (statusEl) {
            statusEl.style.color = '#007bff';
            statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando e atualizando no Firebase...';
        }

        try {
            let data = null;

            // 1. Tenta buscar na API auxiliar (Evita CORS)
            try {
                const resAlt = await fetch(`https://api.guidi.dev.br/loteria/${lottery}/ultimo`);
                if (resAlt.ok) {
                    data = await resAlt.json();
                }
            } catch (e) {
                console.warn("API auxiliar indisponível, tentando API oficial...");
            }

            // 2. Tenta a API oficial da Caixa como fallback
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

            const concurso = String(data.numero || data.concurso || data.darrelo);

            if (!concurso || concurso === "undefined") {
                throw new Error("Número do concurso não identificado no retorno da API.");
            }

            // 3. Atualiza no Firestore mantendo a estrutura historico_loterias/{loteria}
            if (typeof db !== 'undefined' && window.arrayUnion && window.doc && window.setDoc) {
                const docRef = window.doc(db, 'historico_loterias', lottery);
                
                // Salva o novo concurso dentro da array 'concursos' do documento
                await window.setDoc(docRef, {
                    concursos: window.arrayUnion(data),
                    ultimaAtualizacao: new Date().toISOString()
                }, { merge: true });
            } else {
                throw new Error("Instância do Firestore ou métodos auxiliares não encontrados.");
            }

            if (statusEl) {
                statusEl.style.color = '#28a745';
                statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Concurso ${concurso} atualizado no Firebase com sucesso!`;
            }

            // Atualiza a visualização na tela
            if (typeof window.carregarLoteria === 'function') {
                window.carregarLoteria(lottery);
            }

        } catch (err) {
            console.error(err);
            if (statusEl) {
                statusEl.style.color = '#dc3545';
                statusEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Erro: ${err.message}`;
            }
        }
    });
});
