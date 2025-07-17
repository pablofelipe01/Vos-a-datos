import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PiroliApp - Tecnología Avanzada para Pirólisis',
  description: 'Plataforma integral para control de procesos de pirólisis, gestión de biochar, grabación de voz y automatización industrial',
  keywords: 'pirólisis, biochar, automatización, PiroliApp, industria, análisis, dashboard, control de procesos',
  authors: [{ name: 'PiroliApp Team' }],
  icons: {
    icon: "/logo_siris_icon.ico",
    apple: "/h6.png",
  },
  openGraph: {
    title: 'PiroliApp - Tecnología Avanzada para Pirólisis',
    description: 'Plataforma integral para control de procesos de pirólisis y gestión de biochar',
    type: 'website',
    locale: 'es_ES',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-cover bg-center bg-no-repeat`} style={{ backgroundImage: "url('/h6.png')" }}>
        {children}
      </body>
    </html>
  );
}