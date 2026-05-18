console.log("atividades.js carregado com sucesso!");

import {
  getUserActivityLogs,
  registerActivity,
} from "../services/activityService.js";

// ===== ELEMENTOS =====
const containerAtividade = document.getElementById("activity-container");
const emptyState = document.getElementById("empty-state");
const form = document.getElementById("meu-formulario-atividades");

// ===== EMOJIS =====
function obterEmoji(nome) {
  if (!nome) return "🌱";
  if (nome.includes("Banho")) return "🚿";
  if (nome.includes("Desktop") || nome.includes("Computador")) return "🖥️";
  if (nome.includes("Ar")) return "❄️";
  return "🌱";
}

// ===== CRIAR CARD =====
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

// ===== RENDERIZAR =====
function renderizarCards(logs) {
  if (!containerAtividade) {
    console.warn("Aviso: Elemento '#activity-container' não foi encontrado nesta página.");
    return;
  }

  if (logs.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    containerAtividade.innerHTML = "";
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");
  containerAtividade.innerHTML = logs.map(criarCardAtividade).join("");
}

// ===== CARREGAR LOGS =====
async function carregarPagina() {
  console.log("Buscando registros de atividades...");
  const logs = await getUserActivityLogs();
  console.log("Registros carregados do banco:", logs);
  renderizarCards(logs);
}

// ===== REGISTRAR ATIVIDADE =====
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const activityId = document.getElementById("select-atividade").value;
    const duration = parseFloat(document.getElementById("input-tempo").value);

    if (!activityId || isNaN(duration)) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    // Salva no Supabase
    await registerActivity(activityId, duration);

    // Recarrega os cards na tela atualizados
    await carregarPagina();

    // Limpa o formulário
    form.reset();
  });
} else {
  console.log("Formulário '#meu-formulario-atividades' não encontrado na página atual. Listener não configurado.");
}

// ===== INICIAR APLICAÇÃO =====
carregarPagina();