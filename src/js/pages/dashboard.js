console.log("dashboard.js carregado com sucesso (Versão 2)!");

// ==========================
// IMPORTAÇÕES
// ==========================
import { getUserActivityLogs } from "../services/activityService.js";
import { getProfile } from "../services/authService.js";

// ==========================
// ELEMENTOS DO DOM
// ==========================
const totalCo2Element = document.getElementById("valor-emissao-total");
const totalAtividadesElement = document.getElementById("total-atividades-contador");
const mediaDiariaElement = document.getElementById("media-diaria");
const ofensivaElement = document.getElementById("ofensiva-atual");
const listaUltimasAtividades = document.getElementById("dashboard-lista-atividades");
const seletorData = document.getElementById("filtro-data-diario");

// Variáveis de Estado
let emissionChart = null;
let currentPeriod = 'semanal';
let impactChart = null;
let currentImpactPeriod = 'semanal';
let todosOsLogs = [];

// ==========================
// FUNÇÕES DE UTILIDADE E UI
// ==========================
function obterEmoji(nome) {
  if (!nome) return "🌱";
  if (nome.includes("Banho")) return "🚿";
  if (nome.includes("Desktop") || nome.includes("Computador") || nome.includes("Notebook") || nome.includes("Gamer")) return "🖥️";
  if (nome.includes("Ar") || nome.includes("Ventilador")) return "❄️";
  if (nome.includes("Secador") || nome.includes("Ferro") || nome.includes("Secadora")) return "🔥";
  if (nome.includes("Voo")) return "✈️";
  if (nome.includes("Carro") || nome.includes("Moto") || nome.includes("Ônibus")) return "🚗";
  if (nome.includes("Plantar") || nome.includes("Árvore") || nome.includes("Bicicleta") || nome.includes("Pé") || nome.includes("Sol") || nome.includes("Natural")) return "🌲";
  return "🌱";
}

function configurarDataHoje() {
  if (!seletorData) return;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  seletorData.value = `${ano}-${mes}-${dia}`;
}

function renderizarLogDoDia(dataSelecionadaISO) {
  if (!listaUltimasAtividades || !dataSelecionadaISO) return;

  const [ano, mes, dia] = dataSelecionadaISO.split("-");
  const dataFormatadaBR = `${dia}/${mes}/${ano}`;

  const logsDoDia = todosOsLogs.filter(log => log.date === dataFormatadaBR);

  if (logsDoDia.length === 0) {
    listaUltimasAtividades.innerHTML = `
      <p style="color: #777; padding: 20px 10px; text-align: center; font-style: italic;">
        Nenhuma atividade registrada em ${dataFormatadaBR}.
      </p>
    `;
    return;
  }

  const totalCo2DoDia = logsDoDia.reduce((total, log) => total + parseFloat(log.co2_saved), 0);

  const resumoDiaHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f4f6f4; padding: 10px 14px; border-radius: 6px; font-weight: bold; color: #2e5932; margin-bottom: 12px; font-size: 0.95em;">
      <span>Resultados de ${dataFormatadaBR}</span>
      <span style="color: #444;">Total emitido: ${totalCo2DoDia.toFixed(2)} kg CO₂</span>
    </div>
  `;

  const itensHTML = logsDoDia.map(log => {
    const emoji = obterEmoji(log.activity_name);
    return `
      <div class="activity-item" style="border-bottom: 1px dashed #eee; padding: 10px 5px; display: flex; justify-content: space-between;">
          <span>${emoji} ${log.activity_name}</span>
          <span style="font-size: 0.9em; color: #666;">${log.duration}h (${log.co2_saved} kg)</span>
      </div>
    `;
  }).join("");

  listaUltimasAtividades.innerHTML = resumoDiaHTML + itensHTML;
}

// ==========================
// INICIALIZAÇÃO PRINCIPAL DO DASHBOARD
// ==========================
async function inicializarDashboard() {
  try {
    configurarDataHoje();
    
    // Busca os dados simultaneamente (Deixa a tela mais rápida)
    const [logsResult, perfilResult] = await Promise.all([
      getUserActivityLogs(),
      getProfile()
    ]);

    todosOsLogs = logsResult || [];
    const dadosPerfil = perfilResult;

    // 1. Atualiza a Ofensiva (Streak)
    if (dadosPerfil && ofensivaElement) {
      ofensivaElement.innerText = `${dadosPerfil.profile.streak || 0} dias 🔥`;
    }

    // 2. Validação de estado vazio
    if (todosOsLogs.length === 0) {
      if (totalCo2Element) totalCo2Element.innerText = "0.00 kg CO₂";
      if (totalAtividadesElement) totalAtividadesElement.innerText = "0";
      if (mediaDiariaElement) mediaDiariaElement.innerText = "0.00 kg/dia";
      if (listaUltimasAtividades) {
        listaUltimasAtividades.innerHTML = '<p style="color: #666; padding: 10px;">Nenhum registro encontrado no sistema.</p>';
      }
      return;
    }

    // 3. Cálculo das Métricas Gerais
    const somaCo2Geral = todosOsLogs.reduce((total, log) => total + parseFloat(log.co2_saved), 0);
    const quantidadeAtividadesGeral = todosOsLogs.length;
    
    // Calcula Média Diária
    const diasUnicos = new Set(todosOsLogs.map(log => log.date)).size;
    const mediaDiaria = somaCo2Geral / (diasUnicos || 1);

    if (totalCo2Element) totalCo2Element.innerText = `${somaCo2Geral.toFixed(2)} kg CO₂`;
    if (totalAtividadesElement) totalAtividadesElement.innerText = quantidadeAtividadesGeral;
    if (mediaDiariaElement) mediaDiariaElement.innerText = `${mediaDiaria.toFixed(2)} kg/dia`;

    if (seletorData && seletorData.value) {
      renderizarLogDoDia(seletorData.value);
    }
    
    // 4. Setup dos Gráficos
    setupPeriodSelector();
    setupImpactPeriodSelector();
    carregarGrafico('semanal');
    carregarGraficoImpacto('semanal');

  } catch (erro) {
    console.error("Erro crítico ao carregar o Dashboard:", erro);
    if (listaUltimasAtividades) {
      listaUltimasAtividades.innerHTML = `<p style="color: red; padding: 10px;">Erro ao carregar dados. Detalhe no console.</p>`;
    }
  }
}

// Listener para o filtro de data do Log Diário
if (seletorData) {
  seletorData.addEventListener("change", (e) => {
    renderizarLogDoDia(e.target.value);
  });
}

// ==========================
// LÓGICA DO GRÁFICO DE IMPACTO (POLAR)
// ==========================
function setupImpactPeriodSelector() {
  const impactButtons = document.querySelectorAll('.impact-btn');
  if (!impactButtons.length) return;
  
  impactButtons.forEach(button => {
    button.addEventListener('click', async () => {
      impactButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      currentImpactPeriod = button.dataset.impactPeriod;
      carregarGraficoImpacto(currentImpactPeriod);
    });
  });
}

function carregarGraficoImpacto(periodo) {
  const dadosAgrupados = agruparAtividadesPorImpacto(periodo);
  renderizarGraficoRosa(dadosAgrupados);
}

function agruparAtividadesPorImpacto(periodo) {
  const hoje = new Date();
  let dataInicio;
  
  if (periodo === 'semanal') {
    dataInicio = new Date(hoje);
    dataInicio.setDate(dataInicio.getDate() - 7);
  } else if (periodo === 'mensal') {
    dataInicio = new Date(hoje);
    dataInicio.setMonth(dataInicio.getMonth() - 1);
  } else if (periodo === 'anual') {
    dataInicio = new Date(hoje);
    dataInicio.setFullYear(dataInicio.getFullYear() - 1);
  }
  
  const logsFiltrados = todosOsLogs.filter(log => {
    const [dia, mes, ano] = log.date.split("/");
    const dataLog = new Date(`${ano}-${mes}-${dia}`);
    return dataLog >= dataInicio && dataLog <= hoje;
  });
  
  const atividadesMap = {};
  
  logsFiltrados.forEach(log => {
    const nome = log.activity_name || 'Outros';
    if (!atividadesMap[nome]) {
      atividadesMap[nome] = { nome: nome, co2Total: 0, horasTotal: 0, count: 0 };
    }
    atividadesMap[nome].co2Total += parseFloat(log.co2_saved || 0);
    atividadesMap[nome].horasTotal += parseFloat(log.duration || 0);
    atividadesMap[nome].count++;
  });
  
  let atividadesArray = Object.values(atividadesMap);
  atividadesArray.sort((a, b) => b.co2Total - a.co2Total);
  
  const top8 = atividadesArray.slice(0, 8);
  
  if (atividadesArray.length > 8) {
    const outras = atividadesArray.slice(8);
    const outrasAgrupadas = {
      nome: 'Outras atividades',
      co2Total: outras.reduce((sum, a) => sum + a.co2Total, 0),
      horasTotal: outras.reduce((sum, a) => sum + a.horasTotal, 0),
      count: outras.reduce((sum, a) => sum + a.count, 0)
    };
    top8.push(outrasAgrupadas);
  }
  
  return top8;
}

function renderizarGraficoRosa(dados) {
  const ctx = document.getElementById("impactChart");
  if (!ctx) return;
  if (impactChart) impactChart.destroy();
  
  const cores = ['#2d6a4f', '#e07b39', '#4a90a4', '#8e44ad', '#c44569', '#3b82f6', '#e67e22', '#16a085', '#d4a017'];
  const labels = dados.map(d => `${obterEmoji(d.nome)} ${d.nome}`);
  const valores = dados.map(d => d.co2Total);
  const horas = dados.map(d => d.horasTotal);
  
  impactChart = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: cores.slice(0, dados.length).map(c => c + 'CC'),
        borderColor: cores.slice(0, dados.length).map(c => c + 'FF'),
        borderWidth: 2.5,
        hoverBackgroundColor: cores.slice(0, dados.length),
        hoverBorderWidth: 3,
        hoverBorderColor: '#1b4332',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 20, bottom: 20, left: 10, right: 10 } },
      plugins: {
        legend: {
          position: 'right',
          align: 'center',
          maxWidth: 220,
          labels: {
            color: '#333', font: { size: 13 }, padding: 14, usePointStyle: true, pointStyle: 'circle',
            generateLabels: function(chart) {
              const data = chart.data;
              return data.labels.map((label, i) => ({
                text: label, fillStyle: data.datasets[0].backgroundColor[i], strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: 2, hidden: false, index: i, pointStyle: 'circle'
              }));
            }
          }
        },
        tooltip: {
          backgroundColor: "#1b4332", titleColor: "#fff", bodyColor: "#fff", padding: 14, cornerRadius: 10,
          callbacks: {
            label: function(context) {
              const horaItem = horas[context.dataIndex];
              return [`CO₂: ${valores[context.dataIndex].toFixed(2)} kg`, `Tempo: ${horaItem.toFixed(1)}h`];
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true, suggestedMax: Math.max(...valores) * 1.25,
          ticks: { display: true, backdropColor: 'transparent', color: '#999', font: { size: 10 }, count: 4, callback: value => value.toFixed(1) + ' kg' },
          grid: { color: 'rgba(0,0,0,0.05)', circular: true },
          angleLines: { color: 'rgba(0,0,0,0.05)' },
          pointLabels: { display: false }
        }
      }
    }
  });
}

// ==========================
// LÓGICA DO GRÁFICO DE LINHA (EMISSÕES)
// ==========================
function setupPeriodSelector() {
  const periodButtons = document.querySelectorAll('.period-btn');
  if (!periodButtons.length) return;
  
  periodButtons.forEach(button => {
    button.addEventListener('click', async () => {
      periodButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentPeriod = button.dataset.period;
      carregarGrafico(currentPeriod);
    });
  });
}

function carregarGrafico(periodo) {
  if (periodo === 'semanal') renderizarGraficoSemanal();
  else if (periodo === 'mensal') renderizarGraficoMensal();
  else if (periodo === 'anual') renderizarGraficoAnual();
}

function renderizarGraficoSemanal() {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const labels = [], valores = [];
  
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    
    labels.push(`${diasSemana[data.getDay()]} (${dia}/${mes})`);
    valores.push(todosOsLogs.filter(log => log.date === `${dia}/${mes}/${data.getFullYear()}`).reduce((acc, log) => acc + parseFloat(log.co2_saved), 0));
  }
  renderizarGrafico(labels, valores, '#2d6a4f', 'Dia', 'CO₂ (kg)');
}

function renderizarGraficoMensal() {
  const labels = [], valores = [], tooltipsInfo = []; 
  const hoje = new Date();
  
  for (let i = 3; i >= 0; i--) {
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - (i * 7 + 6));
    const fimSemana = new Date(hoje);
    fimSemana.setDate(hoje.getDate() - (i * 7));
    
    const inicioDia = String(inicioSemana.getDate()).padStart(2, '0');
    const inicioMes = String(inicioSemana.getMonth() + 1).padStart(2, '0');
    const fimDia = String(fimSemana.getDate()).padStart(2, '0');
    const fimMes = String(fimSemana.getMonth() + 1).padStart(2, '0');
    
    labels.push(i === 0 ? 'Sem. atual' : `${i} sem. atrás`);
    tooltipsInfo.push(`${i === 0 ? 'Semana atual' : i + ' semana(s) atrás'} (${inicioDia}/${inicioMes} - ${fimDia}/${fimMes})`);
    
    valores.push(todosOsLogs.reduce((acc, log) => {
      const [dia, mes, ano] = log.date.split("/");
      const dataLog = new Date(`${ano}-${mes}-${dia}`);
      return (dataLog >= inicioSemana && dataLog <= fimSemana) ? acc + parseFloat(log.co2_saved) : acc;
    }, 0));
  }
  renderizarGraficoMensalComTooltips(labels, valores, '#40916c', 'Período', 'CO₂ (kg)', tooltipsInfo);
}

function renderizarGraficoMensalComTooltips(labels, valores, cor, eixoX, eixoY, tooltipsInfo) {
  const ctx = document.getElementById("emissionChart");
  if (!ctx) return;
  if (emissionChart) emissionChart.destroy();
  
  emissionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "kg CO₂", data: valores, borderColor: cor, backgroundColor: cor + "1F", fill: "origin", tension: 0.45,
        cubicInterpolationMode: 'monotone', borderWidth: 3, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: "#ffffff", pointBorderColor: cor, pointBorderWidth: 3
      }]
    },
    options: {
      layout: { padding: { top: 10, right: 20, bottom: 10, left: 10 } }, responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#333', font: { size: 12, weight: 'bold' }, usePointStyle: true, pointStyle: 'circle' } },
        tooltip: {
          backgroundColor: "#1b4332", titleColor: "#fff", bodyColor: "#fff", padding: 12, displayColors: false, cornerRadius: 10,
          callbacks: {
            title: context => tooltipsInfo[context[0].dataIndex] || context[0].label,
            label: context => `${context.parsed.y.toFixed(2)} kg CO₂`
          }
        }
      },
      scales: {
        x: { title: { display: true, text: eixoX, color: '#1b4332', font: { size: 13, weight: 'bold' } }, grid: { display: false }, ticks: { color: "#666", maxRotation: 0, minRotation: 0 } },
        y: { beginAtZero: true, title: { display: true, text: eixoY, color: '#1b4332', font: { size: 13, weight: 'bold' } }, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#666", callback: value => value.toFixed(1) } }
      }
    }
  });
}

function renderizarGraficoAnual() {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const labels = [], valores = [];
  const hoje = new Date(), anoAtual = hoje.getFullYear(), mesAtual = hoje.getMonth();
  
  for (let i = 11; i >= 0; i--) {
    const mes = (mesAtual - i + 12) % 12;
    const ano = mesAtual - i < 0 ? anoAtual - 1 : anoAtual;
    labels.push(`${meses[mes]}/${ano}`);
    
    valores.push(todosOsLogs.reduce((acc, log) => {
      const [dia, mesLog, anoLog] = log.date.split("/");
      return (parseInt(mesLog) - 1 === mes && parseInt(anoLog) === ano) ? acc + parseFloat(log.co2_saved) : acc;
    }, 0));
  }
  renderizarGrafico(labels, valores, '#52b788', 'Mês/Ano', 'CO₂ (kg)');
}

function renderizarGrafico(labels, valores, cor, eixoX = '', eixoY = '') {
  const ctx = document.getElementById("emissionChart");
  if (!ctx) return;
  if (emissionChart) emissionChart.destroy();
  
  emissionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "kg CO₂", data: valores, borderColor: cor, backgroundColor: cor + "1F", fill: "origin", tension: 0.45,
        cubicInterpolationMode: 'monotone', borderWidth: 3, pointRadius: 5, pointHoverRadius: 7, pointBackgroundColor: "#ffffff", pointBorderColor: cor, pointBorderWidth: 3
      }]
    },
    options: {
      layout: { padding: { top: 10, right: 20, bottom: 10, left: 10 } }, responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#333', font: { size: 12, weight: 'bold' }, usePointStyle: true, pointStyle: 'circle' } },
        tooltip: { backgroundColor: "#1b4332", titleColor: "#fff", bodyColor: "#fff", padding: 12, displayColors: false, cornerRadius: 10, callbacks: { label: context => `${context.parsed.y.toFixed(2)} kg CO₂` } }
      },
      scales: {
        x: { title: { display: true, text: eixoX, color: '#1b4332', font: { size: 13, weight: 'bold' } }, grid: { display: false }, ticks: { color: "#666", maxRotation: 45, minRotation: 0 } },
        y: { beginAtZero: true, title: { display: true, text: eixoY, color: '#1b4332', font: { size: 13, weight: 'bold' } }, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#666", callback: value => value.toFixed(1) } }
      }
    }
  });
}

// ==========================
// BOOTSTRAP
// ==========================
inicializarDashboard();