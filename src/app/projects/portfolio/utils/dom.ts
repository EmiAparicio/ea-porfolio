import { NO_CUSTOM_CLASS } from '@portfolio/components/TechCursor';

/**
 * Recursively checks if an element or any of its parents have a disabled state.
 * This includes checking the `disabled` property on form elements and the
 * `aria-disabled="true"` attribute on any element.
 * @param el The element to start checking from.
 * @returns `true` if the element or an ancestor is disabled, otherwise `false`.
 */
export function isDisabledish(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const n = el as
    | HTMLButtonElement
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;
  if (n.disabled === true) return true;
  if (el.getAttribute('aria-disabled') === 'true') return true;
  return isDisabledish(el.parentElement);
}

/**
 * Checks if an element is a descendant of an element with the `NO_CUSTOM_CLASS`
 * CSS class, indicating it's in a zone that opts out of a custom feature
 * (e.g., the custom cursor).
 * @param el The element to check.
 * @returns `true` if the element is inside a designated opt-out zone.
 */
export function inNoCustomZone(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  return !!el.closest(`.${NO_CUSTOM_CLASS}`);
}
