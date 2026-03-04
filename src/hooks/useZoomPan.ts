import { useState, useCallback } from 'react';

interface ZoomPanState {
  scale: number;
  /** Pan as fraction -1 to 1 (0 = centered) */
  panX: number;
  panY: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.1;

export function useZoomPan(size: number) {
  const [state, setState] = useState<ZoomPanState>({ scale: 1, panX: 0, panY: 0 });

  const reset = useCallback(() => setState({ scale: 1, panX: 0, panY: 0 }), []);

  const zoomIn = useCallback(() => {
    setState((s) => ({
      ...s,
      scale: Math.min(MAX_SCALE, s.scale + ZOOM_STEP),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((s) => {
      const newScale = Math.max(MIN_SCALE, s.scale - ZOOM_STEP);
      if (newScale <= 1) return { scale: 1, panX: 0, panY: 0 };
      return { ...s, scale: newScale };
    });
  }, []);

  const setPanX = useCallback((panX: number) => {
    setState((s) => ({ ...s, panX }));
  }, []);

  const setPanY = useCallback((panY: number) => {
    setState((s) => ({ ...s, panY }));
  }, []);

  // Convert normalized pan (-1..1) to actual pixels based on current zoom & size
  const maxOffset = size * (state.scale - 1) / 2;
  const x = state.panX * maxOffset;
  const y = state.panY * maxOffset;

  const transform = `translate(${x}px, ${y}px) scale(${state.scale})`;

  return { state, reset, zoomIn, zoomOut, setPanX, setPanY, transform };
}
