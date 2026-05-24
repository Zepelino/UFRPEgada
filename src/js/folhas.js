// ===== ANIMAÇÃO DE FOLHAS CAINDO =====
function criarFolha() {
  const leavesContainer = document.getElementById("leaves-container");
  if (!leavesContainer) return;
  
  const leaf = document.createElement("div");
  leaf.classList.add("leaf");
  
  // Diferentes tipos de folhas
  const folhas = ["🍂", "🍃"];
  const emojiAleatorio = folhas[Math.floor(Math.random() * folhas.length)];
  leaf.textContent = emojiAleatorio;
  
  // Posição horizontal aleatória
  const leftPosition = Math.random() * 100;
  leaf.style.left = `${leftPosition}%`;
  
  // Tamanho variável: 0.5x a 1.5x do tamanho base (84px)
  const scale = 0.5 + Math.random() * 1.0;
  const baseSize = 28;
  const finalSize = baseSize * scale;
  leaf.style.fontSize = `${finalSize}px`;
  
  // Escolher animação aleatória
  const random = Math.random();
  let animationName;
  
  if (random < 0.33) {
    animationName = "fall"; // Neutra
  } else if (random < 0.66) {
    animationName = "fall-right"; // Leve para direita
  } else {
    animationName = "fall-far-right"; // Muito para direita
  }
  
  leaf.style.animationName = animationName;
  
  // Duração da animação
  const duration = 10 + Math.random() * 8;
  leaf.style.animationDuration = `${duration}s`;
  
  // Delay aleatório
  const delay = Math.random() * 5;
  leaf.style.animationDelay = `${delay}s`;
  
  // Opacidade
  const baseOpacity = 0.2 + Math.random() * 0.3;
  leaf.style.opacity = baseOpacity;
  
  // Adiciona ao container
  leavesContainer.appendChild(leaf);
  
  // Remove após animação
  setTimeout(() => {
    if (leaf.parentNode) {
      leaf.parentNode.removeChild(leaf);
    }
  }, (duration + delay) * 1000);
}

function iniciarQuedaFolhas() {
  // Folhas iniciais
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      criarFolha();
    }, i * 2000);
  }
  
  // Continuar criando folhas
  setInterval(() => {
    if (Math.random() < 0.6) {
      criarFolha();
    }
  }, 3500);
}

// Iniciar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  iniciarQuedaFolhas();
});