import { useState, useEffect } from "react";

/**
 * Returns a debounced version of `value` that only updates after
 * `delay` milliseconds have passed since the last change.
 *
 * The pending timer is cleared on every re-render that changes `value`,
 * so only the final value after the user stops typing is emitted.
 *
 * @param {any} value - The value to debounce (typically a string from an input)
 * @param {number} delay - Debounce delay in milliseconds (400–500 recommended)
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If `value` changes before the timer fires, cancel the pending timer.
    // This is what makes it a debounce — only the last value gets through.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
