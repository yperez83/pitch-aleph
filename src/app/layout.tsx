import type { Metadata } from 'next';
import '../index.css';
import VisitoringAnalytics from '../components/VisitoringAnalytics';

export const metadata: Metadata = {
  title: 'Pitch Aleph | Betting Engine',
  description: 'Quantitative sports simulation and predictive market engine.',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <VisitoringAnalytics>
          {children}
        </VisitoringAnalytics>
      </body>
    </html>
  );
}
