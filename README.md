# Financeiro — controle financeiro pessoal

Next.js + Vercel Blob (PRIVATE). Dados em um único `financeiro.json`, acessado só pelo servidor autenticado.

## Rodar no Windows 11
1. Instale Node.js LTS. No terminal da pasta: `npm install`
2. Copie `.env.example` para `.env.local` e preencha (veja abaixo).
3. `npm run dev` → http://localhost:3000

## Variáveis
- `AUTH_PASSWORD_HASH`: `npm run hash -- "sua-senha"` (no `.env.local`, escape os `$` do hash com `\$`; na Vercel cole o valor normal).
- `SESSION_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `BLOB_READ_WRITE_TOKEN`: na Vercel, aba Storage → Create → Blob, escolha acesso **Private** e conecte ao projeto; o token é criado automaticamente. Para rodar local, copie-o para `.env.local` (ou `vercel env pull`).

## GitHub e Vercel
`git init && git add . && git commit -m "inicial"`, crie um repositório vazio no GitHub e faça `git remote add origin <url> && git push -u origin main`. Na Vercel: Add New → Project → importe o repositório, cadastre as 3 variáveis e conecte o Blob Store. `.env*` já está no `.gitignore`.

## Backup
Cada exclusão grava antes uma cópia em `backups/` no Blob. Exportar/importar pela interface vem na próxima etapa.
