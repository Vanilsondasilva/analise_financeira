import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from "@/core/providers/app-provider";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Engine Pro",
  description: "Plataforma Enterprise de Inteligência em Saúde",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={`${inter.className} h-screen flex flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]`}>
        {/* Envolvemos tudo no AppProviders para ter acesso ao Contexto */}
        <AppProviders>
          
          <div className="flex h-screen overflow-hidden">
            {/* Menu Lateral Fixo */}
            <Sidebar />

            {/* Área de Conteúdo (Navbar + Página) */}
            <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
              <Navbar />
              
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-[#020617]">
                <div className="max-w-[1920px] mx-auto w-full h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>

        </AppProviders>
      </body>
    </html>
  );
}