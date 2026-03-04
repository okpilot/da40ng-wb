import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlightComputer } from '@/components/cr3/FlightComputer';
import { useZoomPan } from '@/hooks/useZoomPan';
import {
  RefreshCw as FlipIcon,
  RotateCcw,
  Home,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

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
  return Math.min(window.innerWidth - 32, window.innerHeight - 160, 600);
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

const btnClass =
  'flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600 active:bg-zinc-500';

export function CR3Page() {
  const navigate = useNavigate();
  const [side, setSide] = useState<Side>('calculator');
  const [rotations, setRotations] = useState(INITIAL_ROTATIONS);
  const size = useViewportSize();
  const { state: zoom, reset: resetZoom, zoomIn, zoomOut, setPanX, setPanY, transform } =
    useZoomPan(size);

  const handleRotate = useCallback((key: string, angle: number) => {
    setRotations((prev) => ({ ...prev, [key]: angle }));
  }, []);

  const handleFlip = () =>
    setSide((s) => (s === 'calculator' ? 'wind' : 'calculator'));

  const handleReset = () => {
    setRotations(INITIAL_ROTATIONS);
    resetZoom();
  };

  const label = side === 'calculator' ? 'Calculator Side' : 'Wind Side';
  const isZoomed = zoom.scale > 1;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-900 overflow-hidden select-none">
      <div className="mb-1 text-xs font-medium tracking-wide text-zinc-400 uppercase">
        {label}
        {isZoomed && (
          <span className="ml-2 text-zinc-500">
            {Math.round(zoom.scale * 100)}%
          </span>
        )}
      </div>

      {/* Flight computer viewport — clips overflow when zoomed */}
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <div
          style={{
            width: size,
            height: size,
            transform,
            transformOrigin: 'center',
          }}
        >
          <FlightComputer
            side={side}
            rotations={rotations}
            onRotate={handleRotate}
            size={size}
          />
        </div>
      </div>

      {/* Controls — always on top */}
      <div className="relative z-50 mt-3 flex items-center gap-2 rounded-xl bg-zinc-900/90 px-3 py-2 backdrop-blur-sm">
        <button
          onClick={zoomOut}
          disabled={zoom.scale <= 1}
          className={btnClass + ' disabled:opacity-30'}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs text-zinc-400">
          {Math.round(zoom.scale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={zoom.scale >= 4}
          className={btnClass + ' disabled:opacity-30'}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {isZoomed && (
        <div className="relative z-50 mt-2 flex flex-col items-center gap-1 rounded-xl bg-zinc-900/90 px-3 py-2 backdrop-blur-sm">
          <label className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="w-4">L</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round(-zoom.panX * 100)}
              onChange={(e) => setPanX(-Number(e.target.value) / 100)}
              className="w-48 accent-zinc-500"
            />
            <span className="w-4">R</span>
          </label>
          <label className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="w-4">U</span>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round(-zoom.panY * 100)}
              onChange={(e) => setPanY(-Number(e.target.value) / 100)}
              className="w-48 accent-zinc-500"
            />
            <span className="w-4">D</span>
          </label>
        </div>
      )}

      <div className="relative z-50 mt-3 flex flex-wrap justify-center gap-3 rounded-xl bg-zinc-900/90 px-3 py-2 backdrop-blur-sm">
        <button onClick={handleFlip} className={btnClass}>
          <FlipIcon className="h-4 w-4" />
          FLIP
        </button>
        <button onClick={handleReset} className={btnClass}>
          <RotateCcw className="h-4 w-4" />
          RESET
        </button>
        <button onClick={() => navigate('/')} className={btnClass}>
          <Home className="h-4 w-4" />
          HOME
        </button>
      </div>
    </div>
  );
}
