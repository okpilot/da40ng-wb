import { Link } from 'react-router-dom';
import { Scale, Gauge, Compass } from 'lucide-react';

const cards = [
  {
    to: '/calculator',
    icon: Scale,
    title: 'Mass & Balance',
    description: 'Diamond DA40 NG — loading sheet, CG envelope, and modification tracking',
  },
  {
    to: '/performance',
    icon: Gauge,
    title: 'Performance',
    description: 'Diamond DA40 NG — take-off, climb, cruise, and landing calculators',
  },
  {
    to: '/cr3',
    icon: Compass,
    title: 'CR-3 Flight Computer',
    description: 'Interactive calculator and wind side emulator',
  },
];

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Flight Training Tools</h1>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
        {cards.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col items-center rounded-xl border bg-card p-6 text-center shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <Icon className="mb-3 h-8 w-8 text-muted-foreground transition group-hover:text-primary" />
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
