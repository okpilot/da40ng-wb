import { useEffect, useState } from 'react';

const PADDING = 6;

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function useSpotlightPosition(
  selector: string | null,
): SpotlightRect | null {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }

    const el = document.querySelector(selector);
    if (!el) {
      setRect(null);
      return;
    }

    // Scroll target into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    function update() {
      const r = el!.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
    }

    // Initial measurement after scroll settles
    const initialTimeout = setTimeout(update, 350);

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      clearTimeout(initialTimeout);
      ro.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [selector]);

  return rect;
}
