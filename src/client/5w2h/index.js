
async function carregarOperadores() {
  try {
    const response = await fetch('http://localhost:3000/dashboard/operadores'); // Ajuste a URL conforme necessário
    const operadores = await response.json();
    console.log(operadores)
    
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
async function enviarForm() {
  // Capturar valores do formulário
  const operador = document.getElementById("operadoresSelect").value;
  const data_inicial = document.getElementById("dataInicial").value;
  const data_final = document.getElementById("dataFinal").value;
  const o_que_deve_ser_feito = document.getElementById("oqueDeveSerFeito").value;
  const por_que_precisa_ser_realizado = document.getElementById("porquePrecisaSerRealizado").value;
  const quem_sera_responsável = document.getElementById("quemSeraResponsavel").value;
  const onde_a_acao_sera_realizada = document.getElementById("ondeAcaoSeraRealizada").value;
  const quando_ela_sera_iniciada = document.getElementById("quandoElaSeraIniciada").value;
  const como_ela_deve_ser_realizada = document.getElementById("comoElaDeveSerRealizada").value;
  const quanto_custa = document.getElementById("quantoCusta").value;

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
    const response = await fetch("http://localhost:3000/5w2h/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    if (!response.ok) {
      throw new Error("Erro ao enviar o formulário");
    }

    const resultado = await response.json();
    console.log("Formulário enviado com sucesso:", resultado);
    alert("Formulário enviado com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao enviar o formulário!");
  }
}

// Reorganizando o carregamento do conteúdo
document.addEventListener("DOMContentLoaded", () => {
  carregarOperadores();
});