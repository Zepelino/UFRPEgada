console.log("usuario.js carregado com sucesso (Versão 4 - Com Badges)!");

// Importando os serviços
import { getProfile } from "../services/authService.js";
import { getUserActivityLogs } from "../services/activityService.js";

// Elementos Atividades
const containerAtividade = document.getElementById("activity-container");
const emptyState = document.getElementById("empty-state");

// Elementos Gamificação e Badges
const levelName = document.getElementById("user-level-name");
const xpBarFill = document.getElementById("xp-bar-fill");
const xpText = document.getElementById("xp-text");
const xpHint = document.getElementById("xp-hint");

const streakBadge = document.getElementById("user-streak");
const activitiesBadge = document.getElementById("user-activities");
const scoreBadge = document.getElementById("user-total-score");

// Elementos Modal
const modal = document.getElementById("xp-modal");
const btnAbrirModal = document.getElementById("btn-historico-xp");
const btnFecharModal = document.getElementById("close-modal");
const listaXP = document.getElementById("xp-history-list");

// ===== EMOJIS =====
function obterEmoji(nome) {
  if (!nome) return "🌱";
  if (nome.includes("Banho")) return "🚿";
  if (nome.includes("Desktop") || nome.includes("Computador") || nome.includes("Notebook") || nome.includes("Gamer")) return "🖥️";
  if (nome.includes("Ar") || nome.includes("Ventilador")) return "❄️";
  if (nome.includes("Secador") || nome.includes("Ferro") || nome.includes("Secadora")) return "🔥";
  if (nome.includes("Voo")) return "✈️";
  if (nome.includes("Carro") || nome.includes("Moto") || nome.includes("Ônibus")) return "🚗";
  if (nome.includes("Plantar") || nome.includes("Árvore") || nome.includes("Bicicleta") || nome.includes("Pé")) return "🌲";
  return "🌱";
}

// ===== CRIAR CARD COM O VISUAL ORIGINAL =====
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

// ===== MATEMÁTICA DE NÍVEL E XP =====
function calcularProgressoXP(xpTotal) {
  const niveis = [
    { nome: "Eco Iniciante", max: 100, cor: "#9E9E9E" },
    { nome: "Eco Aprendiz", max: 350, cor: "#81C784" },
    { nome: "Eco Praticante", max: 800, cor: "#4CAF50" },
    { nome: "Eco Especialista", max: 1500, cor: "#388E3C" },
    { nome: "Eco Embaixador", max: 2500, cor: "#00695C" },
    { nome: "Mestre Sustentável", max: 99999, cor: "#FFB300" }
  ];

  let nivelAtual = niveis[0];
  let xpBase = 0;

  for (let i = 0; i < niveis.length; i++) {
    if (xpTotal < niveis[i].max) {
      nivelAtual = niveis[i];
      xpBase = i === 0 ? 0 : niveis[i - 1].max;
      break;
    }
  }

  // Teto máximo
  if (xpTotal >= 2500) {
    return { nivel: niveis[5], porcentagem: 100, atual: xpTotal, max: "MAX", faltam: 0 };
  }

  const xpDentro = xpTotal - xpBase;
  const tamanhoNivel = nivelAtual.max - xpBase;
  const porcentagem = (xpDentro / tamanhoNivel) * 100;

  return {
    nivel: nivelAtual,
    porcentagem: Math.round(porcentagem),
    atual: xpTotal,
    max: nivelAtual.max,
    faltam: nivelAtual.max - xpTotal
  };
}

// ===== PREENCHER MODAL DE EXTRATO =====
function preencherModalXP(logs) {
  if (!listaXP) return;
  
  if (logs.length === 0) {
    listaXP.innerHTML = "<p style='text-align:center; color:#666;'>Nenhum XP ganho ainda.</p>";
    return;
  }

  // Gera o histórico simulando os ganhos com base na emissão
  const html = logs.map(log => {
    const isZeroCarbon = parseFloat(log.co2_saved) === 0;
    const pontos = isZeroCarbon ? 25 : 5; // 25 pra zero emissão, 5 base
    const motivo = isZeroCarbon ? "Emissão Zero 🌿" : "Registro de Rotina 📝";
    
    return `
      <div class="xp-history-item">
        <div class="xp-history-details">
          <span class="xp-history-title">${log.activity_name}</span>
          <span class="xp-history-date">${log.date} • ${motivo}</span>
        </div>
        <span class="xp-points">+${pontos} XP</span>
      </div>
    `;
  }).join("");

  listaXP.innerHTML = html;
}

// ===== EVENTOS DO MODAL =====
if (btnAbrirModal) btnAbrirModal.addEventListener("click", () => modal.classList.remove("hidden"));
if (btnFecharModal) btnFecharModal.addEventListener("click", () => modal.classList.add("hidden"));
// Fechar clicando fora da caixa
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// ===== INICIALIZAR PÁGINA =====
async function carregarPagina() {
  try {
    // 1. Puxar Dados do Supabase
    const dadosPerfil = await getProfile();
    const logs = await getUserActivityLogs();

    // 2. Preencher Perfil Básico e Badges
    if (dadosPerfil) {
      const { user, profile } = dadosPerfil;
      document.getElementById("user-name").textContent = profile.nome;
      document.getElementById("user-email").textContent = user.email;
      
      if (profile.nome) {
        document.getElementById("user-avatar").textContent = profile.nome[0].toUpperCase();
      }

      // Preenche as Badges (Pílulas)
      const xpTotal = profile.pegada_total || 0;
      if (streakBadge) streakBadge.textContent = profile.streak || 0;
      if (scoreBadge) scoreBadge.textContent = xpTotal;
      if (activitiesBadge) activitiesBadge.textContent = logs.length || 0;

      // 3. Atualizar Barra de XP
      const progresso = calcularProgressoXP(xpTotal);
      
      if (levelName) {
        levelName.textContent = progresso.nivel.nome;
        levelName.style.color = progresso.nivel.cor;
      }
      
      if (xpBarFill) {
        // Um pequeno delay para a barra encher animada após a tela carregar
        setTimeout(() => {
          xpBarFill.style.width = `${progresso.porcentagem}%`;
          xpBarFill.style.background = progresso.nivel.cor;
        }, 300);
      }

      if (xpText) xpText.textContent = `${progresso.atual} / ${progresso.max} XP`;
      if (xpHint) {
        xpHint.textContent = progresso.max === "MAX" 
          ? "Você atingiu o nível máximo!" 
          : `Faltam ${progresso.faltam} XP para o próximo nível.`;
      }
    }

    // 4. Renderizar Atividades e Modal
    renderizarCardAtividade(logs);
    preencherModalXP(logs);

  } catch (erro) {
    console.error("Erro ao carregar os dados do usuário:", erro);
  }
}

// Executar
carregarPagina();