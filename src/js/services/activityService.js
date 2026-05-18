import { supabase } from "./supabaseClient.js";

// ==========================
// BUSCAR LOGS DO USUÁRIO
// ==========================

export async function getUserActivityLogs() {
  // usuário atual

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Usuário não autenticado");

    return [];
  }

  // busca logs + atividade relacionada

  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      `
        *,
        activities:activity_id (
          descricao,
          consumo_por_hora
        )
      `,
    )
    .eq("user_id", user.id)
    .order("inicio", {
      ascending: false,
    });

  if (error) {
    console.error(error);

    return [];
  }

  // transforma os dados

  return data.map((log) => {
    const inicio = new Date(log.inicio);

    const fim = new Date(log.fim);

    // duração em horas

    const duracao = (fim - inicio) / 1000 / 60 / 60;

    // cálculo CO₂

    const co2 = duracao * log.activities.consumo_por_hora;

    return {
      activity_name: log.activities.descricao,

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
  // usuário atual

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Usuário não autenticado");

    return;
  }

  // horário atual

  const inicio = new Date();

  // calcula fim

  const fim = new Date(inicio.getTime() + duration * 60 * 60 * 1000);

  // salva log

  const { error } = await supabase.from("activity_logs").insert([
    {
      user_id: user.id,

      activity_id: activityId,

      inicio: inicio.toISOString(),

      fim: fim.toISOString(),
    },
  ]);

  if (error) {
    console.error(error);
  }
}
