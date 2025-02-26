const BASE_URL = 'dashboard';
const AUTH_TOKEN = localStorage.getItem("auth-base-gestao");

async function fetchWithAuth(url, options = {}) {
    if (!AUTH_TOKEN) {
        Swal.fire({
            icon: 'warning',
            title: 'Sessão expirada',
            text: 'Token expirado, faça o login novamente',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/login';
        });
        throw new Error("Token não encontrado");
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            "Authorization": `Bearer: ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`Erro ao carregar os dados: ${response.statusText}`);
    }

    return response.json();
}

async function carregarDadosUserLogado() {
    try {
        const dados = await fetchWithAuth("auth/token", { method: 'GET' });

        document.getElementById("nome_logado").innerHTML = dados.dados.NOME;
        document.getElementById("nome_logado_2").innerHTML = dados.dados.NOME.split(' ')[1];
        document.getElementById("funcao_logado").innerHTML = dados.dados.FUNCAO;
    } catch (erro) {
        console.error("Erro ao buscar os dados:", erro);
    }
}

async function buscarTabelaOperadorGeral(mes = null) {
    try {
        mes = mes || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
        document.getElementById('mes_selected').innerHTML = mes;

        const canalSelecionado = document.querySelector('input[name="canal"]:checked').value;

        // Adiciona listener para atualizar dinamicamente quando o canal é alterado
        document.querySelectorAll('input[name="canal"]').forEach(radio => {
            radio.addEventListener('change', async (event) => {
                const novoCanal = event.target.value;
                await atualizarTabela(novoCanal, mes);
                await buscarIndicadoresGeral(mes, novoCanal);
                await buscarIndicadoresPorQuartil(mes, novoCanal);
                await criarTabelaQuartil(mes, novoCanal);
            });
        });

        await atualizarTabela(canalSelecionado, mes);
    } catch (error) {
        console.error(error);
    }
}

async function atualizarTabela(canalSelecionado, mes) {
    try {
        const dados = await fetchWithAuth(`${BASE_URL}/table/${mes}/${canalSelecionado}`, { method: "GET" });

        $('#tabela-geral').bootstrapTable('destroy').bootstrapTable({
            data: dados,
            pagination: true,
            pageSize: 10,
            searchAlign: 'left',
            search: true,
            formatLoadingMessage: () => "Carregando...",
            formatRecordsPerPage: (pageNumber) => `${pageNumber} Registros por página`,
            formatShowingRows: (pageFrom, pageTo, totalRows) => `Exibindo ${pageFrom} a ${pageTo} de ${totalRows} registros`,
            formatSearch: () => "Buscar",
            formatNoMatches: () => "Nenhum registro encontrado",
            formatPaginationSwitch: () => "Ocultar/Mostrar paginação",
            formatRefresh: () => "Atualizar",
            formatToggle: () => "Alternar exibição",
            formatColumns: () => "Colunas",
            formatAllRows: () => "Todos",
            paginationVAlign: 'top',
            columns: [
                { field: 'matricula', title: 'Matrícula' },
                { field: 'nome', title: 'Nome' },
                { field: 'csat', title: 'CSAT', formatter: (value) => value ?? '-' },
                { field: 'tma', title: 'TMA', formatter: (value) => value ?? '-' },
                { field: 'nota_qualidade', title: 'Nota Qualidade', formatter: (value) => value ?? '-' },
                { field: 'nota_venda', title: 'Nota Venda', formatter: (value) => value ?? '-' },
                { field: 'qtd_vendas', title: 'Qtd Vendas', formatter: (value) => value ?? '-' }
            ]
        });
    } catch (error) {
        console.error(error);
    }
}

async function buscarIndicadoresGeral(mes = null, canalSelecionado = null) {
    try {
        mes = mes || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
        canalSelecionado = canalSelecionado || document.querySelector('input[name="canal"]:checked').value;

        const indicadores = await fetchWithAuth(`${BASE_URL}/indicadores-geral/${mes}/${canalSelecionado}`, { method: "GET" });

        document.getElementById('tma').innerHTML = indicadores.data.tma.media;
        document.getElementById('csat').innerHTML = indicadores.data.csat.media;
        document.getElementById('nota_qualidade').innerHTML = indicadores.data.notaQualidade.media;
        document.getElementById('nota_vendas').innerHTML = indicadores.data.notaVenda.media;
        document.getElementById('soma_vendas').innerHTML = indicadores.data.somaVendas.soma;
    } catch (error) {
        console.error(error);
    }
}

async function criarTabelaQuartil(mes = null, canalSelecionado = null) {
    try {
        const dados = await buscarIndicadoresPorQuartil(mes, canalSelecionado);
        const tabelaBody = document.getElementById("tabela-quartil").querySelector("tbody") || document.createElement("tbody");
        tabelaBody.innerHTML = "";

        const quartis = ['primeiro', 'segundo', 'terceiro', 'quarto'];
        quartis.forEach((quartil, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="quartil-numero" id="${obterClasseQuartil(index)}">${index + 1}Q</td>
                <td id="${obterClasseQuartil(index)}">${dados[1].csat?.[quartil]?.media ?? '-'}</td>
                <td id="${obterClasseQuartil(index)}">${dados[0].tma?.[quartil]?.media ?? '-'}</td>
                <td id="${obterClasseQuartil(index)}">${dados[2].notaQualidade?.[quartil]?.media ?? '-'}</td>
                <td id="${obterClasseQuartil(index)}">${dados[3].notaQualidadeVendas?.[quartil]?.media ?? '-'}</td>
                <td id="${obterClasseQuartil(index)}">${dados[4].qtdVendas?.[quartil]?.soma ?? '-'}</td>
            `;
            tabelaBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro:", error);
    }
}

function obterClasseQuartil(index) {
    const classes = ["quartil-verde", "quartil-amarelo", "quartil-laranja", "quartil-vermelho"];
    return classes[index] || "";
}

async function buscarIndicadoresPorQuartil(mes = null, canalSelecionado = null) {
    mes = mes || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
    canalSelecionado = canalSelecionado || document.querySelector('input[name="canal"]:checked').value;

    const urls = [
        `${BASE_URL}/quartil-tma/${mes}/${canalSelecionado}`,
        `${BASE_URL}/quartil-csat/${mes}/${canalSelecionado}`,
        `${BASE_URL}/quartil-monitoria/${mes}/${canalSelecionado}`,
        `${BASE_URL}/quartil-monitoria-vendas/${mes}/${canalSelecionado}`,
        `${BASE_URL}/quartil-vendas/${mes}/${canalSelecionado}`
    ];

    try {
        const respostas = await Promise.all(urls.map(url => fetchWithAuth(url, { method: "GET" })));
        return [
            { tma: respostas[0] },
            { csat: respostas[1] },
            { notaQualidade: respostas[2] },
            { notaQualidadeVendas: respostas[3] },
            { qtdVendas: respostas[4] }
        ];
    } catch (error) {
        console.error("Erro ao buscar indicadores:", error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem("auth-base-gestao");
    window.location.href = "/login";
}

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (event) => {
        const mes = event.target.getAttribute('data-mes').toUpperCase();
        buscarTabelaOperadorGeral(mes);
        buscarIndicadoresGeral(mes);
        buscarIndicadoresPorQuartil(mes);
        criarTabelaQuartil(mes);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosUserLogado();
    criarTabelaQuartil();
    buscarTabelaOperadorGeral();
    buscarIndicadoresGeral();
    buscarIndicadoresPorQuartil();
});