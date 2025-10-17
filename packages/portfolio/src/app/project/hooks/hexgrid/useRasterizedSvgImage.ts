import { CreateImageBitmapFn } from '@project/types/hexgrid';
import { buildSvgMarkup } from '@project/utils/hexgrid/svg';
import { useEffect, useMemo, useState } from 'react';

export type UseRasterizedSvgImageParams = {
  d: string;
  width: number;
  height: number;
  color: string;
  stroke: number;
};

export type UseRasterizedSvgImageResult = {
  image: CanvasImageSource | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
};

const cache = new Map<string, Promise<CanvasImageSource>>();

/**
 * A custom hook that rasterizes an inline SVG path into a `CanvasImageSource`.
 * It first attempts to use `createImageBitmap` for better performance and falls back
 * to creating an `HTMLImageElement` if not supported.
 * Results are cached to prevent re-rasterization for the same inputs.
 *
 * @param {UseRasterizedSvgImageParams} params - The SVG path, dimensions, and styling parameters.
 * @returns {UseRasterizedSvgImageResult} An object containing the rasterized image and its loading status.
 */
export function useRasterizedSvgImage(
  params: UseRasterizedSvgImageParams
): UseRasterizedSvgImageResult {
  const { d, width, height, color, stroke } = params;

  const key = useMemo(() => {
    if (!d || width <= 0 || height <= 0) {
      return null;
    }
    return `${width}|${height}|${color}|${stroke}|${d}`;
  }, [d, width, height, color, stroke]);

  const [image, setImage] = useState<CanvasImageSource | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle'
  );

  useEffect(() => {
    if (!key) {
      setImage(null);
      setStatus('idle');
      return;
    }
    let cancelled = false;

    const run = async () => {
      setStatus('loading');
      try {
        let promise = cache.get(key);
        if (!promise) {
          const svg = buildSvgMarkup(d, width, height, color, stroke);
          const blob = new Blob([svg], { type: 'image/svg+xml' });

          promise = (async () => {
            try {
              const cib = (
                globalThis as unknown as {
                  createImageBitmap?: CreateImageBitmapFn;
                }
              ).createImageBitmap;
              if (typeof cib === 'function') {
                const bmp = await cib(blob);
                return bmp as CanvasImageSource;
              }
            } catch {}
            const url = URL.createObjectURL(blob);
            try {
              const img = new Image();
              img.decoding = 'async';
              await new Promise<void>((res, rej) => {
                img.onload = () => res();
                img.onerror = () => rej(new Error('Image load error'));
                img.src = url;
              });
              return img as CanvasImageSource;
            } finally {
              URL.revokeObjectURL(url);
            }
          })();

          cache.set(key, promise);
        }

        const out = await promise;
        if (!cancelled) {
          setImage(out);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setImage(null);
          setStatus('error');
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [key, d, width, height, color, stroke]);

  return { image, status };
}
