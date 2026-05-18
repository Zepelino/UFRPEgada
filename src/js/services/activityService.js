import { supabase } from "./supabaseClient.js";

// ==========================
// BUSCAR LOGS DO USUÁRIO
// ==========================
export async function getUserActivityLogs() {
  // Usuário atual
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Usuário não autenticado no Supabase.");
    return [];
  }

  // Busca logs + atividade relacionada usando explicitamente a FK activity_id
  const { data, error } = await supabase
    .from("activity_logs")
    .select(`
      *,
      activities:activity_id (
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

  // Transforma e normaliza os dados
  return data.map((log) => {
    const inicio = new Date(log.inicio);
    const fim = new Date(log.fim);

    // Duração em horas
    const duracao = (fim - inicio) / 1000 / 60 / 60;

    // Garantindo a leitura mesmo se o Supabase retornar como Array ou Objeto
    const atividade = Array.isArray(log.activities) 
      ? log.activities[0] 
      : log.activities;

    // Caso ainda venha nulo, vamos exibir o ID para te ajudar a debugar no site
    const descricao = atividade ? atividade.descricao : `ID não encontrado (${log.activity_id})`;
    const consumoPorHora = atividade ? atividade.consumo_por_hora : 0;

    // Cálculo CO₂
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
  // Usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Não foi possível registrar: usuário não autenticado.");
    return;
  }

  // Horário atual
  const inicio = new Date();

  // Calcula o horário de fim baseado na duração informada
  const fim = new Date(inicio.getTime() + duration * 60 * 60 * 1000);

  // Salva o log no banco
  const { error } = await supabase.from("activity_logs").insert([
    {
      user_id: user.id,
      activity_id: activityId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    },
  ]);

  if (error) {
    console.error("Erro ao inserir nova atividade no Supabase:", error);
  }
}