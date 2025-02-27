
async function carregarDadosUserLogado() {
  try {

    const token = localStorage.getItem("auth-base-gestao");

    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Sessão expirada',
            text: 'Token expirado, faça o login novamente',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = '/login';
        });
    }

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

async function carregarOperadores(event) {
  try {

    const token = localStorage.getItem("auth-base-gestao");

    const response = await fetch('api/operadores', {
      method: "GET",
      headers: {
        "Authorization": `Bearer: ${token}`,
        "Content-Type": "application/json"
      }
    }); // Ajuste a URL conforme necessário
    const operadores = await response.json();

    const select = document.getElementById('operadoresSelect');
    operadores.forEach(op => {
      const option = document.createElement('option');
      option.value = op.nome;
      option.textContent = op.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar operadores:', error);
  }
}
async function enviarForm(event) {
  // Capturar valores do formulário
  const token = localStorage.getItem("auth-base-gestao");
  event.preventDefault(); // Evita o recarregamento da página

  const operador = document.getElementById("operadoresSelect").value;
  const data_inicial = document.getElementById("dataInicial").value;
  const data_final = document.getElementById("dataFinal").value;
  const o_que_deve_ser_feito = document.getElementById("oqueDeveSerFeito").value;
  const por_que_precisa_ser_realizado = document.getElementById("porquePrecisaSerRealizado").value;
  const quem_sera_responsavel = document.getElementById("quemSeraResponsavel").value;
  const onde_a_acao_sera_realizada = document.getElementById("ondeAcaoSeraRealizada").value;
  const quando_ela_sera_iniciada = document.getElementById("quandoElaSeraIniciada").value;
  const como_ela_deve_ser_realizada = document.getElementById("comoElaDeveSerRealizada").value;
  const quanto_custa = document.getElementById("quantoCusta").value;

  const operadorErro = document.getElementById("operadorErro");
  const dataInicialErro = document.getElementById("dataInicialErro");
  const dataFinalErro = document.getElementById("dataFinalErro");
  const dataRangeErro = document.getElementById("dataRangeErro");

  operadorErro.classList.add("d-none");
  dataInicialErro.classList.add("d-none");
  dataFinalErro.classList.add("d-none");
  dataRangeErro.classList.add("d-none");

  let formValido = true;

  if (!operador || operador === "") {
    operadorErro.classList.remove("d-none");
    formValido = false;
  }

// Validação das datas
if (!data_inicial) {
  dataInicialErro.classList.remove("d-none");
  Swal.fire({
      icon: 'warning',
      title: 'Atenção!',
      text: 'A data inicial é obrigatória.',
      confirmButtonText: 'OK'
  });
  formValido = false;
}

if (!data_final) {
  dataFinalErro.classList.remove("d-none");
  Swal.fire({
      icon: 'warning',
      title: 'Atenção!',
      text: 'A data final é obrigatória.',
      confirmButtonText: 'OK'
  });
  formValido = false;
}

if (data_inicial && data_final && data_final < data_inicial) {
  dataRangeErro.classList.remove("d-none");
  Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: 'A data final não pode ser menor que a data inicial.',
      confirmButtonText: 'OK'
  });
  formValido = false;
}

  if (formValido) {

    // Montar o objeto com os dados
    const dados = {
      operador,
      data_inicial,
      data_final,
      o_que_deve_ser_feito,
      por_que_precisa_ser_realizado,
      quem_sera_responsavel,
      onde_a_acao_sera_realizada,
      quando_ela_sera_iniciada,
      como_ela_deve_ser_realizada,
      quanto_custa
    };

    try {
      const response = await fetch("5w2h/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer: ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar o formulário");
    }
    
    Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Formulário enviado com sucesso!',
        confirmButtonText: 'OK'
    }).then(() => {
        window.location.href = '/5w2h';
    });
    
  } catch (error) {
    console.error("Erro:", error);
    
    Swal.fire({
        icon: 'error',
        title: 'Erro!',
        text: 'Erro ao enviar o formulário!',
        confirmButtonText: 'OK'
    });
}
  }
}

  


// Reorganizando o carregamento do conteúdo
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosUserLogado()
  carregarOperadores();
});