import { supabase } from "./supabaseClient.js";

// LOGIN
export async function login(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

// CADASTRO
export async function register(email, password) {
  return await supabase.auth.signUp({
    email,
    password,
  });
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
