import "./globals.css";
export const metadata = { title: "Financeiro", description: "Controle financeiro pessoal" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">{children}</body></html>;
}
