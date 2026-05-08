import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'antd/dist/reset.css';
import './globals.css';
import styles from './layout.module.scss';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cadastro de Usuarios',
  description: 'Sistema de CRUD para gerenciamento de usuarios',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <header className={styles.topHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.headerTitle}>Cadastro de Usuarios</h1>
          </div>
        </header>
        <main className={styles.mainContent}>{children}</main>
      </body>
    </html>
  );
}
