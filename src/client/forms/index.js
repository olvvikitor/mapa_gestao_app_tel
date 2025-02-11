
async function carregarDadosUserLogado() {
  try {

    const token = localStorage.getItem("auth-base-gestao");

    if (!token) {
      window.alert('Token expirado, faça o login novamente')
      window.location.href = '/login'
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

async function getForms(event) {
  // Capturar valores do formulário
  const token = localStorage.getItem("auth-base-gestao");

  try {
    const response = await fetch("http://localhost:3000/5w2h/getAll", {
      method: "GET",
      headers: {
        "Authorization": `Bearer: ${token}`,
        "Content-Type": "application/json"
      },
    });

    const dados = await response.json()
    console.log(dados)
    await renderCards(dados)
    if (!response.ok) {
      throw new Error("Erro ao buscar o formulário");
    }

  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao Carregar o formulário!");
  }
}
async function renderCards(dados) {
  const container = document.getElementById("cardsContainer");
  container.innerHTML = ""; // Limpa os cards antes de adicionar novos

  dados.forEach(form => {
    const card = document.createElement('div')
    card.classList.add("col")
    card.innerHTML =
      `
    <div class="card info-card sales-card h-100 shadow-sm">
        <div class="card-body">
            <h5 class="card-title text-primary">${form.o_que_deve_ser_feito || "Sem título"}</h5>
            <div class="d-flex flex-column align-items-start">
                <div class="w-100 mb-3">
                    <label class="form-label fw-bold">Operador:</label>
                    <p class="mb-1">${form.operador || "-"}</p>

                    <label class="form-label fw-bold">Data Final:</label>
                    <p class="mb-3">${form.data_final || "-"}</p>
                </div>

                <div class="d-flex justify-content-between w-100">
                    <button class="btn btn-success btn-sm" onclick="editarAcao('${form.id}')">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-info btn-sm" onclick="viewDetails(decodeURIComponent('${encodeURIComponent(JSON.stringify(form))}'))">
                        <i class="bi bi-eye"></i> Visualizar
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

    container.appendChild(card);


  });
}

function viewDetails(form) {
  const dados = JSON.parse(form)
  console.log(dados)
  document.getElementById("modalOQue").textContent = dados.o_que_deve_ser_feito || "Sem informação";
  document.getElementById("modalOperador").textContent = dados.operador || "Sem informação";
  document.getElementById("modalDataFinal").textContent = dados.data_inicial || "Sem informação";
  document.getElementById("modalPorque").textContent = dados.por_que_precisa_ser_realizado || "Sem informação";
  document.getElementById("modalquem").textContent = dados.quem_sera_responsavel || "Sem informação";
  document.getElementById("modalOnde").textContent = dados.onde_a_acao_sera_realizada || "Sem informação";
  document.getElementById("modalQuando").textContent = dados.quando_ela_sera_iniciada || "Sem informação";
  document.getElementById("modalComoRealizar").textContent = dados.como_ela_deve_ser_realizada || "Sem informação";
  document.getElementById("modalCusto").textContent = dados.quanto_custa || "Sem informação";

  // Abrir modal
  let modal = new bootstrap.Modal(document.getElementById("infoModal"));
  modal.show();
}

async function editarAcao(id) {
  console.log(id)
  const token = localStorage.getItem("auth-base-gestao");

  try {
    const response = await fetch(`http://localhost:3000/5w2h/update/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer: ${token}`,
        "Content-Type": "application/json"
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao editar o formulário");
    }
    alert('atualizado com sucesso')
    window.location.href = '/forms'
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao editar o formulário!");
  }
}
// Reorganizando o carregamento do conteúdo
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosUserLogado();
  getForms();
});