console.log("dashboard.js (Log Diário com Filtro) carregado com sucesso!");

import { getUserActivityLogs } from "../services/activityService.js";

// ===== ELEMENTOS DO HTML =====
const totalCo2Element = document.getElementById("valor-emissao-total");
const totalAtividadesElement = document.getElementById("total-atividades-contador");
const listaUltimasAtividades = document.getElementById("dashboard-lista-atividades");
const seletorData = document.getElementById("filtro-data-diario");

// Variável global temporária para guardar todos os logs carregados do banco
let todosOsLogs = [];

// ===== FUNÇÃO PARA DEFINIR EMOJIS =====
function obterEmoji(nome) {
  let emoji = "🌱";
  if (nome.includes("Banho")) emoji = "🚿";
  if (nome.includes("Desktop") || nome.includes("Computador")) emoji = "🖥️";
  if (nome.includes("Ar")) emoji = "❄️";
  return emoji;
}

// ===== RENDERIZAR O LOG DE UM DIA ESPECÍFICO =====
function renderizarLogDoDia(dataSelecionadaISO) {
  if (!listaUltimasAtividades) return;

  // O input do tipo 'date' retorna "AAAA-MM-DD". Vamos converter para o padrão pt-BR "DD/MM/AAAA"
  const [ano, mes, dia] = dataSelecionadaISO.split("-");
  const dataFormatadaBR = `${dia}/${mes}/${ano}`;

  // Filtra as atividades que correspondem exatamente à data selecionada
  const logsDoDia = todosOsLogs.filter(log => log.date === dataFormatadaBR);

  // Se não houver atividades nesse dia
  if (logsDoDia.length === 0) {
    listaUltimasAtividades.innerHTML = `
      <p style="color: #777; padding: 20px 10px; text-align: center; font-style: italic;">
        Nenhuma atividade registrada em ${dataFormatadaBR}.
      </p>
    `;
    return;
  }

  // Calcula o total de CO2 emitido especificamente neste dia filtrado
  const totalCo2DoDia = logsDoDia.reduce((total, log) => total + parseFloat(log.co2_saved), 0);

  // Monta o mini cabeçalho do resumo do dia
  const resumoDiaHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f4f6f4; padding: 10px 14px; border-radius: 6px; font-weight: bold; color: #2e5932; margin-bottom: 12px; font-size: 0.95em;">
      <span>Resultados de ${dataFormatadaBR}</span>
      <span style="color: #444;">Total: ${totalCo2DoDia.toFixed(2)} kg CO₂</span>
    </div>
  `;

  // Mapeia e gera o HTML de cada atividade com a classe original do CSS
  const itensHTML = logsDoDia.map(log => {
    const emoji = obterEmoji(log.activity_name);
    return `
      <div class="activity-item" style="border-bottom: 1px dashed #eee; padding: 10px 5px;">
          <span>${emoji} ${log.activity_name}</span>
          <span style="font-size: 0.9em; color: #666;">${log.duration}h (${log.co2_saved} kg)</span>
      </div>
    `;
  }).join("");

  // Injeta o bloco completo no container
  listaUltimasAtividades.innerHTML = resumoDiaHTML + itensHTML;
}

// ===== CONFIGURAR DATA INICIAL (HOJE) =====
function configurarDataHoje() {
  if (!seletorData) return;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  // Garante o zero à esquerda se for menor que 10 (ex: 05 em vez de 5)
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  // Define o valor do input para o formato exigido: "AAAA-MM-DD"
  seletorData.value = `${ano}-${mes}-${dia}`;
}

// ===== INICIALIZAR INFORMAÇÕES DO DASHBOARD =====
async function inicializarDashboard() {
  console.log("Buscando dados gerais do banco...");
  
  // 1. Define a data padrão como 'hoje' no input
  configurarDataHoje();

  // 2. Busca todos os registros históricos do usuário
  todosOsLogs = await getUserActivityLogs();
  
  // 3. Se o banco não retornar nada (Usuário novo sem histórico)
  if (!todosOsLogs || todosOsLogs.length === 0) {
    if (totalCo2Element) totalCo2Element.innerText = "0.00 kg CO₂";
    if (totalAtividadesElement) totalAtividadesElement.innerText = "0";
    if (listaUltimasAtividades) {
      listaUltimasAtividades.innerHTML = '<p style="color: #666; padding: 10px;">Nenhum registro encontrado no sistema.</p>';
    }
    return;
  }

  // 4. CÁLCULOS DOS ACUMULADOS GERAIS (Cards superiores) 🧮
  const somaCo2Geral = todosOsLogs.reduce((total, log) => total + parseFloat(log.co2_saved), 0);
  const quantidadeAtividadesGeral = todosOsLogs.length;

  if (totalCo2Element) totalCo2Element.innerText = `${somaCo2Geral.toFixed(2)} kg CO₂`;
  if (totalAtividadesElement) totalAtividadesElement.innerText = quantidadeAtividadesGeral;

  // 5. Executa a primeira renderização filtrando pelo dia padrão (hoje)
  renderizarLogDoDia(seletorData.value);
}

// ===== LISTENER PARA MUDANÇA DE DATA SELECIONADA =====
if (seletorData) {
  seletorData.addEventListener("change", (e) => {
    console.log("Data alterada para:", e.target.value);
    // Recarrega a listagem filtrando com a nova data escolhida pelo usuário
    renderizarLogDoDia(e.target.value);
  });
}

// ===== EXECUTAR AO CARREGAR A PÁGINA =====
inicializarDashboard();