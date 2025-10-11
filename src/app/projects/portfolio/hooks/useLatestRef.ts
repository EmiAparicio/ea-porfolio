import { useEffect, useRef } from 'react';

/**
 * A custom hook that creates a ref which is always kept up-to-date with the latest value.
 * This is useful for accessing the latest value of a prop or state inside a callback
 * that is not part of the dependency array, without causing the callback to be recreated.
 *
 * @template T The type of the value to store in the ref.
 * @param {T} value The value to be kept current in the ref.
 * @returns {React.MutableRefObject<T>} A ref object containing the latest value.
 */
export function useLatestRef<T>(value: T) {
  const r = useRef(value);

  useEffect(() => {
    r.current = value;
  }, [value]);

  return r;
}
