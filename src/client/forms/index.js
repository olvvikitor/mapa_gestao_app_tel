
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

async function getForms(event) {
  // Capturar valores do formulário
  const token = localStorage.getItem("auth-base-gestao");

  try {
    const response = await fetch("5w2h/getAll", {
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
  }
}
async function renderCards(dados) {
  if (dados.length < 1) {
    const container = document.createElement("div"); // Cria um novo div
    container.id = "mensagem-container"; // Define um ID para referência futura
    container.className = "text-center mt-5"; // Adiciona classes para estilização

    container.innerHTML = `
      <h1 class="text-info fw-bold bg-light p-3 rounded d-inline-block">
        Nenhum formulário aberto no momento!
      </h1>
      <br>
      <a href="/5w2h" class="btn btn-primary mt-3 mb-5">
        Cadastrar Novo
      </a>
    `;

    const footer = document.querySelector("footer");
    if (footer) {
      footer.parentNode.insertBefore(container, footer);
    } else {
      document.body.appendChild(container); // Se não houver footer, adiciona ao final do body
    }

  }
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
                    <button class="btn btn-outline-danger btn-sm" onclick="editarAcao('${form.id}')">
                        <i class="bi bi-pencil"></i> Fechar
                    </button>
                    <button class="btn btn-outline-info btn-sm" onclick="viewDetails(decodeURIComponent('${encodeURIComponent(JSON.stringify(form))}'))">
                        <i class="bi bi-eye"></i> Visualizar
                    </button>
                    <button class="btn btn-outline-success btn-sm" onclick="baixarFormsByID(decodeURIComponent('${encodeURIComponent(JSON.stringify(form.id))}'))">
                        <i class="bi bi-download"></i>  Exportar
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
  console.log(id);

  const token = localStorage.getItem("auth-base-gestao");

  Swal.fire({
    title: 'Tem certeza?',
    text: "Deseja fechar este formulário?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, fechar!',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`5w2h/update/${id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer: ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao editar o formulário");
        }

        Swal.fire({
          icon: 'success',
          title: 'Fechado com sucesso!',
          text: 'O formulário foi concluído.',
          confirmButtonText: 'OK'
        }).then(() => {
          window.location.href = '/forms';
        });

      } catch (error) {
        console.error("Erro:", error);

        Swal.fire({
          icon: 'error',
          title: 'Erro!',
          text: 'Erro ao editar o formulário!',
          confirmButtonText: 'OK'
        });
      }
    }
  });
}
async function baixarForms() {
  const token = localStorage.getItem("auth-base-gestao");
  try {
    const response = await fetch('5w2h/export-geral', {
      method: "GET",
      headers: {
        "Authorization": `Bearer: ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Erro ao baixar o arquivo: ${response.statusText}`);
      
    }
    Swal.fire({
      icon: 'success',
      title: 'Exportado com sucesso!',
      text: 'O download foi iniciado.',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = '/forms';
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'planos.xlsx';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch(error) {
    console.error('Erro ao baixar o arquivo:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: 'Erro ao baixar arquivo!',
      confirmButtonText: 'OK'
    });
  }
}

async function baixarFormsByID(id) {
  const token = localStorage.getItem("auth-base-gestao");
  try {
    const response = await fetch(`5w2h/export-by-id/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer: ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Erro ao baixar o arquivo: ${response.statusText}`);


    }
    Swal.fire({
      icon: 'success',
      title: 'Exportado com sucesso!',
      text: 'O download foi iniciado.',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = '/forms';
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'planos.xlsx';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch(error) {
    console.error('Erro ao baixar o arquivo:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: 'Erro ao baixar arquivo!',
      confirmButtonText: 'OK'
    });
  }
}

// Reorganizando o carregamento do conteúdo
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosUserLogado();
  getForms();
});