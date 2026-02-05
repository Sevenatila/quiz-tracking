const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Remove binaryTargets e output que são específicos do ambiente Abacus
schema = schema.replace(/binaryTargets\s*=\s*\[.*?\]\n?/g, '');
schema = schema.replace(/output\s*=\s*".*?"\n?/g, '');

// Limpa espaços extras
schema = schema.replace(/generator client \{\n\s*provider = "prisma-client-js"\n\s*\n*\}/g, 
  'generator client {\n    provider = "prisma-client-js"\n}');

fs.writeFileSync(schemaPath, schema);
console.log('Prisma schema fixed for deployment');
