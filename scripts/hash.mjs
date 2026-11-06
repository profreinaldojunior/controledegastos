import bcrypt from "bcryptjs";
const p = process.argv[2];
if (!p) { console.error('Uso: npm run hash -- "sua-senha"'); process.exit(1); }
console.log(bcrypt.hashSync(p, 12));
