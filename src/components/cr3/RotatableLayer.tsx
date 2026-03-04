import { useCallback, useRef } from 'react';
import { useRotation } from '@/hooks/useRotation';

interface RotatableLayerProps {
  src: string;
  size: number;
  angle: number;
  onRotate?: (angle: number) => void;
  zIndex: number;
  draggable?: boolean;
  /** Inner hit radius as fraction of size/2 (0–1). Default 0. */
  hitInner?: number;
  /** Outer hit radius as fraction of size/2 (0–1). Default 1. */
  hitOuter?: number;
}

export function RotatableLayer({
  src,
  size,
  angle,
  onRotate,
  zIndex,
  draggable = true,
  hitInner = 0,
  hitOuter = 1,
}: RotatableLayerProps) {
  const handlers = useRotation(angle, onRotate ?? (() => {}));
  const divRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable) return;
      // Hit-test: is the click within our annular ring?
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = rect.width / 2;
      const frac = dist / radius;
      if (frac < hitInner || frac > hitOuter) return; // miss — let event fall through
      handlers.onPointerDown(e);
    },
    [draggable, hitInner, hitOuter, handlers],
  );

  return (
    <div
      ref={divRef}
      className="absolute"
      style={{
        width: size,
        height: size,
        zIndex,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'center',
        touchAction: 'none',
        cursor: draggable ? 'grab' : 'default',
        // All layers receive pointer events so hit-test can decide
        pointerEvents: draggable ? 'auto' : 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="h-full w-full select-none"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}
