export const FEEDBACK_KINDS = ["bug", "feature_request", "general"] as const;
export const FEEDBACK_STATUSES = ["new", "in_progress", "resolved"] as const;
export type FeedbackKind = typeof FEEDBACK_KINDS[number];
export type FeedbackStatus = typeof FEEDBACK_STATUSES[number];
export const feedbackKindLabel = (kind: FeedbackKind) => ({ bug: "Bug report", feature_request: "Feature request", general: "General feedback" })[kind];
export const feedbackStatusLabel = (status: FeedbackStatus) => ({ new: "New", in_progress: "In progress", resolved: "Resolved" })[status];
export const isFeedbackKind = (value: unknown): value is FeedbackKind => FEEDBACK_KINDS.some(kind => kind === value);
export const isFeedbackStatus = (value: unknown): value is FeedbackStatus => FEEDBACK_STATUSES.some(status => status === value);
export const feedbackId = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const feedbackDate = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
export interface FeedbackViewer { id: string; name: string; isAdmin: boolean }
export interface FeedbackSubmission {
  id: string; authorId: string; authorName: string; kind: FeedbackKind; message: string;
  pagePath: string | null; status: FeedbackStatus; reviewedByName: string | null;
  reviewedAt: string | null; createdAt: string; updatedAt: string;
}

// Save the internal pathname only: query strings and fragments may contain private data.
export function feedbackPagePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.length > 2048 || /[\\\u0000-\u001f\u007f]/.test(raw)) return null;
  try {
    const url = new URL(raw, "https://feedback.invalid");
    const decoded = decodeURIComponent(url.pathname);
    if (url.origin !== "https://feedback.invalid" || decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded) || url.pathname.length > 500) return null;
    return url.pathname;
  } catch { return null; }
}
export function feedbackFields(input: unknown): { data: { kind: FeedbackKind; message: string; pagePath: string | null } } | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Invalid feedback." };
  const value = input as Record<string, unknown>;
  if (!isFeedbackKind(value.kind)) return { error: "Choose a feedback type." };
  if (typeof value.message !== "string" || !value.message.trim() || value.message.trim().length > 5000) return { error: "Describe your feedback in up to 5,000 characters." };
  const path = value.pagePath === undefined || value.pagePath === null || value.pagePath === "" ? null : feedbackPagePath(value.pagePath);
  if (value.pagePath !== undefined && value.pagePath !== null && value.pagePath !== "" && path === null) return { error: "Use an internal page path, such as /simulator, or leave the page blank." };
  return { data: { kind: value.kind, message: value.message.trim(), pagePath: path } };
}
