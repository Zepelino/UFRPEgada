import { register } from "../services/authService.js";

const form = document.getElementById("register-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await register(email, password, nome);

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "autenticar.html";
  }
});
