import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { AuthModalWrapper } from "@/components/auth/AuthModalWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MinhaVez - Gestão de Filas Digital",
  description: "Sistema de gestão de filas digital para negócios modernos",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/logos/LightLogo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logos/LightLogo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logos/LightLogo.png',
    apple: '/logos/LightLogo.png',
    other: {
      rel: 'icon',
      url: '/logos/LightLogo.png',
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MinhaVez",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white dark:bg-black text-zinc-900 dark:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthModalProvider>
            {children}
            <AuthModalWrapper />
          </AuthModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
