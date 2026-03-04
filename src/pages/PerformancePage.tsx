import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, BookOpen, RotateCcw, HelpCircle, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SpotlightTour } from '@/components/tour/SpotlightTour';
import { useTourState } from '@/hooks/useTourState';
import { takeoffTourSteps } from '@/data/takeoffTourSteps';
import { climbTourSteps } from '@/data/climbTourSteps';
import { cruiseTourSteps } from '@/data/cruiseTourSteps';
import { landingTourSteps } from '@/data/landingTourSteps';
import type { TourStep } from '@/data/tourSteps';
import { TakeoffSection } from '@/components/performance/TakeoffSection';
import { ClimbSection } from '@/components/performance/ClimbSection';
import { CruiseSection } from '@/components/performance/CruiseSection';
import { LandingSection } from '@/components/performance/LandingSection';

const tourConfig: Record<string, { steps: TourStep[]; storageKey: string } | null> = {
  takeoff: { steps: takeoffTourSteps, storageKey: 'da40ng-perf-takeoff-tour-seen' },
  climb: { steps: climbTourSteps, storageKey: 'da40ng-perf-climb-tour-seen' },
  cruise: { steps: cruiseTourSteps, storageKey: 'da40ng-perf-cruise-tour-seen' },
  landing: { steps: landingTourSteps, storageKey: 'da40ng-perf-landing-tour-seen' },
};

export function PerformancePage() {
  const [activeTab, setActiveTab] = useState('takeoff');
  const config = tourConfig[activeTab];
  const tour = useTourState(config?.steps.length ?? 0, config?.storageKey ?? '');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card" data-tour="perf-header">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">DA40 NG Performance</h1>
            <p className="text-sm text-muted-foreground">
              AFM Doc. #6.01.15-E Rev.3 — Chapter 5
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              const keys: Record<string, string[]> = {
                takeoff: ['da40ng-perf-inputs', 'da40ng-perf-aerodrome', 'da40ng-saved-aerodromes'],
                climb: ['da40ng-perf-climb-inputs'],
                cruise: ['da40ng-perf-cruise-inputs'],
                landing: ['da40ng-perf-landing-inputs', 'da40ng-perf-landing-aerodrome', 'da40ng-saved-landing-aerodromes'],
              };
              for (const k of keys[activeTab] ?? []) localStorage.removeItem(k);
              window.location.reload();
            }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            {config && (
              <Button
                variant="ghost"
                size="sm"
                onClick={tour.start}
                aria-label="Start tour"
                data-tour="perf-tour-button"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                How to use
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/calculator">
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
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="takeoff" onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="takeoff">Take Off</TabsTrigger>
            <TabsTrigger value="climb">Climb</TabsTrigger>
            <TabsTrigger value="cruise">Cruise</TabsTrigger>
            <TabsTrigger value="landing">Landing</TabsTrigger>
          </TabsList>

          <TabsContent value="takeoff" className="mt-6">
            <TakeoffSection />
          </TabsContent>

          <TabsContent value="climb" className="mt-6">
            <ClimbSection />
          </TabsContent>

          <TabsContent value="cruise" className="mt-6">
            <CruiseSection />
          </TabsContent>

          <TabsContent value="landing" className="mt-6">
            <LandingSection />
          </TabsContent>
        </Tabs>

        <Separator />
        <footer className="text-center text-xs text-muted-foreground pb-4 space-y-2">
          <p>
            For training purposes only. Always verify all data with the Aircraft Flight Manual for your specific aircraft.
          </p>
          <p>
            The pilot-in-command is solely responsible for verifying performance before every flight.
          </p>
        </footer>
      </main>

      {config && (
        <SpotlightTour
          steps={config.steps}
          isActive={tour.isActive}
          currentStep={tour.currentStep}
          totalSteps={tour.totalSteps}
          onNext={tour.next}
          onPrev={tour.prev}
          onStop={tour.stop}
        />
      )}
    </div>
  );
}
