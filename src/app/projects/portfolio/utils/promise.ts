/**
 * A type guard that checks if a value is "thenable" (i.e., has a `then` method),
 * which is a common way to identify Promise-like objects (duck typing).
 * @param v The value to check.
 * @returns `true` if the value is a thenable (Promise-like), otherwise `false`.
 * @template T The expected resolved type of the Promise.
 */
export function isThenable<T = unknown>(v: unknown): v is Promise<T> {
  return (
    typeof v === 'object' &&
    v !== null &&
    'then' in (v as Record<string, unknown>) &&
    typeof (v as Record<string, unknown>).then === 'function'
  );
}
