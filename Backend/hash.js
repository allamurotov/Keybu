const argon2 = require('argon2');
async function main() {
  const hash = await argon2.hash('QWERTY');
  console.log('HASH:', hash);
}
main();
