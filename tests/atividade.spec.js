const { test, expect } = require("@playwright/test");

const loginTeste = require("./helpers/loginteste");

const criarAtividade = require("./helpers/criarAtividade");

test.describe("RF04 - Registrar Atividade", () => {
  test("Registrar atividade válida", async ({ page }) => {
    await loginTeste(page);

    await criarAtividade(page);

    await expect(page.locator("#feedback-section")).toBeVisible();
  });
});
