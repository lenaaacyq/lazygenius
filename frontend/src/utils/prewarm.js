export function prewarmBackend({
  baseUrl,
  path = "/",
  timeoutMs = 6000,
  minDurationMs = 0,
  storageKey = "prewarm_backend",
  onStart,
  onDone,
}) {
  if (typeof window === "undefined") return;
  if (!baseUrl) return;
  try {
    const hit = window.sessionStorage.getItem(storageKey);
    if (hit) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    return;
  }
  const startedAt = Date.now();
  onStart?.();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  fetch(url, { method: "GET", mode: "cors", signal: controller.signal })
    .catch(() => {})
    .finally(() => {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minDurationMs - elapsed);
      if (remaining > 0) {
        setTimeout(() => onDone?.(), remaining);
        return;
      }
      onDone?.();
    });
}
