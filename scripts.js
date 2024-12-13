const SHEET_ID = "1vs2YWG1NrNAK0WoiJOA_E2RNVqrm3etO3n4wQP0Zuvc";
const API_KEY = "AIzaSyBH6EnOSZlpbyHasVJ4qGO_JRmW9iPwp-A";
const CLIENT_ID = "111240662640-4qiildanoi5dp786qaq9dg9s6in3i61u.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Inicializa o cliente GAPI e autentica o usuário
function initAndAuthenticate() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', function() {
    gapi.client.init({
        apiKey: 'YOUR_API_KEY',
        clientId: 'YOUR_CLIENT_ID',
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
    }).then(function() {
        console.log("GAPI client initialized.");
        // Agora você pode chamar a função de autenticação
        return gapi.auth2.getAuthInstance().signIn();
    }).then(function() {
        console.log("Usuário autenticado.");
    }).catch(function(error) {
        console.error("Erro durante a autenticação:", error);
    });
});

// Função para carregar os dados da planilha
function loadSheetData() {
  const lojasRange = "Lojas!B2:B";
  const fornecedoresRange = "Fornecedores!A2:A";

  // Carregar as listas de lojas e fornecedores
  Promise.all([
    gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: lojasRange }),
    gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: fornecedoresRange })
  ]).then(([lojasResponse, fornecedoresResponse]) => {
    preencherSelect(lojasResponse.result.values || [], 'loja');
    preencherSelect(fornecedoresResponse.result.values || [], 'fornecedor');
  }).catch(error => {
    console.error("Erro ao carregar dados da planilha:", error);
  });
}

// Função genérica para preencher um select
function preencherSelect(valores, selectId) {
  const selectElement = document.getElementById(selectId);
  selectElement.innerHTML = '<option value="" disabled selected>Selecione uma opção</option>';
  valores.forEach(valor => {
    const option = document.createElement('option');
    option.value = valor[0];
    option.innerText = valor[0];
    selectElement.appendChild(option);
  });
  M.FormSelect.init(selectElement);
}

// Função para carregar os colaboradores de acordo com a loja
function loadNomes(lojaSelecionada) {
  const range = "Colaboradores!A2:C";
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range
  }).then(response => {
    const colaboradores = response.result.values || [];
    const nomesFiltrados = colaboradores.filter(colaborador => colaborador[0] === lojaSelecionada);
    preencherSelect(nomesFiltrados.map(colaborador => [colaborador[2]]), 'nome');
  }).catch(error => {
    console.error("Erro ao carregar colaboradores:", error);
  });
}

// Evento para atualizar a lista de nomes quando a loja for selecionada
document.getElementById('loja').addEventListener('change', (event) => {
  const lojaSelecionada = event.target.value;
  loadNomes(lojaSelecionada);
});

// Função para enviar os dados do formulário
function enviarDados(formData) {
  const range = "Confirmação!A2:D";
  const dados = [[formData.loja, formData.nome, formData.fornecedor, formData.data]];

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: range,
    valueInputOption: "RAW",
    resource: { values: dados }
  }).then(response => {
    console.log('Dados enviados com sucesso:', response);
    alert("Dados enviados com sucesso!");
  }).catch(error => {
    console.error("Erro ao enviar dados:", error);
    alert("Ocorreu um erro ao enviar os dados.");
  });
}

// Capturar e enviar os dados do formulário
document.getElementById("formulario").addEventListener("submit", function(event) {
  event.preventDefault();
  const loja = document.getElementById("loja").value;
  const nome = document.getElementById("nome").value;
  const fornecedor = document.getElementById("fornecedor").value;
  const data = document.getElementById("data").value;

  if (loja && nome && fornecedor && data) {
    const formData = { loja, nome, fornecedor, data };
    initAndAuthenticate().then(() => enviarDados(formData)).catch(error => {
      console.error("Erro durante a autenticação:", error);
    });
  } else {
    alert("Por favor, preencha todos os campos.");
  }
});

// Inicializar Materialize e carregar os dados da planilha
document.addEventListener('DOMContentLoaded', function() {
  M.FormSelect.init(document.querySelectorAll('select'));
  M.Datepicker.init(document.querySelectorAll('.datepicker'), {
    format: 'dd/mm/yyyy',
    i18n: {
      months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    }
  });

  // Carregar o GAPI client e autenticar
  gapi.load("client", () => {
    initAndAuthenticate().then(loadSheetData).catch(error => {
      console.error("Erro na inicialização do GAPI:", error);
    });
  });
});
