export function safeReturnPath(value: string | null, fallback = "/homepage"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return fallback;
  try {
    const base = new URL("https://return.invalid");
    const target = new URL(value, base);
    return target.origin === base.origin ? `${target.pathname}${target.search}${target.hash}` : fallback;
  } catch { return fallback; }
}
