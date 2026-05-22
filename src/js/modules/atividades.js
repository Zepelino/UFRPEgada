console.log("atividades.js carregado com sucesso!");

import {
  getUserActivityLogs,
  registerActivity,
  getActivitiesCatalog
} from "../services/activityService.js";

const containerAtividade = document.getElementById("activity-container");
const emptyState = document.getElementById("empty-state");
const form = document.getElementById("meu-formulario-atividades");
const selectAtividade = document.getElementById("select-atividade");

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

// ===== CRIAR CARD DE HISTÓRICO =====
function criarCardAtividade(log) {
  const emoji = obterEmoji(log.activity_name);

  return `
    <div class="activity-card">
      <div class="activity-header">
        <span class="activity-title">
          ${emoji} ${log.activity_name}
        </span>
        <span class="activity-duration">
          ${log.duration}h
        </span>
      </div>
      <div class="activity-info">
        <p>
          CO₂ emitido: <strong>${log.co2_saved}kg</strong>
        </p>
        <p class="activity-date">
          ${log.date}
        </p>
      </div>
    </div>
  `;
}

// ===== RENDERIZAR CARDS =====
function renderizarCards(logs) {
  if (!containerAtividade) return;

  if (logs.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    containerAtividade.innerHTML = "";
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");
  containerAtividade.innerHTML = logs.map(criarCardAtividade).join("");
}

// ===== CARREGAR OPÇÕES DO FORMULÁRIO (CATEGORIAS) =====
async function carregarOpcoesFormulario() {
  if (!selectAtividade) return;

  const atividades = await getActivitiesCatalog();
  const categoriasAgrupadas = {};
  
  atividades.forEach(ativ => {
    const cat = ativ.categoria || "Outras Atividades";
    if (!categoriasAgrupadas[cat]) {
      categoriasAgrupadas[cat] = [];
    }
    categoriasAgrupadas[cat].push(ativ);
  });

  let htmlSelect = `<option value="" disabled selected>Escolha uma atividade...</option>`;
  
  for (const categoria in categoriasAgrupadas) {
    htmlSelect += `<optgroup label="${categoria}">`;
    categoriasAgrupadas[categoria].forEach(ativ => {
      htmlSelect += `<option value="${ativ.id}">${ativ.descricao}</option>`;
    });
    htmlSelect += `</optgroup>`;
  }

  selectAtividade.innerHTML = htmlSelect;
}

// ===== CARREGAR PÁGINA =====
async function carregarPagina() {
  await carregarOpcoesFormulario();
  const logs = await getUserActivityLogs();
  renderizarCards(logs);
}

// ===== REGISTRAR ATIVIDADE =====
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const activityId = selectAtividade.value;
    const duration = parseFloat(document.getElementById("input-tempo").value);

    if (!activityId || isNaN(duration)) {
      alert("Por favor, selecione uma atividade e insira o tempo.");
      return;
    }

    await registerActivity(activityId, duration);
    await carregarPagina();
    form.reset();
  });
}

carregarPagina();