import { login } from "../services/authService.js";
import "/src/js/folhas.js"

const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await login(email, password);

  if (error) {
    errorMessage.textContent = error.message;
  } else {
    window.location.href = "usuario.html";
  }
});

