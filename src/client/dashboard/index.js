
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
            adicionarListeners();

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
            adicionarListeners();


        }
        else {
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
            adicionarListeners();

        }

    } catch (erro) {
        console.error("Erro ao buscar os dados:", erro);
    }
}


async function carregarSupervisores(canalSelecionado, supervisor, mes) {
    try {

        const mesSelect = document.querySelector("#mesSelect").value
        mes = mesSelect || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

        // Atualiza os valores dos selects
        canalSelecionado = document.querySelector('#canalSelect')?.value || canalSelecionado;
        supervisor = document.querySelector('#supervisorSelect')?.value || supervisor;

        const token = localStorage.getItem("auth-base-gestao");

        const response = await fetch(`api/operadores/supervisores?canal=${canalSelecionado}&mes=${mes}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        }); // Ajuste a URL conforme necessário


        const supervisores = await response.json();

        // Obtém o elemento <select>
        const select = document.getElementById('supervisorSelect');

        // Limpa o conteúdo atual do <select>
        select.innerHTML = "";

        // Adiciona a opção "Selecione um supervisor" como a primeira opção
        const selectOption = document.createElement('option');
        selectOption.value = ""; // Valor vazio
        selectOption.textContent = supervisor || "Selecione um supervisor"; // Texto do placeholder
        select.appendChild(selectOption);

        // Adiciona as opções dos supervisores
        supervisores.forEach(op => {
            const option = document.createElement('option');
            option.value = op.supervisor;
            option.textContent = op.supervisor;
            select.appendChild(option);
        });

        // Adiciona uma opção extra, por exemplo, "Todos os Supervisores"
        const allSupervisorsOption = document.createElement('option');
        allSupervisorsOption.value = "GERAL"; // Valor que representa todos os supervisores
        allSupervisorsOption.textContent = "GERAL"; // Texto da nova opção
        select.appendChild(allSupervisorsOption);


    } catch (error) {
        console.error('Erro ao carregar operadores:', error);
    }
}

async function buscarTabelaOperadorGeral(mes, canalSelecionado, supervisor) {
    try {
        mes = mes || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
        mesSelected = document.getElementById('mesSelect')
        mesSelected.value = mes
        canalSelecionado = document.querySelector('#canalSelect').value

        await atualizarTabela(canalSelecionado, mes, supervisor);
    } catch (error) {
        console.error(error);
    }
}
let quartisFixos = []; // Define quartisFixos in the global scope


async function atualizarTabela(canalSelecionado, mes, supervisor) {
    try {
        // Buscar os dados da API
        const dados = await fetchWithAuth(`${BASE_URL}/table?mes=${mes}&canal=${canalSelecionado}&supervisor=${supervisor}`, { method: "GET" });

        // Calcular os quartis com a fórmula fornecida
        const totalOperadores = dados.length;
        const baseTamanho = Math.floor(totalOperadores / 4); // Tamanho base para cada quartil
        const sobra = totalOperadores % 4; // Elementos que não se dividem igualmente

        // Inicializar os quartis
        const quartis = [];
        let inicio = 0;

        // Distribuir os operadores pelos quartis, adicionando 1 operador extra nos últimos "sobra" quartis
        for (let i = 0; i < 4; i++) {
            const tamanhoAtual = baseTamanho + (i >= (4 - sobra) ? 1 : 0);
            quartis.push(dados.slice(inicio, inicio + tamanhoAtual));
            inicio += tamanhoAtual;
        }

        // Atribuir os quartis aos dados iniciais
        quartisFixos = [];
        quartis.forEach((quartil, indiceQuartil) => {
            quartil.forEach((item) => {
                quartisFixos.push(`${indiceQuartil + 1}Q`); // Q1, Q2, Q3, Q4
            });
        });

        // Inicializar a tabela
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
                { field: 'matricula', title: 'Matrícula', sortable: true },
                { field: 'nome', title: 'Nome', sortable: true },
                { field: 'supervisor', title: 'Supervisor', sortable: true },
                {
                    field: 'csat',
                    title: 'CSAT',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    sorter: (a, b) => {
                        // Verificar se 'a' é um valor em branco
                        const isAEmpty = a === null || a === undefined || a === '' || a === ' ' || a === '-' || isNaN(a);
                        // Verificar se 'b' é um valor em branco
                        const isBEmpty = b === null || b === undefined || b === '' || b === ' ' || b === '-' || isNaN(b);

                        // Se 'a' for um valor em branco, ele deve ser considerado maior
                        if (isAEmpty) return 1;
                        // Se 'b' for um valor em branco, ele deve ser considerado maior
                        if (isBEmpty) return -1;
                        // Caso contrário, aplicar a ordenação numérica padrão
                        return a - b;
                    },
                    filterControl: 'select'
                },
                {
                    field: 'tma',
                    title: 'TMA',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    sorter: (a, b) => {
                        // Verificar se 'a' é um valor em branco
                        const isAEmpty = a === null || a === undefined || a === '' || a === ' ' || a === '-';
                        // Verificar se 'b' é um valor em branco
                        const isBEmpty = b === null || b === undefined || b === '' || b === ' ' || b === '-';

                        // Se 'a' for um valor em branco, ele deve ser considerado maior
                        if (isAEmpty) return -1;
                        // Se 'b' for um valor em branco, ele deve ser considerado maior
                        if (isBEmpty) return 1;

                    },
                    filterControl: 'select'
                },
                {
                    field: 'nota_qualidade',
                    title: 'Nota Qualidade',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    sorter: (a, b) => {
                        // Verificar se 'a' é um valor em branco
                        const isAEmpty = a === null || a === undefined || a === '' || a === ' ' || a === '-' || isNaN(a);
                        // Verificar se 'b' é um valor em branco
                        const isBEmpty = b === null || b === undefined || b === '' || b === ' ' || b === '-' || isNaN(b);

                        // Se 'a' for um valor em branco, ele deve ser considerado maior
                        if (isAEmpty) return 1;
                        // Se 'b' for um valor em branco, ele deve ser considerado maior
                        if (isBEmpty) return -1;
                        // Caso contrário, aplicar a ordenação numérica padrão
                        return a - b;
                    },
                    filterControl: 'select'
                },
                {
                    field: 'nota_venda',
                    title: 'Nota Venda',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    sorter: (a, b) => {
                        // Verificar se 'a' é um valor em branco
                        const isAEmpty = a === null || a === undefined || a === '' || a === ' ' || a === '-' || isNaN(a);
                        // Verificar se 'b' é um valor em branco
                        const isBEmpty = b === null || b === undefined || b === '' || b === ' ' || b === '-' || isNaN(b);

                        // Se 'a' for um valor em branco, ele deve ser considerado maior
                        if (isAEmpty) return 1;
                        // Se 'b' for um valor em branco, ele deve ser considerado maior
                        if (isBEmpty) return -1;
                        // Caso contrário, aplicar a ordenação numérica padrão
                        return a - b;
                    },
                    filterControl: 'select'
                },
                {
                    field: 'qtd_vendas',
                    title: 'Qtd Vendas',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    sorter: (a, b) => {
                        // Verificar se 'a' é um valor em branco
                        const isAEmpty = a === null || a === undefined || a === '' || a === ' ' || a === '-' || isNaN(a);
                        // Verificar se 'b' é um valor em branco
                        const isBEmpty = b === null || b === undefined || b === '' || b === ' ' || b === '-' || isNaN(b);

                        // Se 'a' for um valor em branco, ele deve ser considerado maior
                        if (isAEmpty) return 1;
                        // Se 'b' for um valor em branco, ele deve ser considerado maior
                        if (isBEmpty) return -1;
                        // Caso contrário, aplicar a ordenação numérica padrão
                        return a - b;
                    },
                    filterControl: 'select'
                },
                {
                    field: 'quartil',
                    title: 'Quartil',
                    sortable: false, // Não permitir ordenação por quartil
                    filterControl: 'select',
                    formatter: (value, row, index) => quartisFixos[index] // Usar os quartis fixos
                }
            ],
            filterControl: true
        });

    } catch (error) {
        console.error(error);
    }
}


function exportarParaExcel() {
    // Obter os dados da tabela renderizada (com filtros e ordenações aplicadas)
    const dadosTabela = $('#tabela-geral').bootstrapTable('getData', { useCurrentPage: false });

    // Obter as colunas da tabela
    const colunas = $('#tabela-geral').bootstrapTable('getOptions').columns[0];

    // Adicionar a coluna "quartil" aos dados da tabela
    const dadosComQuartil = dadosTabela.map((item, index) => {
        return {
            ...item, // Mantém todas as colunas originais
            quartil: quartisFixos[index] // Adiciona a coluna "quartil"
        };
    });

    // Mapear os dados para incluir apenas as colunas visíveis
    const dadosFormatados = dadosComQuartil.map((item) => {
        const novoItem = {};
        colunas.forEach((coluna) => {
            if (coluna.visible) { // Verificar se a coluna está visível
                novoItem[coluna.title] = item[coluna.field]; // Usar o título da coluna como cabeçalho
            }
        });
        return novoItem;
    });

    // Criar uma planilha
    const ws = XLSX.utils.json_to_sheet(dadosFormatados);

    // Criar um workbook e adicionar a planilha
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tabela Renderizada');

    // Gerar o arquivo Excel e iniciar o download
    XLSX.writeFile(wb, 'tabela_renderizada.xlsx');
}

// Remover todos os listeners anteriores do botão
const botaoExportar = document.getElementById('exportar-excel');
botaoExportar.removeEventListener('click', exportarParaExcel); // Remove o listener anterior (se existir)

// Adicionar o evento de clique apenas uma vez
botaoExportar.addEventListener('click', exportarParaExcel);
// Adicionar o evento de clique
document.getElementById('exportar-excel').addEventListener('click', exportarParaExcel);




async function buscarIndicadoresGeral(mes, canalSelecionado, supervisor) {
    try {
        mes = mes || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
        mesSelected = document.getElementById('mesSelect')
        canalSelecionado = document.querySelector('#canalSelect').value
        const indicadores = await fetchWithAuth(`${BASE_URL}?mes=${mes}&canal=${canalSelecionado}&supervisor=${supervisor}`, { method: "GET" });
        document.getElementById('tma').innerHTML = indicadores.tma.media;
        document.getElementById('csat').innerHTML = indicadores.csat.media;
        document.getElementById('nota_qualidade').innerHTML = indicadores.notaQualidade.media;
        document.getElementById('nota_vendas').innerHTML = indicadores.notaVenda.media;
        document.getElementById('soma_vendas').innerHTML = indicadores.somaVendas;
    } catch (error) {
        console.error(error);
    }
}

async function criarTabelaQuartil(mes, canalSelecionado, supervisor) {
    try {


        const mesSelect = document.querySelector("#mesSelect").value
        mes = mesSelect || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

        // Atualiza os valores dos selects
        canalSelecionado = document.querySelector('#canalSelect')?.value || canalSelecionado;
        supervisor = document.querySelector('#supervisorSelect')?.value || supervisor;

        const dados = await buscarIndicadoresPorQuartil(mes, canalSelecionado, supervisor);
        const tabelaBody = document.getElementById("tabela-quartil").querySelector("tbody") || document.createElement("tbody");
        tabelaBody.innerHTML = "";


        const quartis = ['primeiro', 'segundo', 'terceiro', 'quarto'];
        quartis.forEach((quartil, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td  class="quartil-numero" id="${obterClasseQuartil(index)}">${index + 1}Q</td>
                <td  id="${obterClasseQuartil(index)}">${dados[1].csat?.[quartil]?.media ?? '-'}</td>
                <td id="${obterClasseQuartil(index)}">${dados[0].tma?.[quartil]?.media ?? '-'}</td>
                <td id="${obterClasseQuartil(index)}">${dados[2].notaQualidade?.[quartil]?.media ?? '-'}</td>
                <td id="${obterClasseQuartil(index)}">${dados[3].notaQualidadeVendas?.[quartil]?.media ?? '-'}</td>
                <td " id="${obterClasseQuartil(index)}">${dados[4].qtdVendas?.[quartil]?.soma ?? '-'}</td>
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

async function buscarIndicadoresPorQuartil(mes, canalSelecionado, supervisor) {

    const mesSelect = document.querySelector("#mesSelect").value
    mes = mesSelect || new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

    // Atualiza os valores dos selects
    canalSelecionado = document.querySelector('#canalSelect')?.value || canalSelecionado;
    supervisor = document.querySelector('#supervisorSelect')?.value || supervisor;

    const urls = [
        `${BASE_URL}/quartil-tma?mes=${mes}&canal=${canalSelecionado}&supervisor=${supervisor}`,
        `${BASE_URL}/quartil-csat?mes=${mes}&canal=${canalSelecionado}&supervisor=${supervisor}`,
        `${BASE_URL}/quartil-monitoria?mes=${mes}&canal=${canalSelecionado}&supervisor=${supervisor}`,
        `${BASE_URL}/quartil-monitoria-vendas?mes=${mes}&canal=${canalSelecionado}&supervisor=${supervisor}`,
        `${BASE_URL}/quartil-vendas?mes=${mes}&canal=${canalSelecionado}&supervisor=${supervisor}`
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


// Função para adicionar os listeners
function adicionarListeners() {
    document.querySelectorAll("#mesSelect, #supervisorSelect, #canalSelect").forEach(element => {
        element.addEventListener("change", async function () {

            const mes = document.querySelector('#mesSelect').value.toUpperCase();
            const canal = document.querySelector('#canalSelect').value || "";
            const supervisor = document.querySelector("#supervisorSelect").value || "";


            await carregarSupervisores(canal, supervisor)
            await buscarTabelaOperadorGeral(mes, canal, supervisor);
            await buscarIndicadoresGeral(mes, canal, supervisor);
            await criarTabelaQuartil(mes, canal, supervisor);
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await carregarDadosUserLogado();
    await buscarTabelaOperadorGeral();
    await criarTabelaQuartil();
    await buscarIndicadoresGeral();
    await buscarIndicadoresPorQuartil();
    await carregarSupervisores()
});