console.log("dashboard.js carregado com sucesso!");

import { getUserActivityLogs } from "../services/activityService.js";

const totalCo2Element = document.getElementById("valor-emissao-total");
const totalAtividadesElement = document.getElementById("total-atividades-contador");
const listaUltimasAtividades = document.getElementById("dashboard-lista-atividades");
const seletorData = document.getElementById("filtro-data-diario");

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
  renderizarGraficoSemanal();
}

// ===== LISTENER PARA DATA =====
if (seletorData) {
  seletorData.addEventListener("change", (e) => {
    renderizarLogDoDia(e.target.value);
  });
}

inicializarDashboard();


// ===== DASHBOARD DE EMISSÕES - GRÁFICO =====

function renderizarGraficoSemanal() {

  const diasSemana = [];
  const valoresSemana = [];

  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    
    const dia = String(
      data.getDate()
    ).padStart(2, "0");
    
    const mes = String(
      data.getMonth() + 1
    ).padStart(2, "0");

    const dataBR = `${dia}/${mes}/${data.getFullYear()}`;

    diasSemana.push(dia);

    const logsDia = todosOsLogs.filter(
      log => log.date === dataBR
    );

    const totalDia = logsDia.reduce(
      (acc, log) =>
        acc + parseFloat(log.co2_saved),
      0
    );
    valoresSemana.push(totalDia);
  }

  const emissoesPorDia = {
    Dom: 0,
    Seg: 0,
    Ter: 0,
    Qua: 0,
    Qui: 0,
    Sex: 0,
    Sab: 0
  };

  todosOsLogs.forEach(log => {
    const [dia, mes, ano] = log.date.split("/");
    const dataObj = new Date(
      `${ano}-${mes}-${dia}`
    );
    const diaSemana =
      diasSemana[dataObj.getDay()];
    emissoesPorDia[diaSemana] +=
      parseFloat(log.co2_saved);
  });

  const valores = Object.values(
    emissoesPorDia
  );

  const ctx =
    document.getElementById("weeklyChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: diasSemana,
      datasets: [{
        label: "kg CO₂",
        data: valoresSemana,
        borderColor: "#2d6a4f",
        backgroundColor: "rgba(45, 106, 79, 0.12)",
        fill: "origin",
        tension: 0.45,
        cubicInterpolationMode: 'monotone',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#2d6a4f",
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
          display: false
        },
        tooltip: {
          backgroundColor: "#1b4332",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          displayColors: false,
          cornerRadius: 10,
          callbacks: {
            label: function (context) {
              return `${context.parsed.y.toFixed(2)} kg CO₂`;
            }
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#666"
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.05)"
          },
          ticks: {
            color: "#666"
          }
        }
      }
    }
  });
}