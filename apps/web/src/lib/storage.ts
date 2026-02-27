const KEY = "macro-mvp:v1";

export function saveState<T>(value: T) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export function loadState<T>(): T | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}