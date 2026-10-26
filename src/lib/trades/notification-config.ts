export function notificationTestEmail(): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  return process.env.TRADE_NOTIFICATION_TEST_EMAIL?.trim().toLowerCase() || null;
}

export function validNotificationEmail(value: string): boolean {
  return /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(value);
}
