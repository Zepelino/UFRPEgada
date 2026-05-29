console.log("dashboard.js carregado com sucesso!");

import { getUserActivityLogs } from "../services/activityService.js";

const totalCo2Element = document.getElementById("valor-emissao-total");
const totalAtividadesElement = document.getElementById("total-atividades-contador");
const listaUltimasAtividades = document.getElementById("dashboard-lista-atividades");
const seletorData = document.getElementById("filtro-data-diario");
let emissionChart = null;
let currentPeriod = 'semanal';

let todosOsLogs = [];

// ===== EMOJIS =====
function obterEmoji(nome) {
  if (!nome) return "🌱";
  if (nome.includes("Banho")) return "🚿";
  if (nome.includes("Desktop") || nome.includes("Computador") || nome.includes("Notebook") || nome.includes("Gamer")) return "🖥️";
  if (nome.includes("Ar") || nome.includes("Ventilador")) return "❄️";
  if (nome.includes("Secador") || nome.includes("Ferro") || nome.includes("Secadora")) return "🔥";
  if (nome.includes("Voo")) return "✈️";
  if (nome.includes("Carro") || nome.includes("Moto") || nome.includes("Ônibus")) return "🚗";
  if (nome.includes("Plantar") || nome.includes("Árvore")) return "🌲";
  return "🌱";
}

// ===== RENDERIZAR O LOG DE UM DIA ESPECÍFICO =====
function renderizarLogDoDia(dataSelecionadaISO) {
  if (!listaUltimasAtividades) return;

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
      <div class="activity-item" style="border-bottom: 1px dashed #eee; padding: 10px 5px;">
          <span>${emoji} ${log.activity_name}</span>
          <span style="font-size: 0.9em; color: #666;">${log.duration}h (${log.co2_saved} kg emitido)</span>
      </div>
    `;
  }).join("");

  listaUltimasAtividades.innerHTML = resumoDiaHTML + itensHTML;
}

// ===== CONFIGURAR DATA INICIAL (HOJE) =====
function configurarDataHoje() {
  if (!seletorData) return;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  seletorData.value = `${ano}-${mes}-${dia}`;
}

// ===== INICIALIZAR DASHBOARD =====
async function inicializarDashboard() {
  configurarDataHoje();
  todosOsLogs = await getUserActivityLogs();

  if (!todosOsLogs || todosOsLogs.length === 0) {
    if (totalCo2Element) totalCo2Element.innerText = "0.00 kg CO₂";
    if (totalAtividadesElement) totalAtividadesElement.innerText = "0";
    if (listaUltimasAtividades) {
      listaUltimasAtividades.innerHTML = '<p style="color: #666; padding: 10px;">Nenhum registro encontrado no sistema.</p>';
    }
    return;
  }

  const somaCo2Geral = todosOsLogs.reduce((total, log) => total + parseFloat(log.co2_saved), 0);
  const quantidadeAtividadesGeral = todosOsLogs.length;

  if (totalCo2Element) totalCo2Element.innerText = `${somaCo2Geral.toFixed(2)} kg CO₂`;
  if (totalAtividadesElement) totalAtividadesElement.innerText = quantidadeAtividadesGeral;

  renderizarLogDoDia(seletorData.value);
  
  // Setup dos botões e carregar gráfico inicial
  setupPeriodSelector();
  carregarGrafico('semanal');
}

// ===== LISTENER PARA DATA =====
if (seletorData) {
  seletorData.addEventListener("change", (e) => {
    renderizarLogDoDia(e.target.value);
  });
}

// ===== SETUP DOS BOTÕES DE PERÍODO =====
function setupPeriodSelector() {
  const periodButtons = document.querySelectorAll('.period-btn');
  if (!periodButtons.length) return;
  
  periodButtons.forEach(button => {
    button.addEventListener('click', async () => {
      // Remove active de todos
      periodButtons.forEach(btn => btn.classList.remove('active'));
      
      // Adiciona active no clicado
      button.classList.add('active');
      
      // Atualiza período atual
      currentPeriod = button.dataset.period;
      
      // Recarrega o gráfico
      carregarGrafico(currentPeriod);
    });
  });
}

// ===== CARREGAR GRÁFICO CONFORME PERÍODO =====
function carregarGrafico(periodo) {
  if (periodo === 'semanal') {
    renderizarGraficoSemanal();
  } else if (periodo === 'mensal') {
    renderizarGraficoMensal();
  } else if (periodo === 'anual') {
    renderizarGraficoAnual();
  }
}

// ===== GRÁFICO SEMANAL (ÚLTIMOS 7 DIAS) =====
function renderizarGraficoSemanal() {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const labels = [];
  const valores = [];
  
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dataBR = `${dia}/${mes}/${data.getFullYear()}`;
    
    const nomeDia = diasSemana[data.getDay()];
    labels.push(`${nomeDia} (${dia}/${mes})`);
    
    const logsDia = todosOsLogs.filter(log => log.date === dataBR);
    const totalDia = logsDia.reduce((acc, log) => acc + parseFloat(log.co2_saved), 0);
    valores.push(totalDia);
  }
  
  renderizarGrafico(labels, valores, '#2d6a4f', 'Dia', 'CO₂ (kg)');
}

// ===== GRÁFICO MENSAL (ÚLTIMAS 4 SEMANAS) =====
function renderizarGraficoMensal() {
  const labels = [];
  const valores = [];
  const tooltipsInfo = []; // Array para guardar info completa do tooltip
  
  const hoje = new Date();
  
  for (let i = 3; i >= 0; i--) {
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - (i * 7 + 6));
    const fimSemana = new Date(hoje);
    fimSemana.setDate(hoje.getDate() - (i * 7));
    
    // Formatar datas da semana
    const inicioDia = String(inicioSemana.getDate()).padStart(2, '0');
    const inicioMes = String(inicioSemana.getMonth() + 1).padStart(2, '0');
    const fimDia = String(fimSemana.getDate()).padStart(2, '0');
    const fimMes = String(fimSemana.getMonth() + 1).padStart(2, '0');
    
    // Label enxuta para o eixo
    let rotulo;
    // Tooltip completo
    let tooltipCompleto;
    
    if (i === 0) {
      rotulo = 'Sem. atual';
      tooltipCompleto = `Semana atual (${inicioDia}/${inicioMes} - ${fimDia}/${fimMes})`;
    } else if (i === 1) {
      rotulo = '1 sem. atrás';
      tooltipCompleto = `1 semana atrás (${inicioDia}/${inicioMes} - ${fimDia}/${fimMes})`;
    } else if (i === 2) {
      rotulo = '2 sem. atrás';
      tooltipCompleto = `2 semanas atrás (${inicioDia}/${inicioMes} - ${fimDia}/${fimMes})`;
    } else {
      rotulo = '3 sem. atrás';
      tooltipCompleto = `3 semanas atrás (${inicioDia}/${inicioMes} - ${fimDia}/${fimMes})`;
    }
    
    labels.push(rotulo);
    tooltipsInfo.push(tooltipCompleto);
    
    const totalSemana = todosOsLogs.reduce((acc, log) => {
      const [dia, mes, ano] = log.date.split("/");
      const dataLog = new Date(`${ano}-${mes}-${dia}`);
      if (dataLog >= inicioSemana && dataLog <= fimSemana) {
        return acc + parseFloat(log.co2_saved);
      }
      return acc;
    }, 0);
    
    valores.push(totalSemana);
  }
  
  renderizarGraficoMensalComTooltips(labels, valores, '#40916c', 'Período', 'CO₂ (kg)', tooltipsInfo);
}

// ===== RENDERIZAR GRÁFICO MENSAL COM TOOLTIPS PERSONALIZADOS =====
function renderizarGraficoMensalComTooltips(labels, valores, cor, eixoX, eixoY, tooltipsInfo) {
  const ctx = document.getElementById("emissionChart");
  if (!ctx) return;
  
  if (emissionChart) {
    emissionChart.destroy();
  }
  
  emissionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "kg CO₂",
        data: valores,
        borderColor: cor,
        backgroundColor: cor + "1F",
        fill: "origin",
        tension: 0.45,
        cubicInterpolationMode: 'monotone',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: cor,
        pointBorderWidth: 3
      }]
    },
    options: {
      layout: {
        padding: {
          top: 10,
          right: 20,
          bottom: 10,
          left: 10
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index"
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#333',
            font: {
              size: 12,
              weight: 'bold'
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: "#1b4332",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          displayColors: false,
          cornerRadius: 10,
          callbacks: {
            title: function(context) {
              // Mostra a info completa no título do tooltip
              const index = context[0].dataIndex;
              return tooltipsInfo[index] || context[0].label;
            },
            label: function(context) {
              return `${context.parsed.y.toFixed(2)} kg CO₂`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: eixoX,
            color: '#1b4332',
            font: {
              size: 13,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          },
          ticks: {
            color: "#666",
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: eixoY,
            color: '#1b4332',
            font: {
              size: 13,
              weight: 'bold'
            }
          },
          grid: {
            color: "rgba(0,0,0,0.05)"
          },
          ticks: {
            color: "#666",
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        }
      }
    }
  });
}

// ===== GRÁFICO ANUAL (ÚLTIMOS 12 MESES) =====
function renderizarGraficoAnual() {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const labels = [];
  const valores = [];
  
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();
  
  for (let i = 11; i >= 0; i--) {
    const mes = (mesAtual - i + 12) % 12;
    const ano = mesAtual - i < 0 ? anoAtual - 1 : anoAtual;
    
    labels.push(`${meses[mes]}/${ano}`);
    
    const totalMes = todosOsLogs.reduce((acc, log) => {
      const [dia, mesLog, anoLog] = log.date.split("/");
      if (parseInt(mesLog) - 1 === mes && parseInt(anoLog) === ano) {
        return acc + parseFloat(log.co2_saved);
      }
      return acc;
    }, 0);
    
    valores.push(totalMes);
  }
  
  renderizarGrafico(labels, valores, '#52b788', 'Mês/Ano', 'CO₂ (kg)');
}

// ===== RENDERIZAR GRÁFICO GENÉRICO =====
function renderizarGrafico(labels, valores, cor, eixoX = '', eixoY = '') {
  const ctx = document.getElementById("emissionChart");
  if (!ctx) return;
  
  // Destruir gráfico anterior se existir
  if (emissionChart) {
    emissionChart.destroy();
  }
  
  emissionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "kg CO₂",
        data: valores,
        borderColor: cor,
        backgroundColor: cor + "1F",
        fill: "origin",
        tension: 0.45,
        cubicInterpolationMode: 'monotone',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: cor,
        pointBorderWidth: 3
      }]
    },
    options: {
      layout: {
        padding: {
          top: 10,
          right: 20,
          bottom: 10,
          left: 10
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index"
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#333',
            font: {
              size: 12,
              weight: 'bold'
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: "#1b4332",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          displayColors: false,
          cornerRadius: 10,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y.toFixed(2)} kg CO₂`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: eixoX,
            color: '#1b4332',
            font: {
              size: 13,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          },
          ticks: {
            color: "#666",
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: eixoY,
            color: '#1b4332',
            font: {
              size: 13,
              weight: 'bold'
            }
          },
          grid: {
            color: "rgba(0,0,0,0.05)"
          },
          ticks: {
            color: "#666",
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        }
      }
    }
  });
}

// INICIAR
inicializarDashboard();