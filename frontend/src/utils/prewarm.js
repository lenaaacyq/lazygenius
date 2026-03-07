export function prewarmBackend({ baseUrl, path = "/", timeoutMs = 6000, storageKey = "prewarm_backend" }) {
  if (typeof window === "undefined") return;
  if (!baseUrl) return;
  try {
    const hit = window.sessionStorage.getItem(storageKey);
    if (hit) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    return;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  fetch(url, { method: "GET", mode: "cors", signal: controller.signal }).catch(() => {});
  setTimeout(() => clearTimeout(timeoutId), timeoutMs + 50);
}
