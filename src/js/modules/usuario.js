console.log("usuario.js carregado com sucesso!");

// Importando os seus serviços originais!
import { getProfile } from "../services/authService.js";
import { getUserActivityLogs } from "../services/activityService.js";

const containerAtividade = document.getElementById("activity-container");
const emptyState = document.getElementById("empty-state");

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

// ===== CRIAR CARD COM O NOVO VISUAL =====
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
function renderizarCardAtividade(logs) {
  if (!containerAtividade) return;

  if (logs.length === 0) {
    if (emptyState) emptyState.classList.remove("hidden");
    containerAtividade.innerHTML = "";
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");
  containerAtividade.innerHTML = logs.map(criarCardAtividade).join("");
}

// ===== A SUA LÓGICA ORIGINAL RESTAURADA =====
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
  document.getElementById("user-avatar").textContent = profile.nome[0].toUpperCase();

  // PONTUAÇÃO VERDE
  document.getElementById("user-score").textContent = `${profile.pegada_total || 0} pts`;
}

// ===== INICIALIZAR PÁGINA =====
async function carregarPagina() {
  await carregarUsuario();

  const logs = await getUserActivityLogs();

  renderizarCardAtividade(logs);

  document.getElementById("user-activities").textContent = logs.length;
}

carregarPagina();