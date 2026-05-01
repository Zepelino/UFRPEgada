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
    password
  });

  if (error) return { error };

  const user = data.user;

  // cria perfil no BD
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        id: user.id,
        nome: nome,
        pegada_total: 0
      }
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
