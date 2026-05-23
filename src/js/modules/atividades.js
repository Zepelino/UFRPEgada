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
const feedbackSection = document.getElementById("feedback-section");
const feedbackMessage = document.getElementById("feedback-message");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackCard = document.getElementById("feedback-card");

// Controle de timers e estado do card
let feedbackTimer = null;
let isCardVisible = false;


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

// ===== ANIMAÇÃO DE GIRO DO ÍCONE =====
function animarGiroIcone(emojiNovo, callback) {
  if (!feedbackIcon) return;
  
  // Remove animação anterior se existir
  feedbackIcon.classList.remove("flipping");
  
  // Força reflow para reiniciar animação
  void feedbackIcon.offsetWidth;
  
  // Adiciona classe de animação
  feedbackIcon.classList.add("flipping");
  
  // Na metade do giro, troca o ícone
  setTimeout(() => {
    feedbackIcon.textContent = emojiNovo;
  }, 400);
  
  // Callback após animação completa
  if (callback) {
    setTimeout(callback, 800);
  }
}

// ===== ATUALIZAR TEXTO DO FEEDBACK =====
function atualizarTextoFeedback(atividadeNome, duracao, co2Emitido) {
  if (!feedbackMessage) return;
  
  const emoji = obterEmoji(atividadeNome);
  const co2Formatado = typeof co2Emitido === 'number' ? co2Emitido.toFixed(2) : '0.00';
  
  feedbackMessage.innerHTML = `
    <h3>✅ Atividade Registrada com Sucesso!</h3>
    <p class="feedback-description">
      Você registrou <strong>${emoji} ${atividadeNome}</strong> 
      por <strong>${duracao} ${duracao > 1 ? 'horas' : 'hora'}</strong>
    </p>
    <div class="feedback-co2-highlight">
      <div class="feedback-co2-icon">💨</div>
      <div class="feedback-co2-info">
        <div class="feedback-co2-label">CO₂ Emitido</div>
        <div class="feedback-co2-value">${co2Formatado} <span class="feedback-co2-unit">kg</span></div>
      </div>
    </div>
  `;
}

// ===== REINICIAR TIMER DE AUTO-OCULTAÇÃO =====
function reiniciarTimer() {
  // Limpar timer existente
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }
  
  // Novo timer de 9 segundos
  feedbackTimer = setTimeout(() => {
    esconderFeedback();
  }, 9000);
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


// ===== MOSTRAR ATIVIDADE ATUAL =====

function mostrarFeedback(atividadeNome, duracao, co2Emitido) {
  if (!feedbackSection || !feedbackMessage || !feedbackIcon) {
    console.error("Elementos de feedback não encontrados");
    return;
  }
  
  const emoji = obterEmoji(atividadeNome);
  
  // Remover classe hiding se existir
  feedbackSection.classList.remove("hiding");
  
  // Configurar ícone inicial como ✅
  feedbackIcon.textContent = "✅";
  feedbackIcon.classList.remove("flipping");
  
  // Atualizar texto do feedback
  atualizarTextoFeedback(atividadeNome, duracao, co2Emitido);
  
  // Mostrar o card com animação de slide
  feedbackSection.classList.remove("hidden");
  isCardVisible = true;
  
  // Scroll suave até o feedback
  setTimeout(() => {
    if (feedbackSection) {
      feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 200);
  
  // Após 1 segundo, girar ícone para o emoji da atividade
  setTimeout(() => {
    animarGiroIcone(emoji);
  }, 1000);
  
  // Configurar timer para esconder
  reiniciarTimer();
}

// ===== Atualizar atividade atual (card já visível) =====
function atualizarFeedbackExistente(atividadeNome, duracao, co2Emitido) {
  if (!feedbackIcon) return;
  
  // Cancelar timer anterior
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  
  const emoji = obterEmoji(atividadeNome);
  
  // Animar ícone: emoji atual → ✅ → novo emoji
  animarGiroIcone("✅", () => {
    // Após virar ✅, espera 300ms e gira para o novo emoji
    setTimeout(() => {
      animarGiroIcone(emoji);
    }, 300);
  });
  
  // Atualizar texto imediatamente (sem animação)
  atualizarTextoFeedback(atividadeNome, duracao, co2Emitido);
  
  // Reiniciar timer
  reiniciarTimer();
}

// ===== Esconder atividade atual =====
function esconderFeedback() {
  if (!feedbackSection) return;
  
  // Limpar timer
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  
  // Adicionar classe para animação de saída
  feedbackSection.classList.add("hiding");
  isCardVisible = false;
  
  // Remover o elemento após a animação terminar
  setTimeout(() => {
    feedbackSection.classList.add("hidden");
    feedbackSection.classList.remove("hiding");
    
    // Resetar o ícone para ✅ para próxima vez
    if (feedbackIcon) {
      feedbackIcon.textContent = "✅";
      feedbackIcon.classList.remove("flipping");
    }
  }, 500);
}
// ===== REGISTRAR ATIVIDADE (MANTIDO IGUAL) =====
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const activityId = selectAtividade.value;
    const durationInput = document.getElementById("input-tempo");
    const duration = parseFloat(durationInput.value);
    
    // Validação detalhada
    if (!activityId) {
      alert("Por favor, selecione uma atividade.");
      return;
    }
    
    if (!durationInput.value || isNaN(duration) || duration <= 0) {
      alert("Por favor, insira um tempo válido maior que zero.");
      return;
    }
    
    try {
        console.log("Tentando registrar:", { activityId, duration });
        
        const resultado = await registerActivity(activityId, duration);
        console.log("Resultado do registro:", resultado);
        
        // Buscar informações da atividade para o feedback
        const atividadeSelecionada = selectAtividade.options[selectAtividade.selectedIndex];
        const atividadeNome = atividadeSelecionada ? atividadeSelecionada.textContent : "Atividade";
        
        // Calcular CO2 baseado no resultado ou estimativa
        let co2Emitido = 0;
        if (resultado && resultado.co2_emitted !== undefined) {
          co2Emitido = resultado.co2_emitted;
        } else if (resultado && resultado.co2_saved !== undefined) {
          co2Emitido = resultado.co2_saved;
        } else {
          // Estimativa básica
          co2Emitido = duration * 0.5;
          console.warn("Usando estimativa de CO2:", co2Emitido);
        }
        
        // Verificar se o card já está visível
        if (isCardVisible) {
          // Atualizar card existente (sem animação de slide)
          atualizarFeedbackExistente(atividadeNome, duration, co2Emitido);
        } else {
          // Mostrar card novo (com animação de slide)
          mostrarFeedback(atividadeNome, duration, co2Emitido);
        }
        
        // Recarregar histórico
        await carregarPagina();
        
        // Limpar formulário
        form.reset();
        
      } catch (error) {
        console.error("Erro detalhado ao registrar:", error);
        alert(`Erro ao registrar atividade: ${error.message || "Tente novamente."}`);
      }
  });
}


carregarPagina();
