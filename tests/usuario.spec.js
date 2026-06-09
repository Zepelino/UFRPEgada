const { test, expect } = require("@playwright/test");

const loginTeste = require("./helpers/loginteste");

test.describe("Perfil do Usuário", () => {
  test("Carregar informações do usuário", async ({ page }) => {
    await loginTeste(page);

    await page.goto("/usuario.html");

    await expect(page.locator("#user-name")).not.toContainText("Carregando");

    await expect(page.locator("#user-email")).toContainText(
      "ufrpegadateste@gmail.com",
    );
  });
});
