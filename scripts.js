const SHEET_ID = "1vs2YWG1NrNAK0WoiJOA_E2RNVqrm3etO3n4wQP0Zuvc";
const API_KEY = "AIzaSyBH6EnOSZlpbyHasVJ4qGO_JRmW9iPwp-A";
const CLIENT_ID = "111240662640-4qiildanoi5dp786qaq9dg9s6in3i61u.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Inicializa o cliente GAPI para autenticação
function initAndAuthenticate() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.auth2.init({
  client_id: CLIENT_ID,
  scope: SCOPES
}).then(() => {
  const GoogleAuth = gapi.auth2.getAuthInstance();
  
  if (GoogleAuth.isSignedIn.get()) {
    resolve();
  } else {
    GoogleAuth.signIn().then(resolve, reject);
  }
}).catch((error) => {
  console.error("Erro de autenticação:", error);
  alert("Falha na autenticação. Verifique as configurações.");
  reject(error);
});

// Função para carregar os dados da planilha sem autenticação
function loadSheetData() {
  gapi.load('client', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPES
    }).then(() => {
      // Agora que o cliente está carregado, você pode acessar o Google Sheets
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Lojas!B2:B'
      }).then(response => {
        console.log(response);
        preencherSelect(response.result.values || [], 'loja');
      }).catch(error => {
        console.error("Erro ao carregar dados da planilha:", error);
      });
    }).catch(error => {
      console.error("Erro ao inicializar o cliente GAPI:", error);
    });
  });
}

function preencherSelect(valores, selectId) {
  const selectElement = document.getElementById(selectId);
  selectElement.innerHTML = '';  // Limpa o conteúdo anterior
  
  valores.forEach(value => {
    const option = document.createElement('option');
    option.textContent = value[0];  // Assume que os valores são um array com uma string
    selectElement.appendChild(option);
  });

  M.FormSelect.init(selectElement);  // Inicializa o select usando Materialize
}

// Função para carregar os colaboradores de acordo com a loja
function loadNomes(lojaSelecionada) {
  const range = "Colaboradores!A2:C";
  const url = https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY};

  fetch(url).then(res => res.json()).then(response => {
    const colaboradores = response.values || [];
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
    initAndAuthenticate().then(() => enviarDados(formData));
  } else {
    alert("Por favor, preencha todos os campos.");
  }
});

// Inicializar Materialize e carregar os dados da planilha
document.addEventListener('DOMContentLoaded', function() {
  console.log("Inicializando Materialize...");

  // Inicializar selects e datepickers
  const selects = document.querySelectorAll('select');
  M.FormSelect.init(selects);

  const datepickers = document.querySelectorAll('.datepicker');
  M.Datepicker.init(datepickers, {
    format: 'dd/mm/yyyy',
    i18n: {
      months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    }
  });

  console.log("Carregando dados da planilha...");
  loadSheetData();
});
