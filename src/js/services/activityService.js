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

  const inicio = new Date();
  const fim = new Date(inicio.getTime() + duration * 60 * 60 * 1000);

  const { error } = await supabase.from("activity_logs").insert([
    {
      user_id: user.id,
      activity_id: activityId,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
    },
  ]);

  if (error) console.error("Erro ao inserir atividade:", error);
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
  
  return data;
}