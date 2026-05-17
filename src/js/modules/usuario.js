console.log("usuario.js carregado");

import { getUser } from "../services/authService.js";

import { getProfile } from "../services/authService.js";

import { getUserActivityLogs } from "../services/activityService.js";

const containerAtividade = document.getElementById("activity-container");

const emptyState = document.getElementById("empty-state");

function criarCardAtividade(log) {
  return `
    <div class="activity-card">

      <h3>
        ${log.activity_name}
      </h3>

      <p>
        Duração: ${log.duration}h
      </p>

      <p>
        CO₂ economizado:
        ${log.co2_saved}kg
      </p>

      <p>
        Data: ${log.date}
      </p>

    </div>
  `;
}

function renderizarCardAtividade(logs) {
  if (logs.length === 0) {
    emptyState.classList.remove("hidden");

    return;
  }

  emptyState.classList.add("hidden");

  containerAtividade.innerHTML = logs.map(criarCardAtividade).join("");
}

async function carregarUsuario() {
  const dados = await getProfile();

  console.log(dados);

  if (!dados) return;

  const { user, profile } = dados;

  // NOME

  document.getElementById("user-name").textContent = profile.nome;

  // EMAIL

  document.getElementById("user-email").textContent = user.email;

  // AVATAR

  document.getElementById("user-avatar").textContent =
    profile.nome[0].toUpperCase();

  // PONTUAÇÃO

  document.getElementById("user-score").textContent =
    `${profile.pegada_total || 0} pts`;
}

async function carregarPagina() {
  await carregarUsuario();

  const logs = await getUserActivityLogs();

  renderizarCardAtividade(logs);

  document.getElementById("user-activities").textContent = logs.length;
}

carregarPagina();
