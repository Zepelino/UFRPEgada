const SUPABASE_URL = "https://pvmorobfwvulmhaonzup.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bW9yb2Jmd3Z1bG1oYW9uenVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTg1MDcsImV4cCI6MjA5MzEzNDUwN30.SjHcaUd9XNbhgaAQhf6Mu8knFfRKwj5IsKjusARhz70";

export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
);
