import { register } from "../services/authService.js";
import "/src/js/folhas.js";

const form = document.getElementById("register-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  // Mostrar loading no botão
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Enviando...";
  submitButton.disabled = true;
  
  const { data, error } = await register(email, password, nome);
  
  // Restaurar botão
  submitButton.textContent = originalText;
  submitButton.disabled = false;
  
  if (error) {
    // Mostrar erro na tela
    if (errorMessage) {
      errorMessage.textContent = error.message || "Erro ao criar conta";
      errorMessage.style.display = "block";
    } else {
      alert(error.message);
    }
    return; // NÃO redireciona
  }
  
  // Sucesso - redirecionar
  if (data) {
    window.location.href = "autenticar.html";
  }
});