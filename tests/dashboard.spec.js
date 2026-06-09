const { test, expect } = require("@playwright/test");

const loginTeste = require("./helpers/loginteste");

const criarAtividade = require("./helpers/criarAtividade");

test.describe("RF05 - Dashboard", () => {
  test("Exibir log diário", async ({ page }) => {
    await loginTeste(page);

    await criarAtividade(page, "2cd9074c-bf8d-488a-a2d0-939657522612", "1");

    await page.goto("/dashboard.html");

    await expect(page.locator("#dashboard-lista-atividades")).toBeVisible();

    await expect(page.locator("#dashboard-lista-atividades")).not.toContainText(
      "Carregando atividades...",
    );
  });
});
