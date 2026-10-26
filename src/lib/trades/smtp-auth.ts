import "server-only";

type SmtpAuthentication = { user: string; pass: string } | { type: "OAuth2"; user: string; accessToken: string };

export async function smtpAuthentication(user: string): Promise<SmtpAuthentication> {
  const mode = process.env.SMTP_AUTH_MODE?.trim().toLowerCase() || "password";
  if (mode === "password") {
    if (process.env.SMTP_HOST?.trim().toLowerCase() === "smtp-mail.outlook.com") throw new Error("Outlook.com requires OAuth2 sender authentication.");
    const pass = process.env.SMTP_PASSWORD;
    if (!pass) throw new Error("SMTP_PASSWORD is not configured.");
    return { user, pass };
  }
  if (mode !== "oauth2") throw new Error("Unsupported SMTP authentication mode.");

  const clientId = process.env.SMTP_CLIENT_ID?.trim();
  const refreshToken = process.env.SMTP_REFRESH_TOKEN?.trim();
  if (clientId && refreshToken) {
    const tenant = process.env.SMTP_OAUTH_TENANT?.trim() || "consumers";
    if (!/^(?:consumers|common|organizations|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(tenant)) throw new Error("Invalid Microsoft OAuth tenant.");
    const body = new URLSearchParams({ client_id: clientId, refresh_token: refreshToken, grant_type: "refresh_token", scope: "https://outlook.office.com/SMTP.Send offline_access" });
    if (process.env.SMTP_CLIENT_SECRET) body.set("client_secret", process.env.SMTP_CLIENT_SECRET);
    const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Microsoft sender authorization could not be refreshed. Reconnect the Outlook account.");
    const token: unknown = await response.json();
    if (!token || typeof token !== "object" || !("access_token" in token) || typeof token.access_token !== "string" || !token.access_token) throw new Error("Microsoft did not return a sender access token.");
    return { type: "OAuth2", user, accessToken: token.access_token };
  }
  const accessToken = process.env.SMTP_ACCESS_TOKEN?.trim();
  if (accessToken) return { type: "OAuth2", user, accessToken };
  throw new Error("Connect the Outlook sender using OAuth2 before sending notifications.");
}
