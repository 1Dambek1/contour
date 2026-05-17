import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Provider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Контур Доверия",
  description: "Система этического комплаенса",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body
        className={`${inter.className} min-h-screen flex flex-col relative`}
      >
        <Providers>
          <Navbar />
          <main className="flex-grow pt-16 relative z-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
