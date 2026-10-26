import "server-only";
import nodemailer from "nodemailer";
import { smtpAuthentication } from "./smtp-auth";
import { supabaseDb } from "@/utils/supabaseDb";
import { currentCeo } from "./server";
import { notificationTestEmail, validNotificationEmail } from "./notification-config";
import type { TradeLeg } from "./proposals";

interface NotificationRecord {
  id: string;
  author_name: string;
  legs: Pick<TradeLeg, "symbol" | "name">[];
  submitted_at: string | null;
  notification_attempted_at: string | null;
}

export function notificationMessage(proposal: NotificationRecord, appUrl: string, testing: boolean) {
  const base = new URL(appUrl);
  if (!["https:", "http:"].includes(base.protocol) || base.username || base.password || (process.env.NODE_ENV === "production" && base.protocol !== "https:")) throw new Error("Invalid application URL for email notifications.");
  const link = new URL("/trade-submissions", base.origin);
  link.searchParams.set("proposal", proposal.id);
  link.hash = "proposal-builder";
  const stocks = Array.from(new Map(proposal.legs.map(leg => [leg.symbol, `${leg.name} (${leg.symbol})`])).values());
  return {
    subject: `${testing ? "[TEST] " : ""}JSOSIF: trade proposal awaiting CEO review`,
    text: [
      "A new trade proposal has been submitted for review.",
      `Submitted by: ${proposal.author_name}`,
      `${stocks.length === 1 ? "Stock" : "Stocks"}: ${stocks.join(", ")}`,
      `Proposal reference: ${proposal.id}`,
      "",
      `Review the proposal: ${link.toString()}`,
    ].join("\n"),
  };
}

export async function deliverProposalNotification(proposal: NotificationRecord) {
  let sent = false;
  let warning: string | undefined;
  try {
    const ceo = await currentCeo();
    if (!ceo) throw new Error("A unique active CEO account is required for notifications.");
    const testEmail = notificationTestEmail();
    const recipient = testEmail || ceo.email;
    if (!validNotificationEmail(recipient)) throw new Error("Invalid notification recipient configuration.");
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER?.trim();
    const from = process.env.TRADE_EMAIL_FROM?.trim();
    if (!host || !user || !from || /[\r\n]/.test(from) || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error("SMTP sender settings are incomplete.");
    const appUrl = process.env.APP_URL?.trim() || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
    if (!appUrl) throw new Error("APP_URL is required for proposal notification links.");
    const message = notificationMessage(proposal, appUrl, Boolean(testEmail));
    const auth = await smtpAuthentication(user);
    const transport = nodemailer.createTransport({ host, port, secure: port === 465, requireTLS: port !== 465, auth, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000, tls: { minVersion: "TLSv1.2" } });
    const info = await transport.sendMail({ from, to: recipient, ...message, messageId: `<trade-proposal-${proposal.id}@${new URL(appUrl).hostname}>`, disableFileAccess: true, disableUrlAccess: true });
    if (!info.accepted?.length) throw new Error("The mail server did not accept the notification.");
    sent = true;
  } catch (error) {
    // Store no credentials or SMTP responses in proposal records or client messages.
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "notification_setup_or_delivery";
    console.error("Proposal notification failed:", code);
    warning = "Your proposal is submitted, but its notification email could not be sent. You can retry the email from the proposal page.";
  }
  try {
    const { data, error } = await supabaseDb.from("trade_proposals")
      .update({ notification_status: sent ? "sent" : "failed", notified_at: sent ? new Date().toISOString() : null })
      .eq("id", proposal.id).eq("notification_status", "sending").eq("notification_attempted_at", proposal.notification_attempted_at)
      .select("*").maybeSingle();
    if (error || !data) throw new Error("Delivery status was not saved.");
    return { data, warning };
  } catch {
    console.error("Unable to record proposal notification status.");
    return { data: null, warning: sent ? "The email was sent, but its delivery status could not be saved. Refresh the proposal before retrying." : warning };
  }
}
