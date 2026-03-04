import { useRef, useCallback, useEffect, useState } from 'react';

const BASE = import.meta.env.BASE_URL + 'cr3/';

export type DrawMode = 'rotate' | 'dot' | 'line' | 'erase';

export type Annotation =
  | { type: 'dot'; id: string; x: number; y: number }
  | { type: 'line'; id: string; x1: number; y1: number; x2: number; y2: number };

export type AnnotateAction =
  | { action: 'addDot'; x: number; y: number }
  | { action: 'addLine'; x1: number; y1: number; x2: number; y2: number }
  | { action: 'remove'; id: string };

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
  { key: 'wind-rear', src: BASE + 'wind-rear.png', draggable: true },
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
  annotations?: Annotation[];
  drawMode?: DrawMode;
  onAnnotate?: (action: AnnotateAction) => void;
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

/** Convert click fraction to overlay-local coords by undoing overlay rotation */
function clickToOverlayLocal(
  fracX: number,
  fracY: number,
  overlayRotationDeg: number,
): { x: number; y: number } {
  const dx = fracX - 0.5;
  const dy = fracY - 0.5;
  const rad = (-overlayRotationDeg * Math.PI) / 180;
  return {
    x: dx * Math.cos(rad) - dy * Math.sin(rad),
    y: dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

/** Distance between two points */
function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/** Distance from point to line segment */
function pointToSegmentDist(
  px: number, py: number,
  x1: number, y1: number, x2: number, y2: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, x1, y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return dist(px, py, x1 + t * dx, y1 + t * dy);
}

export function FlightComputer({
  side,
  rotations,
  onRotate,
  size,
  annotations = [],
  drawMode = 'rotate',
  onAnnotate,
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

  // Line drawing state
  const pendingLineStart = useRef<{ x: number; y: number } | null>(null);
  const [linePreview, setLinePreview] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Reset pending line when mode changes away from line
  useEffect(() => {
    if (drawMode !== 'line') {
      pendingLineStart.current = null;
      setLinePreview(null);
    }
  }, [drawMode]);

  const getAngle = (clientX: number, clientY: number, rect: DOMRect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  };

  const overlayRotation = rotations['wind-overlay'] ?? 0;

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const fracX = (e.clientX - rect.left) / rect.width;
      const fracY = (e.clientY - rect.top) / rect.height;

      // Drawing modes — handle on wind side only
      if (side === 'wind' && drawMode !== 'rotate' && onAnnotate) {
        const local = clickToOverlayLocal(fracX, fracY, overlayRotation);
        const r = Math.sqrt(local.x * local.x + local.y * local.y);
        const MAX_DRAW_RADIUS = 0.355; // inner plotting grid boundary

        if (drawMode === 'dot') {
          if (r > MAX_DRAW_RADIUS) return;
          onAnnotate({ action: 'addDot', x: local.x, y: local.y });
          return;
        }

        if (drawMode === 'line') {
          if (r > MAX_DRAW_RADIUS) return;
          if (!pendingLineStart.current) {
            pendingLineStart.current = local;
            setLinePreview(null);
          } else {
            const start = pendingLineStart.current;
            onAnnotate({ action: 'addLine', x1: start.x, y1: start.y, x2: local.x, y2: local.y });
            pendingLineStart.current = null;
            setLinePreview(null);
          }
          return;
        }

        if (drawMode === 'erase') {
          const THRESHOLD = 0.03; // in normalized coords
          let closest: { id: string; dist: number } | null = null;
          for (const ann of annotations) {
            let d: number;
            if (ann.type === 'dot') {
              d = dist(local.x, local.y, ann.x, ann.y);
            } else {
              d = pointToSegmentDist(local.x, local.y, ann.x1, ann.y1, ann.x2, ann.y2);
            }
            if (d < THRESHOLD && (!closest || d < closest.dist)) {
              closest = { id: ann.id, dist: d };
            }
          }
          if (closest) {
            onAnnotate({ action: 'remove', id: closest.id });
          }
          return;
        }
      }

      // Default: rotate mode
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
    [layers, rotations, imageDataMap, side, drawMode, onAnnotate, overlayRotation, annotations],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Line preview
      if (side === 'wind' && drawMode === 'line' && pendingLineStart.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const fracX = (e.clientX - rect.left) / rect.width;
        const fracY = (e.clientY - rect.top) / rect.height;
        const local = clickToOverlayLocal(fracX, fracY, overlayRotation);
        const start = pendingLineStart.current;
        setLinePreview({ x1: start.x, y1: start.y, x2: local.x, y2: local.y });
      }

      if (!activeLayer.current) return;
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const currentAngle = getAngle(e.clientX, e.clientY, rect);
      const delta = currentAngle - startAngle.current;
      onRotate(activeLayer.current, startRotation.current + delta);
    },
    [onRotate, side, drawMode, overlayRotation],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeLayer.current) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      activeLayer.current = null;
    },
    [],
  );

  const cursorForMode = drawMode === 'rotate' ? 'grab' :
    drawMode === 'erase' ? 'pointer' : 'crosshair';

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

      {/* Annotation SVG — above all image layers, below interaction overlay */}
      {side === 'wind' && (annotations.length > 0 || linePreview) && (
        <svg
          className="absolute"
          style={{
            width: size,
            height: size,
            zIndex: 99,
            transform: `rotate(${overlayRotation}deg)`,
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
          viewBox={`0 0 ${size} ${size}`}
        >
          {annotations.map((ann) =>
            ann.type === 'dot' ? (
              <circle
                key={ann.id}
                cx={(ann.x + 0.5) * size}
                cy={(ann.y + 0.5) * size}
                r={4}
                fill="#ef4444"
              />
            ) : (
              <line
                key={ann.id}
                x1={(ann.x1 + 0.5) * size}
                y1={(ann.y1 + 0.5) * size}
                x2={(ann.x2 + 0.5) * size}
                y2={(ann.y2 + 0.5) * size}
                stroke="#ef4444"
                strokeWidth={2}
              />
            ),
          )}
          {linePreview && (
            <line
              x1={(linePreview.x1 + 0.5) * size}
              y1={(linePreview.y1 + 0.5) * size}
              x2={(linePreview.x2 + 0.5) * size}
              y2={(linePreview.y2 + 0.5) * size}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          )}
        </svg>
      )}

      {/* Invisible interaction overlay */}
      <div
        className="absolute"
        style={{
          width: size,
          height: size,
          zIndex: 100,
          touchAction: 'none',
          cursor: cursorForMode,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
