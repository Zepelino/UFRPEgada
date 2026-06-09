const { test, expect } = require("@playwright/test");

test.describe("RF01 - Cadastro", () => {
  test("Cadastrar usuário", async ({ page }) => {
    await page.goto("/cadastro.html");

    const email = `teste${Date.now()}@email.com`;

    await page.fill("#nome", "Usuário Automação");

    await page.fill("#email", email);

    await page.fill("#password", "Abc123!@");

    await page.locator('button[type="submit"]').click();

    await expect(page.locator("#error-message")).not.toContainText(/erro/i);
  });
});
