import { useEffect, useRef, useState } from 'react';

/**
 * A custom hook to track the dimensions (width and height) of an HTML element.
 * It uses a `ref` to target the element and `ResizeObserver` to efficiently
 * update the size whenever the element's dimensions change.
 *
 * @template T The type of the HTML element.
 * @returns {{ref: React.RefObject<T>; size: {width: number; height: number;}}} An object containing a ref to be attached to the element and its current size.
 */
export default function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) {
        setSize({ width: cr.width, height: cr.height });
      }
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}
