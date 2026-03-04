import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlightComputer } from '@/components/cr3/FlightComputer';
import { RefreshCw as FlipIcon, RotateCcw, Home } from 'lucide-react';

type Side = 'calculator' | 'wind';

const INITIAL_ROTATIONS: Record<string, number> = {
  'calc-rear': 0,
  'calc-inner': 0,
  'calc-cursor': 0,
  'wind-rear': 0,
  'wind-inner': 0,
  'wind-overlay': 0,
  'wind-center': 0,
};

function computeSize() {
  return Math.min(window.innerWidth - 32, window.innerHeight - 120, 600);
}

function useViewportSize() {
  const [size, setSize] = useState(computeSize);
  useEffect(() => {
    const handler = () => setSize(computeSize());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

export function CR3Page() {
  const navigate = useNavigate();
  const [side, setSide] = useState<Side>('calculator');
  const [rotations, setRotations] = useState(INITIAL_ROTATIONS);
  const size = useViewportSize();

  const handleRotate = useCallback((key: string, angle: number) => {
    setRotations((prev) => ({ ...prev, [key]: angle }));
  }, []);

  const handleFlip = () =>
    setSide((s) => (s === 'calculator' ? 'wind' : 'calculator'));

  const handleReset = () => setRotations(INITIAL_ROTATIONS);

  const label = side === 'calculator' ? 'Calculator Side' : 'Wind Side';

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-900">
      <div className="mb-1 text-xs font-medium tracking-wide text-zinc-400 uppercase">
        {label}
      </div>

      <FlightComputer
        side={side}
        rotations={rotations}
        onRotate={handleRotate}
        size={size}
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleFlip}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600 active:bg-zinc-500"
        >
          <FlipIcon className="h-4 w-4" />
          FLIP
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600 active:bg-zinc-500"
        >
          <RotateCcw className="h-4 w-4" />
          RESET
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600 active:bg-zinc-500"
        >
          <Home className="h-4 w-4" />
          HOME
        </button>
      </div>
    </div>
  );
}
