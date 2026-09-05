import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Horary | Gestión de jornadas',
  description: 'Panel de operación para jornadas e inscripciones.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}