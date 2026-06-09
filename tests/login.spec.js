const { test, expect } = require("@playwright/test");

const usuario = require("./config/testUser");

test.describe("RF02 - Login", () => {
  test("Login válido", async ({ page }) => {
    await page.goto("/login.html");

    await page.fill("#email", usuario.email);

    await page.fill("#password", usuario.senha);

    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/usuario/);
  });
});
