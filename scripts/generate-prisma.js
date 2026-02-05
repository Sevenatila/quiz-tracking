const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Tentar dar permissão de execução aos binários
const binaries = ['prisma', 'next'];
binaries.forEach(bin => {
  const binPath = path.join(__dirname, `../node_modules/.bin/${bin}`);
  try {
    fs.chmodSync(binPath, '755');
    console.log(`${bin} permissions fixed`);
  } catch (error) {
    console.log(`Could not fix ${bin} permissions:`, error.message);
  }
});

// Executar prisma generate
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('Error generating Prisma client:', error);
    process.exit(1);
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});