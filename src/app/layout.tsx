import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PiroliApp',
  description: 'Record audio and upload photos and Data',
  icons: {
    icon: "/logo_siris_icon.ico", // Favicon for browsers
    apple: "/h6.png", // Icon for iOS devices
  },
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