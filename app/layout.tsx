import type { Metadata } from "next";
// import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

// const playfair = Playfair_Display({
//   variable: "--font-playfair",
//   subsets: ["latin"],
//   style: ["normal", "italic"],
// });

export const metadata: Metadata = {
  title: "Palabra Luminosa - Biblia en Español",
  description: "Explora la Biblia en español con traducciones interactivas y una experiencia de lectura hermosa",
  keywords: ["Biblia", "Español", "Reina-Valera", "RVR60", "Traducción", "Bible", "Spanish"],
  authors: [{ name: "Palabra Luminosa" }],
  openGraph: {
    title: "Palabra Luminosa - Biblia en Español",
    description: "Explora la Biblia en español con traducciones interactivas",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`antialiased font-sans`}
        style={{
          "--font-inter": "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          "--font-playfair": "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
        } as React.CSSProperties}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
