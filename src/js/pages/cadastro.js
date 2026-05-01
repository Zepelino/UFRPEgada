import { register } from "../services/authService.js";

const form = document.getElementById("register-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await register(email, password);

  if (error) {
    errorMessage.textContent = error.message;
  } else {
    alert("Conta criada com sucesso!");
    window.location.href = "login.html";
  }
});
