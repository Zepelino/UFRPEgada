async function criarAtividade(
  page,
  atividade = "2cd9074c-bf8d-488a-a2d0-939657522612",
  tempo = "1.5",
) {
  await page.goto("/atividades.html");

  await page.selectOption("#select-atividade", atividade);

  await page.fill("#input-tempo", tempo);

  await page.click(".register-btn");
}

module.exports = criarAtividade;
