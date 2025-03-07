
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
            adicionarListenersSupervisor()

        }

    } catch (erro) {
        console.error("Erro ao buscar os dados:", erro);
    }
}



async function carregarSupervisores(canalSelecionado, supervisor, mes) {
    try {

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


        // Obter o classificador selecionado
        const classificador = document.querySelector('#classificadorSelect').value;


        // Atualiza os valores dos selects
        canalSelecionado = document.getElementById('canalSelect')?.value || canalSelecionado;
        supervisor = document.getElementById('supervisorSelect')?.value || supervisor;
        console.log(canalSelecionado)


        // Atualizar a tabela com os parâmetros
        await atualizarTabela(canalSelecionado, mes, supervisor, classificador);

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}


async function atualizarTabela(canalSelecionado, mes, supervisor, classificador) {

console.log(canalSelecionado)
    try {
        // Buscar os dados da API com o classificador
        const dados = await fetchWithAuth(
            `${BASE_URL}/table?mes=${mes}&canal=${canalSelecionado}&supervisor=${supervisor}&classificadoPor=${classificador}`,
            { method: "GET" }
        );

        // Processar os dados da API
        const dadosProcessados = [];
        dados.forEach((quartil, indiceQuartil) => {
            quartil.forEach((operador) => {
                // Adicionar a classificação (quartil) ao operador
                operador.quartil = `${indiceQuartil + 1}Q`; // 1Q, 2Q, 3Q, 4Q
                dadosProcessados.push(operador);
            });
        });

        // Inicializar a tabela
        $('#tabela-geral').bootstrapTable('destroy').bootstrapTable({
            data: dadosProcessados, // Usar os dados processados
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
                    filterControl: 'select'
                },
                {
                    field: 'tma',
                    title: 'TMA',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    filterControl: 'select'
                },
                {
                    field: 'nota_qualidade',
                    title: 'Nota Qualidade',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    filterControl: 'select'
                },
                {
                    field: 'nota_venda',
                    title: 'Nota Venda',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    filterControl: 'select'
                },
                {
                    field: 'qtd_vendas',
                    title: 'Qtd Vendas',
                    formatter: (value) => value ?? '',
                    sortable: true,
                    filterControl: 'select'
                },
                {
                    field: 'quartil',
                    title: 'Quartil',
                    sortable: true,
                    filterControl: 'select',
                    formatter: (value) => value
                }
            ],
            filterControl: true
        });

    } catch (error) {
        console.error("Erro ao atualizar a tabela:", error);
    }
}

function exportarParaExcel() {
    // Obter os dados da tabela renderizada (com filtros e ordenações aplicadas)
    const dadosTabela = $('#tabela-geral').bootstrapTable('getData', { useCurrentPage: false });

    // Obter as colunas da tabela
    const colunas = $('#tabela-geral').bootstrapTable('getOptions').columns[0];



    // Mapear os dados para incluir apenas as colunas visíveis
    const dadosFormatados = dadosTabela.map((item) => {
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

        // Atualiza os valores dos selects
        canalSelecionado = document.querySelector('#canalSelect')?.value || canalSelecionado;
        supervisor = document.querySelector('#supervisorSelect')?.value || supervisor;

        const dados = await buscarIndicadoresPorQuartil(mes, canalSelecionado, supervisor);
        const tabelaBody = document.getElementById("tabela-quartil").querySelector("tbody") || document.createElement("tbody");
        tabelaBody.innerHTML = "";


        const quartis = ['primeiro', 'segundo', 'terceiro', 'quarto'];
        quartis.forEach((quartil, index) => {
            const row = document.createElement("tr");
        
            // Função para verificar e substituir valores null por ' '
            const verificarValor = (valor) => (valor === null ? ' ' : valor);
        
            row.innerHTML = `
                <td class="quartil-numero" id="${obterClasseQuartil(index)}">${index + 1}Q</td>
                <td id="${obterClasseQuartil(index)}">${verificarValor(dados[1].csat?.[quartil]?.media)}</td>
                <td id="${obterClasseQuartil(index)}">${verificarValor(dados[0].tma?.[quartil]?.media)}</td>
                <td id="${obterClasseQuartil(index)}">${verificarValor(dados[2].notaQualidade?.[quartil]?.media)}</td>
                <td id="${obterClasseQuartil(index)}">${verificarValor(dados[3].notaQualidadeVendas?.[quartil]?.media)}</td>
                <td id="${obterClasseQuartil(index)}">${verificarValor(dados[4].qtdVendas?.[quartil]?.soma)}</td>
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


async function criarTabelaIndicadores(mes, canalSelecionado) {
    try {
        canalSelecionado = document.querySelector('#canalSelect')?.value || canalSelecionado;

        const dados = await buscarIndicadoresPorQuartilSupervisor(mes, canalSelecionado);

        const quartis = ['1Q', '2Q', '3Q', '4Q'];
        const indicadores = ['tma', 'csat', 'nota_qualidade', 'nota_venda', 'qtd_vendas'];

        const tabelas = {
            tma: document.getElementById("tabela-tma").querySelector("tbody"),
            csat: document.getElementById("tabela-csat").querySelector("tbody"),
            nota_qualidade: document.getElementById("tabela-qualidade").querySelector("tbody"),
            nota_venda: document.getElementById("tabela-qualidade-vendas").querySelector("tbody"),
            qtd_vendas: document.getElementById("tabela-vendas").querySelector("tbody"),
        };

        // Limpar tabelas antes de inserir novos dados
        Object.values(tabelas).forEach(tabela => tabela.innerHTML = "");

        for (let i = 0; i < 4; i++) { // Itera sobre os quartis (0 a 3)
            indicadores.forEach((indicador, index) => {
                const tabelaBody = tabelas[indicador];
                if (!tabelaBody) return;

                const row = document.createElement("tr");

                let supervisores = [];
                let valores = [];

                // Obtém os dados do indicador correspondente (baseado no índice)
                const conjuntoDados = dados[index];

                if (conjuntoDados[i]) { // Verifica se há dados no quartil
                    conjuntoDados[i].forEach(dado => {
                        supervisores.push(dado.supervisor || "Desconhecido");

                        let valor = dado[`media_${indicador}`];

                        if (valor !== undefined) {
                            if (indicador === 'qtd_vendas' && typeof valor === "number") {
                                // Formatar quantidade de vendas com 0 casas decimais
                                valores.push(valor.toFixed(0));
                            } else {
                                // Formatar outros valores numéricos com 2 casas decimais
                                valores.push(typeof valor === "number" ? valor.toFixed(2) : valor);
                            }
                        } else {
                            valores.push("N/A");
                        }

                    });
                }

                row.innerHTML = `
                    <td class="quartil-numero">${quartis[i]}</td>
                    <td>${supervisores.length > 0 ? supervisores.join('<br/>') : '-'}</td>
                    <td>${valores.length > 0 ? valores.join('<br/>') : '-'}</td>
                `;
                tabelaBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Erro ao criar tabelas de indicadores:", error);
    }
}


async function buscarIndicadoresPorQuartilSupervisor(mes, canalSelecionado) {
    // Atualiza os valores dos selects
    canalSelecionado = document.querySelector('#canalSelect')?.value || canalSelecionado;

    const urls = [
        `${BASE_URL}/table/supervisores?mes=${mes}&canal=${canalSelecionado}&classificadoPor=${'tma'}`,
        `${BASE_URL}/table/supervisores?mes=${mes}&canal=${canalSelecionado}&classificadoPor=${'csat'}`,
        `${BASE_URL}/table/supervisores?mes=${mes}&canal=${canalSelecionado}&classificadoPor=${'nota_qualidade'}`,
        `${BASE_URL}/table/supervisores?mes=${mes}&canal=${canalSelecionado}&classificadoPor=${'nota_venda'}`,
        `${BASE_URL}/table/supervisores?mes=${mes}&canal=${canalSelecionado}&classificadoPor=${'qtd_vendas'}`,
    ];

    try {
        const respostas = await Promise.all(urls.map(url => fetchWithAuth(url, { method: "GET" })));

        return [
            respostas[0], // TMA
            respostas[1], // CSAT
            respostas[2], // Nota Qualidade
            respostas[3], // Nota Qualidade Vendas
            respostas[4]  // Quantidade Vendas
        ];
    } catch (error) {
        console.error("Erro ao buscar indicadores:", error);
        throw error;
    }
}

function obterClasseQuartil(index) {
    const classes = ["quartil-verde", "quartil-amarelo", "quartil-laranja", "quartil-vermelho"];
    return classes[index] || "";
}




function logout() {
    localStorage.removeItem("auth-base-gestao");
    window.location.href = "/login";
}
var isAnyTableVisible = false

async function toggleAllTables() {
    const tables = document.querySelectorAll('.table-container');
    const button = document.querySelector('.btn-primary');

    
    // Verifica o estado atual da primeira tabela para alternar   
     tables.forEach(table => {
        if (isAnyTableVisible) {
            table.style.display = "none";  // Esconde todas as tabelas
        } else {
            table.style.display = "block"; // Mostra todas as tabelas
        }
    });
    
    // Altera o texto do botão dependendo do estado das tabelas
    if (isAnyTableVisible) {
        button.textContent = "Abrir Todas as Tabelas";
         isAnyTableVisible = false

    } else {
        button.textContent = "Fechar Todas as Tabelas";
         isAnyTableVisible = true

    }
}


let supervisorSelecionado;
let mesSelecionado = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();

if(mesSelecionado === 'MARÇO'){
    mesSelecionado = 'MARCO'
}


// Função para adicionar os listeners
function adicionarListeners() {
    document.querySelectorAll("#mesSelect, #supervisorSelect, #canalSelect").forEach(element => {
        element.addEventListener("change", async function () {
            const mes = document.querySelector('#mesSelect').value.toUpperCase();
            const canal = document.querySelector('#canalSelect').value || "";
            const supervisor = document.querySelector("#supervisorSelect").value || "";
            supervisorSelecionado = supervisor
            mesSelecionado = mes
            await carregarSupervisores(canal, supervisor, mesSelecionado)
            await buscarTabelaOperadorGeral(mesSelecionado, canal, supervisor);
            await buscarIndicadoresGeral(mesSelecionado, canal, supervisor);
            await criarTabelaQuartil(mesSelecionado, canal, supervisor);
            await criarTabelaIndicadores(mesSelecionado, canal)

        });
    });
}
function adicionarListenersSupervisor() {
    document.querySelectorAll("#mesSelect, #supervisorSelect, #canalSelect").forEach(element => {
        element.addEventListener("change", async function () {
            
            const mes = document.querySelector('#mesSelect').value.toUpperCase();
            mesSelecionado = mes
            const canal = document.querySelector('#canalSelect').value || "";

            await buscarTabelaOperadorGeral(mesSelecionado, canal);
            await buscarIndicadoresGeral(mesSelecionado, canal);
            await criarTabelaQuartil(mesSelecionado, canal);
            await criarTabelaIndicadores(mesSelecionado, canal)

        });
    });
}
document.querySelector("#classificadorSelect").addEventListener("change", async function () {
    const canal = document.querySelector('#canalSelect').value || "";
    await buscarTabelaOperadorGeral(mesSelecionado, canal, supervisorSelecionado);

});



document.addEventListener("DOMContentLoaded", async () => {
    const selectMes = document.getElementById('mesSelect');

    // Percorre as opções e seleciona a que corresponde ao mês atual
    for (const option of selectMes.options) {
        if (option.text.toUpperCase() === mesSelecionado) {
            option.selected = true;
            break;
        }
    }

    await carregarDadosUserLogado();
    await buscarTabelaOperadorGeral(mesSelecionado);
    await criarTabelaQuartil();
    await criarTabelaIndicadores();
    await buscarIndicadoresGeral();
    await buscarIndicadoresPorQuartil();
});
console.log(mesSelecionado)