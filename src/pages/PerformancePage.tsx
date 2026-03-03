import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TakeoffSection } from '@/components/performance/TakeoffSection';

export function PerformancePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">DA40 NG Performance</h1>
            <p className="text-sm text-muted-foreground">
              AFM Doc. #6.01.15-E Rev.3 — Chapter 5
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <Calculator className="mr-2 h-4 w-4" />
                M&B
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/learn">
                <BookOpen className="mr-2 h-4 w-4" />
                Learn
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <TakeoffSection />

        <Separator />
        <footer className="text-center text-xs text-muted-foreground pb-4 space-y-2">
          <p>
            For training purposes only. Always verify all data with the Aircraft Flight Manual for your specific aircraft.
          </p>
          <p>
            Oleksandr Konovalov bears no legal responsibility for the use of this calculator.
            The pilot-in-command is solely responsible for verifying performance before every flight.
          </p>
        </footer>
      </main>
    </div>
  );
}
