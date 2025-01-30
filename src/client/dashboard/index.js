
async function carregarDadosUserLogado() {
    try {

        const token = localStorage.getItem("auth-base-gestao");

        const resposta = await fetch("http://localhost:3000/auth/token", {
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

async function buscarTabelaOperadorGeral() {
    try {
        const token = localStorage.getItem("auth-base-gestao")

        const tabelaGeral = await fetch('http://localhost:3000/dashboard/table', {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        })
        if (!tabelaGeral.ok) {
            throw new Error("Erro ao carregar tabela geral")
        }
        const dados = await tabelaGeral.json()


        const tabela = document.getElementById("tabela-geral");

        // Criando o corpo da tabela se ainda não existir
        let tabelaBody = tabela.querySelector("tbody");
        if (!tabelaBody) {
            tabelaBody = document.createElement("tbody");
            tabela.appendChild(tabelaBody);
        }

        tabelaBody.innerHTML = ""; // Limpa a tabela antes de preencher

        dados.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.matricula}</td>
                <td>${item.nome}</td>
                <td>${item.csat ?? '-'}</td>
                <td>${item.tma ?? '-'}</td>
                <td>${item.nota_qualidade ?? '-'}</td>
                <td>${item.nota_venda ?? '-'}</td>
                <td>${item.qtd_vendas ?? '-'}</td>
            `;
            tabelaBody.appendChild(row);
        });

    } catch (error) {
        console.log(error)
    }
}
async function buscarIndicadoresGeral() {
    try {
        const token = localStorage.getItem("auth-base-gestao")

        const response = await fetch('http://localhost:3000/dashboard/indicadores-geral', {
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
async function criarTabelaQuartil() {
    try {
        const dados = await buscarIndicadoresPorQuartil();
        console.log(dados);
        
        const tabela = document.getElementById("tabela-quartil");
        
        // Criando o corpo da tabela se ainda não existir
        let tabelaBody = tabela.querySelector("tbody");
        if (!tabelaBody) {
            tabelaBody = document.createElement("tbody");
            tabela.appendChild(tabelaBody);
        }
        
        tabelaBody.innerHTML = ""; // Limpa a tabela antes de preencher
        
        // Loop para preencher a tabela com dados dos quartis
        const quartis = ['primeiro', 'segundo', 'terceiro', 'quarto'];
        quartis.forEach((quartil, index) => {
            const row = document.createElement("tr");
            
            // Preenchendo a coluna Quartil
            row.innerHTML = `<td>${index + 1}</td>`;
            
            row.innerHTML += `
            <td>${dados[1].csat?.[quartil]?.media ?? '-'}</td>
            <td>${dados[0].tma?.[quartil]?.media ?? '-'}</td>
            <td>${dados[2].notaQualidade?.[quartil]?.media ?? '-'}</td>
            <td>${dados[3].notaQualidadeVendas?.[quartil]?.media ?? '-'}</td>
            <td>${dados[4].qtdVendas?.[quartil]?.soma ?? '-'}</td>
        `;
            
            tabelaBody.appendChild(row);
        });
        
    } catch (error) {
        console.log("Erro:", error);
    }
}

async function buscarIndicadoresPorQuartil() {
    const token = localStorage.getItem("auth-base-gestao");
    const indicadores = [];

    try {
        // Realizando as requisições
        const quartilTMA = await fetch('http://localhost:3000/dashboard/quartil-tma', {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!quartilTMA.ok) throw new Error("Erro ao carregar quartil TMA");
        const tma = await quartilTMA.json();
        indicadores.push({tma: tma});

        const quartilCSAT = await fetch('http://localhost:3000/dashboard/quartil-csat', {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!quartilCSAT.ok) throw new Error("Erro ao carregar quartil CSAT");
        const csat = await quartilCSAT.json();
        indicadores.push({csat: csat});

        const quartlNotaQualidade = await fetch('http://localhost:3000/dashboard/quartil-monitoria', {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!quartlNotaQualidade.ok) throw new Error("Erro ao carregar quartil monitoria");
        const nota_qualidade = await quartlNotaQualidade.json();
        indicadores.push({notaQualidade: nota_qualidade});

        const quartlNotaQualidadeVendas = await fetch('http://localhost:3000/dashboard/quartil-monitoria-vendas', {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!quartlNotaQualidadeVendas.ok) throw new Error("Erro ao carregar quartil monitoria vendas");
        const nota_qualidade_vendas = await quartlNotaQualidadeVendas.json();
        indicadores.push({notaQualidadeVendas: nota_qualidade_vendas});

        const quartilQtdVendas = await fetch('http://localhost:3000/dashboard/quartil-vendas', {
            method: "GET",
            headers: {
                "Authorization": `Bearer: ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!quartilQtdVendas.ok) throw new Error("Erro ao carregar quartil monitoria vendas");
        const qtdVendas = await quartilQtdVendas.json();
        indicadores.push({qtdVendas: qtdVendas});

        return indicadores
    } catch (error) {
        console.error("Erro ao buscar indicadores:", error);
        throw error;
    }
}



// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", carregarDadosUserLogado);
document.addEventListener("DOMContentLoaded", criarTabelaQuartil);
document.addEventListener("DOMContentLoaded", buscarIndicadoresGeral);
document.addEventListener("DOMContentLoaded", buscarTabelaOperadorGeral)

