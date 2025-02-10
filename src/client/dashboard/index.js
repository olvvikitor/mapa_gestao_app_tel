
async function carregarDadosUserLogado() {
    try {

        const token = localStorage.getItem("auth-base-gestao");

        // if(!token){
        //     window.alert('Token expirado, faça o login novamente')
        //     window.location.href='/login'
        // }

        const resposta = await fetch("auth/token", {
            method: 'GET',
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!resposta.ok) {
            throw new Error("Erro ao carregar os dados.");
        }

        const dados = await resposta.json();
        let a = 'abc';

        // Seleciona o elemento onde os dados serão inseridos
        const nomeLogado = document.getElementById("nome_logado");
        nomeLogado.innerHTML = dados.dados.NOME; // Limpa o conteúdo antes de adicionar novos dados
        const nomeLogado2 = document.getElementById("nome_logado_2")
        nomeLogado2.innerHTML = dados.dados.NOME.split(' ')[1]
        const funcao = document.getElementById("funcao_logado")
        funcao.innerHTML = dados.dados.FUNCAO

    } catch (erro) {
        console.error("Erro ao buscar os dados:", erro);
    }
}


async function buscarTabelaOperadorGeral(mes) {
    try {

        if (mes === null) {
            const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase(); // Mês atual em português
            mes = mesAtual;
        }

        const mesSelecionadoHtmlInner = document.getElementById('mes_selected')
        mesSelecionadoHtmlInner.innerHTML = mes
        

        const token = localStorage.getItem("auth-base-gestao");
        const url = `dashboard/table/${mes}`
        

        const tabelaGeral = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        })
        if (!tabelaGeral.ok) {
            throw new Error("Erro ao carregar tabela geral")
        }
        const dados = await tabelaGeral.json();

        $('#tabela-geral').bootstrapTable('destroy'); // Remove qualquer inicialização anterior

        $('#tabela-geral').bootstrapTable({
            data: dados,
            pagination: true,
            pageSize: 10,
            searchAlign: 'left',
            search: true,
            formatLoadingMessage: function () {
                return "Carregando...";
            },
            formatRecordsPerPage: function (pageNumber) {
                return `${pageNumber} Registros por página`;
            },
            formatShowingRows: function (pageFrom, pageTo, totalRows) {
                return `Exibindo ${pageFrom} a ${pageTo} de ${totalRows} registros`;
            },
            formatSearch: function () {
                return "Buscar";
            },
            formatNoMatches: function () {
                return "Nenhum registro encontrado";
            },
            formatPaginationSwitch: function () {
                return "Ocultar/Mostrar paginação";
            },
            formatRefresh: function () {
                return "Atualizar";
            },
            formatToggle: function () {
                return "Alternar exibição";
            },
            formatColumns: function () {
                return "Colunas";
            },
            formatAllRows: function () {
                return "Todos";
            },
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
        console.log(error)
    }
}
async function buscarIndicadoresGeral(mes) {
    try {
        const token = localStorage.getItem("auth-base-gestao")

        if (mes === null) {
            const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase(); // Mês atual em português
            mes = mesAtual;
        }

        const url = mes ? `dashboard/indicadores-geral/${mes}` : 'dashboard/indicadores-geral/';

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        })
        if (!response.ok) {
            throw new Error("Erro ao carregar tabela geral")
        }
        const indicadores = await response.json()
        console.log(indicadores)

        const tma = document.getElementById('tma')
        tma.innerHTML = indicadores.data.tma.media

        const csat = document.getElementById('csat')
        csat.innerHTML = indicadores.data.csat.media

        const notaQualidade = document.getElementById('nota_qualidade')
        notaQualidade.innerHTML = indicadores.data.notaQualidade.media

        const notaQualidadeVendas = document.getElementById('nota_vendas')
        notaQualidadeVendas.innerHTML = indicadores.data.notaVenda.media

        const somaVenda = document.getElementById('soma_vendas')
        somaVenda.innerHTML = indicadores.data.somaVendas.soma



    } catch (error) {
        console.log(error)
    }

}
async function criarTabelaQuartil(mes) {
    try {
        const dados = await buscarIndicadoresPorQuartil(mes);
        console.log(dados);

        const tabela = document.getElementById("tabela-quartil");

        // Criando o corpo da tabela se ainda não existir
        let tabelaBody = tabela.querySelector("tbody");
        if (!tabelaBody) {
            tabelaBody = document.createElement("tbody");
            tabela.appendChild(tabelaBody);
        }

        tabelaBody.innerHTML = ""; // Limpa a tabela antes de preencher

        function obterClasseQuartil(index) {
            console.log(index)
            switch (index) {
                case 0: return "quartil-verde";   // Primeiro quartil - verde
                case 1: return "quartil-amarelo"; // Segundo quartil - amarelo
                case 2: return "quartil-laranja"; // Terceiro quartil - laranja
                case 3: return "quartil-vermelho"; // Quarto quartil - vermelho
                default: return "";
            }
        }

        // Loop para preencher a tabela com dados dos quartis
        const quartis = ['primeiro', 'segundo', 'terceiro', 'quarto'];
        quartis.forEach((quartil, index) => {
            const row = document.createElement("tr");

            // Preenchendo a coluna Quartil
            row.innerHTML = `<td class="quartil-numero" id="${obterClasseQuartil(index)}">${index + 1}Q</td>`;

            row.innerHTML += `
            <td id="${obterClasseQuartil(index)}" >${dados[1].csat?.[quartil]?.media ?? '-'}</td>
            <td id="${obterClasseQuartil(index)}" >${dados[0].tma?.[quartil]?.media ?? '-'}</td>
            <td id="${obterClasseQuartil(index)}" >${dados[2].notaQualidade?.[quartil]?.media ?? '-'}</td>
            <td id="${obterClasseQuartil(index)}" >${dados[3].notaQualidadeVendas?.[quartil]?.media ?? '-'}</td>
            <td id="${obterClasseQuartil(index)}" >${dados[4].qtdVendas?.[quartil]?.soma ?? '-'}</td>
        `;

            tabelaBody.appendChild(row);
        });

    } catch (error) {
        console.log("Erro:", error);
    }
}

async function buscarIndicadoresPorQuartil(mes) {
    const token = localStorage.getItem("auth-base-gestao");
    const indicadores = [];

    if (!mes) {
        const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
        mes = mesAtual;
    }

    console.log('mesquartil', mes);
    
    const urls = [
        `dashboard/quartil-tma/${mes}`,
        `dashboard/quartil-csat/${mes}`,
        `dashboard/quartil-monitoria/${mes}`,
        `dashboard/quartil-monitoria-vendas/${mes}`,
        `dashboard/quartil-vendas/${mes}`
    ];

    try {
        const respostas = await Promise.all(urls.map(url =>
            fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer: ${token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => {
                if (!res.ok) throw new Error(`Erro ao carregar ${url}`);
                return res.json();
            })
        ));

        // Mapeando os resultados para os indicadores
        indicadores.push(
            { tma: respostas[0] },
            { csat: respostas[1] },
            { notaQualidade: respostas[2] },
            { notaQualidadeVendas: respostas[3] },
            { qtdVendas: respostas[4] }
        );

        console.log(indicadores)
        return indicadores;
    } catch (error) {
        console.error("Erro ao buscar indicadores:", error);
        throw error;
    }
}

async function logout() {
    localStorage.removeItem("auth-base-gestao")
    window.location.href = "/login"
}




// Evento de clique para os itens do dropdown
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (event) => {
        const mes = event.target.getAttribute('data-mes').toUpperCase(); // Corrige o erro de digitação
        buscarTabelaOperadorGeral(mes); // Chama a função passando o mês selecionado
        buscarIndicadoresGeral(mes); // Supondo que você tenha uma função para buscar os indicadores gerais
        buscarIndicadoresPorQuartil(mes)
        criarTabelaQuartil(mes)
    });
});

// Reorganizando o carregamento do conteúdo
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosUserLogado();
    criarTabelaQuartil(null); // Supondo que você tenha uma função para criar a tabela de quartil
    buscarTabelaOperadorGeral(null); // Carrega a tabela para o mês atual ou o selecionado
    buscarIndicadoresGeral(null); // Supondo que você tenha uma função para buscar os indicadores gerais
    buscarIndicadoresPorQuartil()
});
