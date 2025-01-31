const { time } = require("console");

async function enviarRequisicaoLogin(event) {
    event.preventDefault(); // Evita o recarregamento da página

    const site = document.getElementById("regional").value;
    const login = document.getElementById("login").value;
    const senha = document.getElementById("senha").value;

    const dados = {
        site,
        login,
        senha
    };

    try {
        const resposta = await fetch("http://localhost:3000/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
           
        });

        if (!resposta.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Credenciais inválidas',
                text: 'Usuário ou senha incorretos!',
            });
            return;
        }

        const response = await resposta.json();
        const token = await response.Bearer; 

        // Armazena o token no localStorage
        localStorage.setItem("auth-base-gestao",`${token}`);


        window.location.href = "/dashboard"; // Redirecione para a página desejada

    } catch (erro) {
        console.error("Erro ao fazer login:", erro);
        Swal.fire({
            icon: 'error',
            title: 'Credenciais inválidas',
            text: 'Usuário ou senha incorretos!',
        });

    }
}
