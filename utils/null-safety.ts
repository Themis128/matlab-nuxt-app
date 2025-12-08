/**
 * Null safety utilities
 * Provides safe access to nested properties and functions
 */

/**
 * Safely get a nested property with a default value
 *
 * @param obj Object to access
 * @param path Dot-separated path to property
 * @param defaultValue Value to return if path doesn't exist
 * @returns Property value or default value
 */
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  if (obj == null) return defaultValue;

  const keys = path.split('.');
  let result: any = obj;

  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }

  return result ?? defaultValue;
};

/**
 * Safely call a function that might be null/undefined
 *
 * @param fn Function to call (may be null/undefined)
 * @param defaultValue Value to return if function is null/undefined or throws
 * @returns Function result or default value
 */
export const safeCall = <T>(fn: (() => T) | undefined | null, defaultValue: T): T => {
  try {
    return fn?.() ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Safely access array element
 *
 * @param array Array to access
 * @param index Index to access
 * @param defaultValue Value to return if index is out of bounds
 * @returns Array element or default value
 */
export const safeArrayGet = <T>(
  array: T[] | null | undefined,
  index: number,
  defaultValue: T
): T => {
  if (!array || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index] ?? defaultValue;
};

/**
 * Safely parse JSON
 *
 * @param json JSON string to parse
 * @param defaultValue Value to return if parsing fails
 * @returns Parsed object or default value
 */
export const safeParseJSON = <T>(json: string | null | undefined, defaultValue: T): T => {
  if (!json) return defaultValue;

  try {
    const parsed = JSON.parse(json);
    return parsed ?? defaultValue;
  } catch {
    return defaultValue;
  }
};
