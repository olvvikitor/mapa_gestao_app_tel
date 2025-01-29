async function carregarDadosUserLogado() {
    try {

        const token = localStorage.getItem("auth-base-gestao");

        const resposta = await fetch("http://localhost:3000/auth/token",{
            method:'GET',
            headers:{
                "Authorization": `${token}`,
                "Content-Type": "application/json"
            }
        }); // Substitua pela URL da API
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
// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", carregarDadosUserLogado);
