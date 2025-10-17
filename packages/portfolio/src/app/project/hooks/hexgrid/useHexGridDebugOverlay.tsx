'use client';

import { useLayoutEffect, useState } from 'react';

/**
 * Gets an existing HTMLDivElement with the given ID or creates a new one if it doesn't exist.
 * The created container is styled to be a fixed overlay at the top of the viewport.
 *
 * @param {string} id The ID of the container element.
 * @returns {HTMLDivElement} The overlay container element.
 */
function getOrCreateContainer(id: string): HTMLDivElement {
  let container = document.getElementById(id) as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.zIndex = '2147483647';
    container.style.pointerEvents = 'none';
    container.style.fontFamily =
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * A custom hook that creates and manages a fixed HTML overlay container element.
 * It's useful for rendering components outside the normal DOM flow, such as debug overlays, tooltips, or modals.
 * The container is created on mount and removed on unmount.
 *
 * @param {string} [id='hex-debug-overlay'] The ID for the container element.
 * @returns {HTMLElement | null} The created or retrieved container element.
 */
export function useOverlayContainer(id = 'hex-debug-overlay') {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const container = getOrCreateContainer(id);
    setEl(container);

    const created = !container.hasAttribute('data-managed-by-react');
    container.setAttribute('data-managed-by-react', 'true');

    return () => {
      if (created) {
        container.parentNode?.removeChild(container);
      }
    };
  }, [id]);

  return el;
}
