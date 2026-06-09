const usuario = require("../config/testUser");

async function loginTeste(page) {
  await page.goto("/login.html");

  await page.fill("#email", usuario.email);

  await page.fill("#password", usuario.senha);

  await page.locator('button[type="submit"]').click();
}

module.exports = loginTeste;
