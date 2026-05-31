import { supabase } from "./supabaseClient.js";

// LOGIN
export async function login(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// CADASTRO
export async function register(email, password, nome) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return { error };

  const user = data.user;

  // cria perfil no BD
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: user.id,
      nome: nome,
      pegada_total: 0,
    },
  ]);

  if (profileError) {
    console.error(profileError);
    return { error: profileError };
  }

  return { data };
}

// USUÁRIO ATUAL
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// LOGOUT
export async function logout() {
  return await supabase.auth.signOut();
}

// PERFIL DO USUÁRIO
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  // LÓGICA DE DECAY (Inatividade)
  if (data.ultima_atividade) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar só o dia
    
    // Traz a data salva do banco ajustada para evitar bugs de fuso horário
    const [ano, mes, dia] = data.ultima_atividade.split('-');
    const ultimaAtiv = new Date(ano, mes - 1, dia); 
    ultimaAtiv.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(hoje - ultimaAtiv);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Se passou de 3 dias de ausência, penaliza
    if (diffDays > 3) {
      const diasPenalizados = diffDays - 3;
      const penalidade = diasPenalizados * 5; // Perde 5 pontos por dia extra de sumiço
      let novoXP = (data.pegada_total || 0) - penalidade;
      
      if (novoXP < 0) novoXP = 0; // O nível mínimo de pontos é 0

      // Atualiza o banco silenciosamente e zera a ofensiva
      await supabase.from("profiles").update({
        pegada_total: novoXP,
        streak: 0 
      }).eq("id", user.id);

      // Atualiza os dados locais para a tela puxar correto
      data.pegada_total = novoXP;
      data.streak = 0;
    }
  }

  return {
    user,
    profile: data,
  };
}