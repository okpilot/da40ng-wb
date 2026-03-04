import { Link } from 'react-router-dom';
import { AircraftConfig } from '@/components/AircraftConfig';
import { LoadingTable } from '@/components/LoadingTable';
import { CGEnvelopeChart } from '@/components/CGEnvelopeChart';
import { CalculationBreakdown } from '@/components/CalculationBreakdown';
import { SpotlightTour } from '@/components/tour/SpotlightTour';
import { useCalculation } from '@/hooks/useCalculation';
import { useTourState } from '@/hooks/useTourState';
import { tourSteps } from '@/data/tourSteps';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { BookOpen, HelpCircle, Gauge, RotateCcw } from 'lucide-react';

export function CalculatorPage() {
  const {
    config,
    loading,
    visibleStations,
    result,
    setBemMass,
    setBemCg,
    toggleMod,
    setTankConfig,
    setStationMass,
    setTakeoffFuel,
    setTripFuel,
    resetAll,
  } = useCalculation();

  const tour = useTourState(tourSteps.length);

  const hasLoading =
    result.zfm.mass !== config.bemMass || result.tom.mass !== result.zfm.mass;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card" data-tour="header">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">DA40 NG Mass & Balance</h1>
            <p className="text-sm text-muted-foreground">
              AFM Doc. #6.01.15-E Rev.3
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetAll} aria-label="Reset all data">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="ghost" size="sm" onClick={tour.start} aria-label="Start tour" data-tour="tour-button">
              <HelpCircle className="mr-2 h-4 w-4" />
              How to use
            </Button>
            <Button variant="outline" asChild>
              <Link to="/performance">
                <Gauge className="mr-2 h-4 w-4" />
                Performance
              </Link>
            </Button>
            <Button variant="outline" asChild data-tour="learn-button">
              <Link to="/learn">
                <BookOpen className="mr-2 h-4 w-4" />
                Learn M&B
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Full-width aircraft config */}
        <AircraftConfig
          config={config}
          onBemMassChange={setBemMass}
          onBemCgChange={setBemCg}
          onToggleMod={toggleMod}
          onTankChange={setTankConfig}
        />

        {/* Form + Envelope side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <LoadingTable
            config={config}
            loading={loading}
            visibleStations={visibleStations}
            result={result}
            hasLoading={hasLoading}
            onStationMassChange={setStationMass}
            onTakeoffFuelChange={setTakeoffFuel}
            onTripFuelChange={setTripFuel}
          />
          <div className="lg:sticky lg:top-6" data-tour="cg-envelope">
            <CGEnvelopeChart config={config} result={result} />
          </div>
        </div>

        {/* Calculation breakdown — only when there's data */}
        {hasLoading && (
          <CalculationBreakdown
            config={config}
            loading={loading}
            visibleStations={visibleStations}
            result={result}
          />
        )}

        <Separator />
        <footer className="text-center text-xs text-muted-foreground pb-4 space-y-2" data-tour="footer-disclaimer">
          <p>
            For training purposes only. Always verify all data with the Aircraft Flight Manual for your specific aircraft.
          </p>
          <p>
            The pilot-in-command is solely responsible for verifying mass and balance before every flight.
          </p>
        </footer>
      </main>

      <SpotlightTour
        steps={tourSteps}
        isActive={tour.isActive}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        onNext={tour.next}
        onPrev={tour.prev}
        onStop={tour.stop}
      />
    </div>
  );
}
