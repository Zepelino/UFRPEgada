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
}

// ===== LISTENER PARA DATA =====
if (seletorData) {
  seletorData.addEventListener("change", (e) => {
    renderizarLogDoDia(e.target.value);
  });
}

inicializarDashboard();