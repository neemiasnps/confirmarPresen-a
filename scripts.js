// ID da planilha do Google Sheets
const SHEET_ID = "1vs2YWG1NrNAK0WoiJOA_E2RNVqrm3etO3n4wQP0Zuvc";

// ID do cliente e escopos da API Google
const CLIENT_ID = "111240662640-4qiildanoi5dp786qaq9dg9s6in3i61u.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Intervalo das planilhas
const LOJAS_RANGE = "Lojas!B2:B"; // Lojas
const FORNECEDORES_RANGE = "Fornecedores!A2:A"; // Fornecedores

// Função para inicializar o cliente Google API e autenticar o usuário
function initAndAuthenticate() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.auth2.init({
        client_id: CLIENT_ID,
        scope: SCOPES
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        
        // Verifica se o usuário já está autenticado
        if (authInstance.isSignedIn.get()) {
          resolve(); // Usuário já autenticado
        } else {
          authInstance.signIn().then(resolve, reject); // Solicita a autenticação
        }
      });
    });
  });
}

// Função para carregar os dados de Lojas e Fornecedores da planilha
function loadSheetData() {
  // Carregar dados de Lojas
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: LOJAS_RANGE
  }).then(response => {
    preencherSelect(response.result.values || [], 'loja');
  }).catch(error => {
    console.error("Erro ao carregar dados de Lojas:", error);
  });

  // Carregar dados de Fornecedores
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: FORNECEDORES_RANGE
  }).then(response => {
    preencherSelect(response.result.values || [], 'fornecedor');
  }).catch(error => {
    console.error("Erro ao carregar dados de Fornecedores:", error);
  });
}

// Função para preencher o campo select com os dados recebidos
function preencherSelect(valores, selectId) {
  const selectElement = document.getElementById(selectId);
  selectElement.innerHTML = '';  // Limpar o conteúdo anterior

  // Preencher o select com os valores
  valores.forEach(value => {
    const option = document.createElement('option');
    option.textContent = value[0]; // Cada linha tem um único valor (em um array)
    selectElement.appendChild(option);
  });

  // Inicializa o select usando o Materialize
  M.FormSelect.init(selectElement);
}

// Função para carregar os colaboradores de acordo com a loja selecionada
function loadNomes(lojaSelecionada) {
  console.log("Carregando colaboradores para a loja:", lojaSelecionada);
  // Lógica para carregar os colaboradores com base na loja selecionada
  // Essa função pode ser expandida conforme a necessidade
}

// Evento para atualizar a lista de colaboradores ao selecionar a loja
document.getElementById('loja').addEventListener('change', (event) => {
  const lojaSelecionada = event.target.value;
  loadNomes(lojaSelecionada);
});

// Função para enviar os dados do formulário
function enviarDados(formData) {
  console.log("Enviando dados do formulário:", formData);

  // Você pode substituir o código abaixo para enviar os dados para o Google Sheets ou outro servidor
  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "FormResponses!A1", // Defina o intervalo de onde os dados serão gravados
    valueInputOption: "RAW",
    resource: {
      values: [
        [formData.loja, formData.nome, formData.fornecedor, formData.data]
      ]
    }
  }).then(response => {
    console.log("Dados enviados com sucesso:", response);
    alert("Formulário enviado com sucesso!");
  }).catch(error => {
    console.error("Erro ao enviar dados:", error);
    alert("Erro ao enviar os dados. Tente novamente.");
  });
}

// Captura o evento de envio do formulário
document.getElementById("formulario").addEventListener("submit", function(event) {
  event.preventDefault();

  // Captura os dados do formulário
  const loja = document.getElementById("loja").value;
  const nome = document.getElementById("nome").value;
  const fornecedor = document.getElementById("fornecedor").value;
  const data = document.getElementById("data").value;

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (loja && nome && fornecedor && data) {
    const formData = { loja, nome, fornecedor, data };
    
    // Autentica e envia os dados após a autenticação
    initAndAuthenticate().then(() => {
      enviarDados(formData);
    }).catch(error => {
      console.error("Erro de autenticação:", error);
      alert("Falha na autenticação. Tente novamente.");
    });
  } else {
    alert("Por favor, preencha todos os campos.");
  }
});

// Inicializa os componentes do Materialize (selects, datepickers)
document.addEventListener('DOMContentLoaded', function() {
  console.log("Inicializando Materialize...");

  // Inicializa o select do Materialize
  const selects = document.querySelectorAll('select');
  M.FormSelect.init(selects);

  // Inicializa o datepicker do Materialize
  const datepickers = document.querySelectorAll('.datepicker');
  M.Datepicker.init(datepickers, {
    format: 'dd/mm/yyyy',
    i18n: {
      months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'S sexta', 'Sábado'],
      weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    }
  });

  // Carrega os dados da planilha
  console.log("Carregando dados da planilha...");
  loadSheetData();
});
