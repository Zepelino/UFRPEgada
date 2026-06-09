async function logout(page) {
  await page.click("#btn-logout");
}

module.exports = logout;
