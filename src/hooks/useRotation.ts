import { useCallback, useRef } from 'react';

export function useRotation(
  rotation: number,
  onRotate: (angle: number) => void,
) {
  const tracking = useRef(false);
  const startPointerAngle = useRef(0);
  const startRotation = useRef(0);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const getAngle = (clientX: number, clientY: number) => {
    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      const rect = el.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      startPointerAngle.current = getAngle(e.clientX, e.clientY);
      startRotation.current = rotation;
      tracking.current = true;
    },
    [rotation],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!tracking.current) return;
      e.preventDefault();
      const currentAngle = getAngle(e.clientX, e.clientY);
      const delta = currentAngle - startPointerAngle.current;
      onRotate(startRotation.current + delta);
    },
    [onRotate],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!tracking.current) return;
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      tracking.current = false;
    },
    [],
  );

  return { onPointerDown, onPointerMove, onPointerUp };
}
