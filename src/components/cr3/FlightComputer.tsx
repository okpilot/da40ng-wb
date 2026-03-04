import { useRef, useCallback, useEffect, useState } from 'react';

const BASE = import.meta.env.BASE_URL + 'cr3/';

interface LayerDef {
  key: string;
  src: string;
  draggable: boolean;
}

const CALC_LAYERS: LayerDef[] = [
  { key: 'calc-rear', src: BASE + 'calc-rear.png', draggable: true },
  { key: 'calc-inner', src: BASE + 'calc-inner.png', draggable: true },
  { key: 'calc-cursor', src: BASE + 'calc-cursor.png', draggable: true },
];

const WIND_LAYERS: LayerDef[] = [
  { key: 'wind-rear', src: BASE + 'wind-rear.png', draggable: false },
  { key: 'wind-inner', src: BASE + 'wind-inner.png', draggable: true },
  { key: 'wind-overlay', src: BASE + 'wind-overlay.png', draggable: true },
  { key: 'wind-center', src: BASE + 'wind-center.png', draggable: false },
];

type Side = 'calculator' | 'wind';

interface FlightComputerProps {
  side: Side;
  rotations: Record<string, number>;
  onRotate: (key: string, angle: number) => void;
  size: number;
}

/** Load an image into an offscreen canvas for pixel sampling */
function loadImageData(src: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    img.onerror = reject;
    img.src = src;
  });
}

/** Check alpha at (x, y) in the original unrotated image, given current rotation */
function hitTest(
  imageData: ImageData,
  clickFracX: number, // 0–1 fraction from left of display
  clickFracY: number, // 0–1 fraction from top of display
  rotationDeg: number,
  alphaThreshold = 30,
): boolean {
  // Transform click point back by the layer's rotation (rotate around center)
  const cx = 0.5;
  const cy = 0.5;
  const dx = clickFracX - cx;
  const dy = clickFracY - cy;
  const rad = (-rotationDeg * Math.PI) / 180;
  const ux = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
  const uy = cy + dx * Math.sin(rad) + dy * Math.cos(rad);

  const px = Math.round(ux * imageData.width);
  const py = Math.round(uy * imageData.height);
  if (px < 0 || px >= imageData.width || py < 0 || py >= imageData.height)
    return false;

  const idx = (py * imageData.width + px) * 4;
  return imageData.data[idx + 3] > alphaThreshold;
}

export function FlightComputer({
  side,
  rotations,
  onRotate,
  size,
}: FlightComputerProps) {
  const layers = side === 'calculator' ? CALC_LAYERS : WIND_LAYERS;

  // Preloaded image data for hit testing
  const [imageDataMap, setImageDataMap] = useState<Record<string, ImageData>>(
    {},
  );

  useEffect(() => {
    const allLayers = [...CALC_LAYERS, ...WIND_LAYERS];
    Promise.all(
      allLayers.map(async (l) => {
        const data = await loadImageData(l.src);
        return [l.key, data] as const;
      }),
    ).then((entries) => setImageDataMap(Object.fromEntries(entries)));
  }, []);

  const activeLayer = useRef<string | null>(null);
  const startAngle = useRef(0);
  const startRotation = useRef(0);

  const getAngle = (clientX: number, clientY: number, rect: DOMRect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const fracX = (e.clientX - rect.left) / rect.width;
      const fracY = (e.clientY - rect.top) / rect.height;

      // Check layers top-to-bottom (reverse order) for first alpha hit
      const draggable = layers.filter((l) => l.draggable);
      for (let i = draggable.length - 1; i >= 0; i--) {
        const layer = draggable[i];
        const imgData = imageDataMap[layer.key];
        if (!imgData) continue;
        if (hitTest(imgData, fracX, fracY, rotations[layer.key] ?? 0)) {
          activeLayer.current = layer.key;
          startAngle.current = getAngle(e.clientX, e.clientY, rect);
          startRotation.current = rotations[layer.key] ?? 0;
          e.currentTarget.setPointerCapture(e.pointerId);
          return;
        }
      }
    },
    [layers, rotations, imageDataMap],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeLayer.current) return;
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const currentAngle = getAngle(e.clientX, e.clientY, rect);
      const delta = currentAngle - startAngle.current;
      onRotate(activeLayer.current, startRotation.current + delta);
    },
    [onRotate],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeLayer.current) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      activeLayer.current = null;
    },
    [],
  );

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Visual layers — no pointer events */}
      {layers.map((layer, i) => (
        <div
          key={layer.key}
          className="absolute"
          style={{
            width: size,
            height: size,
            zIndex: i + 1,
            transform: `rotate(${rotations[layer.key] ?? 0}deg)`,
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        >
          <img
            src={layer.src}
            alt=""
            draggable={false}
            className="h-full w-full select-none"
          />
        </div>
      ))}

      {/* Invisible interaction overlay */}
      <div
        className="absolute"
        style={{
          width: size,
          height: size,
          zIndex: 100,
          touchAction: 'none',
          cursor: 'grab',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
