import { RefObject, useLayoutEffect } from 'react';

export type UseBackingStoreParams = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  bufferRef: RefObject<HTMLCanvasElement | null>;
  cssWidth: number;
  cssHeight: number;
  dpr: number;
};

/**
 * A custom hook that manages the dimensions of two canvas elements: a main, visible canvas and an off-screen buffer canvas.
 * It ensures both canvases are sized correctly for high-resolution rendering by considering the device pixel ratio (DPR).
 * The main canvas is also styled to match the desired CSS dimensions for proper layout.
 *
 * @param {UseBackingStoreParams} params - The parameters for the hook.
 * @param {RefObject<HTMLCanvasElement | null>} params.canvasRef - A ref to the main, visible canvas.
 * @param {RefObject<HTMLCanvasElement | null>} params.bufferRef - A ref to the off-screen buffer canvas.
 * @param {number} params.cssWidth - The desired CSS width of the main canvas.
 * @param {number} params.cssHeight - The desired CSS height of the main canvas.
 * @param {number} params.dpr - The device pixel ratio.
 */
export function useCanvas2DBackingStore(params: UseBackingStoreParams): void {
  const { canvasRef, bufferRef, cssWidth, cssHeight, dpr } = params;

  useLayoutEffect(() => {
    if (!bufferRef.current) {
      bufferRef.current = document.createElement('canvas');
    }

    const main = canvasRef.current;
    const buf = bufferRef.current;

    const pxW = Math.max(1, Math.floor(cssWidth * dpr));
    const pxH = Math.max(1, Math.floor(cssHeight * dpr));

    if (main) {
      if (main.width !== pxW) {
        main.width = pxW;
      }
      if (main.height !== pxH) {
        main.height = pxH;
      }
      const sw = `${cssWidth}px`;
      const sh = `${cssHeight}px`;
      if (main.style.width !== sw) {
        main.style.width = sw;
      }
      if (main.style.height !== sh) {
        main.style.height = sh;
      }
    }

    if (buf) {
      if (buf.width !== pxW) {
        buf.width = pxW;
      }
      if (buf.height !== pxH) {
        buf.height = pxH;
      }
    }
  }, [canvasRef, bufferRef, cssWidth, cssHeight, dpr]);
}
