const BASE_URL = 'api/indicadores';
const AUTH_TOKEN = localStorage.getItem("auth-base-gestao");
    const autorizados = [
        'COORDENADOR MIS SR',
        'COORDENADOR DE QUALIDADE E PROCESSOS',
        'COORDENADOR DE QUALIDADE',
        'COORDENADOR DE QUALIDADE SR',
        'ANALISTA DE MIS I',
        'ANALISTA DE MIS SR',
        'COORDENADOR DE OPERACOES',
        'SUPERVISOR(A) DE QUALIDADE - INTERINO',
        'SUPERVISOR(A) DE QUALIDADE',
        'SUPERVISOR(A) DE MONITORIA',
        'COORDENADOR DE PLANEJAMENTO',
        'GERENTE DE QUALIDADE',
        'GERENTE GERAL'
    ];
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
        document.getElementById("nome_logado_2").innerHTML = dados.dados.NOME.split(' ')[1] || "";
        document.getElementById("funcao_logado").innerHTML = dados.dados.FUNCAO;

        if (autorizados.includes(dados.dados.FUNCAO)) {

            const container = document.getElementById("filtroCanal"); // Elemento onde você quer adicionar os filtros

            if (container) {
                container.insertAdjacentHTML("beforeend", `
                <div">
                    <h6 class="card-title">Canal</h6>
                    <select class="form-select" name="canal" id="canalSelect">
                        <option value="CHAT" selected>CHAT</option>
                        <option value="VOZ">VOZ</option>
                    </select>
                </div>
            `);
            }
            const container2 = document.getElementById("filtroSupervisor"); // Elemento onde você quer adicionar os filtros

            if (container2) {
                container2.insertAdjacentHTML("beforeend", `
                    <div>
                        <label for="supervisorSelect" class="me-2 card-title">Supervisor:</label>
                        <select id= supervisorSelect class="form-select" aria-label="Default select example">
                        <option  selected></option>
                        </select>
                    </div>

            `);
            }

        }
        else{
            const container3 = document.getElementById("filtroEquipe"); // Elemento onde você quer adicionar os filtros

            if (container3) {
                container3.insertAdjacentHTML("beforeend", `
                <div">
                    <h6 class="card-title">Resultado</h6>
                    <select class="form-select" name="canal" id="canalSelect">
                        <option value="equipe" selected>EQUIPE</option>
                        <option value="geral">GERAL</option>
                    </select>
                </div>
            `);
            }
        }

    } catch (erro) {
        console.error("Erro ao buscar os dados:", erro);
    }
}


async function carregarSupervisores(canal) {
    try {

        const token = localStorage.getItem("auth-base-gestao");



        const response = await fetch(`api/operadores/supervisores/${canal}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        }); // Ajuste a URL conforme necessário


        const supervisores = await response.json();
        console.log(supervisores)

        const select = document.getElementById('supervisorSelect');
        supervisores.forEach(op => {
            const option = document.createElement('option');
            option.value = op.supervisor;
            option.textContent = op.supervisor;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar operadores:', error);
    }
}

async function buscarTabelaOperadorGeral(mes = null) {
    try {
        mes = mes || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
        mesSelected = document.getElementById('mesSelect')
        mesSelected.value = mes

        // Pega o valor atual do canal a partir do select
        let canalSelecionado = document.querySelector('#canalSelect')?.value;

        // Adiciona listener para atualizar dinamicamente quando o canal for alterado
        const canalSelect = document.getElementById('canalSelect');
        if (canalSelect) {
            canalSelect.addEventListener('change', async (event) => {
                const novoCanal = event.target.value;
                // Chama as funções com o novo valor de canal e o mesmo mês
                await atualizarTabela(novoCanal, mes);
                await buscarIndicadoresGeral(mes, novoCanal);
                await buscarIndicadoresPorQuartil(mes, novoCanal);
                await criarTabelaQuartil(mes, novoCanal);
                await carregarSupervisores(novoCanal)
            });
        }



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
        canalSelecionado = canalSelecionado || document.querySelector('#canalSelect').value;

        const indicadores = await fetchWithAuth(`${BASE_URL}/${mes}/${canalSelecionado}`, { method: "GET" });
        console.log(indicadores)

        document.getElementById('tma').innerHTML = indicadores.tma.media;
        document.getElementById('csat').innerHTML = indicadores.csat.media;
        document.getElementById('nota_qualidade').innerHTML = indicadores.notaQualidade.media;
        document.getElementById('nota_vendas').innerHTML = indicadores.notaVenda.media;
        document.getElementById('soma_vendas').innerHTML = indicadores.somaVendas.soma;
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
    canalSelecionado = canalSelecionado || document.querySelector('#canalSelect').value;

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

document.getElementById("mesSelect").addEventListener("change", function () {
    const mes = this.value.toUpperCase(); // Obtém o valor do select e converte para maiúsculas
    buscarTabelaOperadorGeral(mes);
    buscarIndicadoresGeral(mes);
    buscarIndicadoresPorQuartil(mes);
    criarTabelaQuartil(mes);
});


document.addEventListener("DOMContentLoaded", async () => {
    await carregarDadosUserLogado();
    await criarTabelaQuartil();
    await buscarTabelaOperadorGeral();
    await buscarIndicadoresGeral();
    await buscarIndicadoresPorQuartil();
    await carregarSupervisores()
});