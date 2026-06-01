console.log("usuario.js carregado com sucesso (Versão 7 - Botão de Regras/Elos)!");

// Importando os serviços
import { getProfile, getLeaderboard, logout } from "../services/authService.js";
import { getUserActivityLogs } from "../services/activityService.js";

// Elementos Gamificação e Badges
const levelName = document.getElementById("user-level-name");
const xpBarFill = document.getElementById("xp-bar-fill");
const xpText = document.getElementById("xp-text");
const xpHint = document.getElementById("xp-hint");

const streakCard = document.getElementById("user-streak-card");
const activitiesCard = document.getElementById("user-activities-card");
const scoreCard = document.getElementById("user-score-card");

const rankingPosition = document.getElementById("user-ranking-position");
const rankingTotal = document.getElementById("user-ranking-total");
const rankingCardBtn = document.getElementById("ranking-card-btn");
const logoutBtn = document.getElementById("logout-btn");

// Elementos Modal Extrato
const modal = document.getElementById("xp-modal");
const btnAbrirModal = document.getElementById("btn-historico-xp");
const btnFecharModal = document.getElementById("close-modal");
const listaXP = document.getElementById("xp-history-list");

// Elementos Modal Leaderboard
const modalLeaderboard = document.getElementById("leaderboard-modal");
const btnAbrirLeaderboard = document.getElementById("btn-leaderboard");
const btnFecharLeaderboard = document.getElementById("close-leaderboard");
const listaLeaderboard = document.getElementById("leaderboard-list");

// Elementos Modal Regras
const modalRegras = document.getElementById("regras-modal");
const btnAbrirRegras = document.getElementById("btn-info-regras");
const btnFecharRegras = document.getElementById("close-regras");

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

  const html = logs.map(log => {
    const isZeroCarbon = parseFloat(log.co2_saved) === 0;
    const pontos = isZeroCarbon ? 25 : 5;
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

// ===== PREENCHER LEADERBOARD =====
async function preencherLeaderboard() {
  if (!listaLeaderboard) return;

  const jogadores = await getLeaderboard();

  if (!jogadores || jogadores.length === 0) {
    listaLeaderboard.innerHTML = "<p style='text-align:center; color:#666;'>Nenhum jogador encontrado no ranking.</p>";
    return;
  }

  const html = jogadores.map((jogador, index) => {
    let medalha = `${index + 1}º`;
    if (index === 0) medalha = "🥇";
    else if (index === 1) medalha = "🥈";
    else if (index === 2) medalha = "🥉";

    // Usa a função para pegar a cor e o nome do Elo do Jogador
    const infoNivel = calcularProgressoXP(jogador.pegada_total || 0).nivel;

    return `
      <div class="xp-history-item">
        <div style="display:flex; align-items:center; gap: 15px;">
          <span style="font-size: 1.5rem; font-weight: bold; width: 35px; text-align: center; color: #555;">${medalha}</span>
          <div class="xp-history-details">
            <span class="xp-history-title">${jogador.nome || "Anônimo"}</span>
            <span class="xp-history-date" style="color: ${infoNivel.cor}; font-weight: 600;">${infoNivel.nome}</span>
          </div>
        </div>
        <span class="xp-points" style="color: ${infoNivel.cor};">${jogador.pegada_total || 0} pts</span>
      </div>
    `;
  }).join("");

  listaLeaderboard.innerHTML = html;
}

// ===== EVENTOS DOS MODAIS =====

function abrirRanking() {
  modalLeaderboard.classList.remove("hidden");

  if (listaLeaderboard.innerHTML.includes("Carregando")) {
    preencherLeaderboard();
  }
}

// Extrato
if (btnAbrirModal) btnAbrirModal.addEventListener("click", () => modal.classList.remove("hidden"));
if (btnFecharModal) btnFecharModal.addEventListener("click", () => modal.classList.add("hidden"));

// Leaderboard
if (btnAbrirLeaderboard) {
  btnAbrirLeaderboard.addEventListener("click", abrirRanking);
}

if (rankingCardBtn) {
  rankingCardBtn.addEventListener("click", abrirRanking);
}
if (btnFecharLeaderboard) btnFecharLeaderboard.addEventListener("click", () => modalLeaderboard.classList.add("hidden"));

// Regras e Elos
if (btnAbrirRegras) btnAbrirRegras.addEventListener("click", () => modalRegras.classList.remove("hidden"));
if (btnFecharRegras) btnFecharRegras.addEventListener("click", () => modalRegras.classList.add("hidden"));


// Fechar clicando fora da caixa de qualquer um deles
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
  if (e.target === modalLeaderboard) modalLeaderboard.classList.add("hidden");
  if (e.target === modalRegras) modalRegras.classList.add("hidden");
});

//logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await logout();
    window.location.href = "index.html";
  });
}

// ===== INICIALIZAR PÁGINA =====
async function carregarPagina() {
  try {
    const dadosPerfil = await getProfile();
    const logs = await getUserActivityLogs(); // Ainda precisamos dos logs para o extrato e os insights

    if (dadosPerfil) {
      const { user, profile } = dadosPerfil;
      document.getElementById("user-name").textContent = profile.nome;
      document.getElementById("user-email").textContent = user.email;

      if (profile.nome) {
        document.getElementById("user-avatar").textContent = profile.nome[0].toUpperCase();
      }

      const leaderboard = await getLeaderboard();
      
      console.log("Primeiro jogador:", leaderboard[0]);
      console.log("User:", user);

      const xpTotal = profile.pegada_total || 0;
      const streak = profile.streak || 0;
      const totalActivities = logs.length || 0;

      if (streakCard) streakCard.textContent = `${streak} dias`;
      if (scoreCard) scoreCard.textContent = `${xpTotal} pts`;
      if (activitiesCard) activitiesCard.textContent = totalActivities;

      const progresso = calcularProgressoXP(xpTotal);

      if (levelName) {
        levelName.textContent = progresso.nivel.nome;
        levelName.style.color = progresso.nivel.cor;
      }

      if (xpBarFill) {
        setTimeout(() => {
          xpBarFill.style.width = `${progresso.porcentagem}%`;
          xpBarFill.style.background = progresso.nivel.cor;
        }, 300);
      }

      if (leaderboard && rankingPosition && rankingTotal) {

        const posicao = leaderboard.findIndex(
          jogador => jogador.id === user.id
        ) + 1;

        if (posicao > 0) {
          rankingPosition.textContent = `${posicao}º`;
          rankingTotal.textContent = `entre ${leaderboard.length} usuários`;
        } else {
          rankingPosition.textContent = "--";
          rankingTotal.textContent = "posição indisponível";
        }
      }

      if (xpText) xpText.textContent = `${progresso.atual} / ${progresso.max} XP`;
      if (xpHint) {
        xpHint.textContent = progresso.max === "MAX"
          ? "Você atingiu o nível máximo!"
          : `Faltam ${progresso.faltam} XP para o próximo nível.`;
      }
    }

    preencherModalXP(logs);

    // Insights dos colegas!
    const insights = gerarInsights(logs);
    renderizarInsights(insights);

  } catch (erro) {
    console.error("Erro ao carregar os dados do usuário:", erro);
  }
}

// ===== SISTEMA DE INSIGHTS (INTACTO) =====
function gerarInsights(logs) {
  if (!logs || logs.length < 3) return [];

  const resultados = [];
  const grupos = agruparPorAtividade(logs);
  const totalCO2 = grupos.reduce((s, g) => s + g.co2, 0);

  if (grupos.length > 0 && totalCO2 > 0) {
    const maior = grupos.sort((a, b) => b.co2 - a.co2)[0];
    const porcentagem = (maior.co2 / totalCO2) * 100;

    if (porcentagem > 25) {
      resultados.push({
        tipo: porcentagem > 45 ? 'alta' : 'media',
        icone: obterEmoji(maior.nome),
        titulo: `${maior.nome} é seu maior impacto`,
        mensagem: `Representa ${porcentagem.toFixed(0)}% das suas emissões totais.`,
        sugestao: obterSugestaoAtividade(maior.nome, porcentagem, maior.duracaoTotal / maior.contagem)
      });
    }
  }

  const temPositivas = logs.some(log =>
    ['Plantar', 'Árvore', 'Bicicleta', 'Pé'].some(p => log.activity_name.includes(p))
  );

  if (!temPositivas && logs.length > 5) {
    resultados.push({
      tipo: 'baixa',
      icone: '🌱',
      titulo: 'Que tal ações positivas?',
      mensagem: 'Você registra emissões, mas nenhuma atividade que compensa seu impacto.',
      sugestao: 'Plantar árvores ou usar bicicleta ajudam a equilibrar sua pegada ecológica.'
    });
  }

  const porDia = agruparPorDiaSemana(logs);
  const diasComDados = porDia.filter(d => d.total > 0);

  if (diasComDados.length >= 3) {
    const media = diasComDados.reduce((s, d) => s + d.total, 0) / diasComDados.length;
    const piorDia = diasComDados.sort((a, b) => b.total - a.total)[0];

    if (piorDia.total > media * 1.4) {
      const acima = ((piorDia.total / media - 1) * 100).toFixed(0);
      resultados.push({
        tipo: 'media',
        icone: '📅',
        titulo: `${piorDia.nome} é seu dia mais intenso`,
        mensagem: `Emite ${acima}% mais que sua média diária.`,
        sugestao: 'Tente distribuir melhor suas atividades ao longo da semana.'
      });
    }
  }

  for (const grupo of grupos) {
    const duracaoMedia = grupo.duracaoTotal / grupo.contagem;

    const limites = {
      'Banho': 0.5, 'Desktop': 5, 'Gamer': 4, 'Notebook': 5,
      'Ar-condicionado': 8, 'Secador': 0.3, 'Ferro': 0.5, 'Secadora': 1.5
    };

    const limite = Object.entries(limites).find(([k]) => grupo.nome.includes(k));

    if (limite && duracaoMedia > limite[1] && grupo.contagem >= 2) {
      resultados.push({
        tipo: 'media',
        icone: '⏱️',
        titulo: `${grupo.nome}: uso prolongado`,
        mensagem: `Média de ${duracaoMedia.toFixed(1)}h por sessão.`,
        sugestao: `Tente reduzir para cerca de ${limite[1]}h. Pequenas pausas fazem diferença.`
      });
      break;
    }
  }

  return resultados.slice(0, 3);
}

function agruparPorAtividade(logs) {
  const grupos = {};
  logs.forEach(log => {
    const nome = log.activity_name;
    if (!grupos[nome]) {
      grupos[nome] = { nome, co2: 0, duracaoTotal: 0, contagem: 0 };
    }
    grupos[nome].co2 += parseFloat(log.co2_saved || 0);
    grupos[nome].duracaoTotal += parseFloat(log.duration || 0);
    grupos[nome].contagem++;
  });
  return Object.values(grupos);
}

function agruparPorDiaSemana(logs) {
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const grupos = {};

  logs.forEach(log => {
    const [dia, mes, ano] = log.date.split('/');
    const data = new Date(ano, mes - 1, dia);
    const nomeDia = diasSemana[data.getDay()];

    if (!grupos[nomeDia]) {
      grupos[nomeDia] = { nome: nomeDia, total: 0, contagem: 0 };
    }
    grupos[nomeDia].total += parseFloat(log.co2_saved || 0);
    grupos[nomeDia].contagem++;
  });

  return Object.values(grupos);
}

function obterSugestaoAtividade(nome, porcentagem, duracaoMedia) {
  const sugestoes = {
    'Banho': [
      'Cada minuto a menos economiza 0,5kg de CO₂. Um timer no celular pode ajudar! ⏱️',
      'Temperatura morna gasta 30% menos energia e faz bem pra pele. Experimenta! 🚿',
      'Desligar o chuveiro enquanto se ensaboa já reduz bastante o consumo. 🔄'
    ],
    'Desktop': [
      'Configure o modo de economia de energia após 10 minutos parado. ⚡',
      'Pausas a cada 2h reduzem o consumo e o cansaço visual. 👁️',
      'Brilho da tela em 70% economiza energia e protege seus olhos. 💻'
    ],
    'Gamer': [
      'Pausas a cada 2h de jogo ajudam suas costas e o planeta. 🎮',
      'Modo economia do console reduz consumo fora dos jogos pesados. ⚙️',
      'Intercale com atividades ao ar livre. Seu corpo agradece! 🌳'
    ],
    'Notebook': [
      'Use na bateria até 20% antes de carregar. Economiza energia! 🔋',
      'Feche abas que não está usando. Menos processamento = menos consumo. 💻'
    ],
    'Ar-condicionado': [
      '23°C já é confortável e gasta bem menos. Testa aí! 🌡️',
      'Ventilador gasta 90% menos energia. Combine os dois! 💨',
      'Fechar portas e janelas melhora a eficiência do ar. 🚪'
    ],
    'Secador': [
      'Toalha de microfibra seca o cabelo mais rápido e reduz o uso do secador. 💇',
      'Deixe secar naturalmente até 70% e só finalize com secador. 🌬️'
    ],
    'Ferro': [
      'Acumule roupas e passe tudo de uma vez. Economiza energia! 👔',
      'Aproveite o calor residual: desligue e passe as últimas peças. 🔌'
    ],
    'Secadora': [
      'Varal no sol é grátis e deixa a roupa cheirosa. ☀️',
      'Centrifugação extra na lava e seca reduz o tempo de secadora. 🔄'
    ],
    'Carro': [
      'Pneus calibrados reduzem o consumo em até 5%. 🛞',
      'Combinar várias tarefas em uma saída reduz as emissões. 🗺️',
      'Carona compartilhada divide o impacto (e o custo). 🤝'
    ],
    'Moto': [
      'Calibrar pneus regularmente reduz o consumo de combustível. 🛞',
      'Rotas mais curtas ou combinar trajetos ajuda a reduzir emissões. 🗺️'
    ],
    'Voo': [
      'Voos diretos emitem menos que com escalas. ✈️',
      'Compense as emissões plantando árvores após cada viagem. 🌳'
    ],
    'Ônibus': [
      'Ônibus é uma ótima escolha coletiva! Continue assim. 🚌',
      'Fora do horário de pico, o ônibus anda mais e polui menos. ⏰'
    ]
  };

  const categoria = Object.keys(sugestoes).find(k => nome.includes(k));
  if (!categoria) return 'Pequenas mudanças nessa atividade podem reduzir seu impacto.';

  const lista = sugestoes[categoria];
  const indice = Math.floor((porcentagem * duracaoMedia * 7) % lista.length);
  return lista[indice] || lista[0];
}

function renderizarInsights(insights) {
  const container = document.getElementById('insights-container');
  if (!container) return;

  if (insights.length === 0) {
    container.innerHTML = `
            <div class="insights-empty">
                <p>🌱 Registre mais atividades para receber insights personalizados!</p>
                <p style="font-size: 0.85rem; margin-top: 6px;">Precisamos de pelo menos 3 registros para analisar seus padrões.</p>
            </div>
        `;
    return;
  }

  const html = insights.map(insight => `
        <div class="insight-item ${insight.tipo}">
            <span class="insight-icon">${insight.icone}</span>
            <div class="insight-body">
                <div class="insight-title">${insight.titulo}</div>
                <div class="insight-message">${insight.mensagem}</div>
                <div class="insight-suggestion">💡 ${insight.sugestao}</div>
            </div>
        </div>
    `).join('');

  container.innerHTML = html;
}

// Executar
carregarPagina();