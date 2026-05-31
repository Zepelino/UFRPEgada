import { supabase } from "./supabaseClient.js";

// ==========================
// BUSCAR LOGS DO USUÁRIO
// ==========================
export async function getUserActivityLogs() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Usuário não autenticado no Supabase.");
    return [];
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select(`
      *,
      activities (
        descricao,
        consumo_por_hora
      )
    `)
    .eq("user_id", user.id)
    .order("inicio", {
      ascending: false,
    });

  if (error) {
    console.error("Erro na consulta do Supabase:", error);
    return [];
  }

  return data.map((log) => {
    const inicio = new Date(log.inicio);
    const fim = new Date(log.fim);
    const duracao = (fim - inicio) / 1000 / 60 / 60;

    const atividade = Array.isArray(log.activities) 
      ? log.activities[0] 
      : log.activities;

    const descricao = atividade ? atividade.descricao : "Atividade não identificada";
    const consumoPorHora = atividade ? atividade.consumo_por_hora : 0;
    const co2 = duracao * consumoPorHora;

    return {
      activity_name: descricao,
      duration: duracao.toFixed(1),
      co2_saved: co2.toFixed(2),
      date: inicio.toLocaleDateString("pt-BR"),
    };
  });
}

// ==========================
// REGISTRAR NOVA ATIVIDADE
// ==========================
export async function registerActivity(activityId, duration) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("Não foi possível registrar: usuário não autenticado.");
    return;
  }

  // 1. Puxar o perfil atual do usuário e a atividade escolhida
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: activity } = await supabase.from("activities").select("consumo_por_hora").eq("id", activityId).single();

  // 2. Cálculo Base de XP
  let xpGanho = 5; // Todo registro vale pelo menos 5 pontos pelo esforço
  if (activity && activity.consumo_por_hora === 0) {
    xpGanho += 20; // Bônus pesado para opções zero emissão (Bicicleta, Caminhada, etc)
  }

  // 3. Lógica de Tempo e Streak (Ofensiva)
  const hoje = new Date();
  // Formata a data para salvar no padrão do Supabase (YYYY-MM-DD)
  const dataHojeString = hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, '0') + "-" + String(hoje.getDate()).padStart(2, '0');
  
  let novoStreak = profile.streak || 0;
  let xpExtraStreak = 0;

  if (profile.ultima_atividade) {
    // Mesma lógica de tratamento de data para evitar fusos diferentes
    const [ano, mes, dia] = profile.ultima_atividade.split('-');
    const ultima = new Date(ano, mes - 1, dia); 
    
    hoje.setHours(0,0,0,0);
    ultima.setHours(0,0,0,0);
    
    const diffTime = hoje - ultima;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      novoStreak += 1; // Registrou no dia seguinte, aumenta a ofensiva
      if (novoStreak % 3 === 0) xpExtraStreak = 50; // A cada 3 dias seguidos, ganha +50 XP bônus!
    } else if (diffDays > 1) {
      novoStreak = 1; // Quebrou a ofensiva, volta para o dia 1
    }
    // Se diffDays === 0, ele já registrou algo hoje. Apenas mantemos o streak e não damos bônus de streak.
  } else {
    novoStreak = 1; // Primeiro registro da conta
  }

  const xpTotalAtualizado = (profile.pegada_total || 0) + xpGanho + xpExtraStreak;

  // 4. Salvar a atividade no histórico
  const inicio = new Date();
  const fim = new Date(inicio.getTime() + duration * 60 * 60 * 1000);

  await supabase.from("activity_logs").insert([{
    user_id: user.id,
    activity_id: activityId,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
  }]);

  // 5. Atualizar o Perfil com os novos XP, Streak e Data
  await supabase.from("profiles").update({
    pegada_total: xpTotalAtualizado,
    streak: novoStreak,
    ultima_atividade: dataHojeString
  }).eq("id", user.id);
}

// ==========================
// BUSCAR CATÁLOGO DE ATIVIDADES
// ==========================
export async function getActivitiesCatalog() {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("categoria", { ascending: true });

  if (error) {
    console.error("Erro ao buscar catálogo de atividades:", error);
    return [];
  }
  
  return data || [];
}