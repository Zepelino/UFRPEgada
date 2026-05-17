console.log("atividades.js carregado");

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
  if (nome.includes("Banho")) {
    return "🚿";
  }

  if (nome.includes("Desktop")) {
    return "🖥️";
  }

  if (nome.includes("Ar")) {
    return "❄️";
  }

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
          CO₂ economizado:
          ${log.co2_saved}kg
        </p>

        <p>
          ${log.date}
        </p>

      </div>

    </div>
  `;
}

// ===== RENDERIZAR =====

function renderizarCards(logs) {
  if (logs.length === 0) {
    emptyState.classList.remove("hidden");

    containerAtividade.innerHTML = "";

    return;
  }

  emptyState.classList.add("hidden");

  containerAtividade.innerHTML = logs.map(criarCardAtividade).join("");
}

// ===== CARREGAR LOGS =====

async function carregarPagina() {
  const logs = await getUserActivityLogs();

  console.log(logs);

  renderizarCards(logs);
}

// ===== REGISTRAR ATIVIDADE =====

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const activityId = document.getElementById("select-atividade").value;

  const duration = parseFloat(document.getElementById("input-tempo").value);

  // salva no Supabase

  await registerActivity(activityId, duration);

  // recarrega cards

  await carregarPagina();

  // limpa formulário

  form.reset();
});

// ===== INICIAR =====

carregarPagina();
