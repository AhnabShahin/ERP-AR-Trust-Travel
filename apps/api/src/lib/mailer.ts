// =====================================================================
// Outbound email (SMTP) for the AR Trust ERP.
//
// Transport is configured entirely from the environment (see config/env.ts
// and .env). When SMTP is not configured the mailer degrades gracefully:
// it logs the message (and, for verification mails, the code) to the server
// console so local development / testing still works without a mail server.
// =====================================================================

import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;
let transportResolved = false;

/** Lazily build (and cache) the SMTP transport from env, or null if unset. */
function getTransport(): Transporter | null {
  if (transportResolved) return transporter;
  transportResolved = true;

  const { host, port, user, pass, secure } = env.smtp;
  if (!host || !user || !pass) {
    console.warn(
      '[mailer] SMTP is not fully configured (SMTP_HOST / SMTP_USER / SMTP_PASS) — ' +
        'emails will be logged to the console instead of sent.'
    );
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    // `secure: true` for port 465 (implicit TLS), STARTTLS otherwise.
    secure,
    auth: { user, pass },
  });
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email. Returns `{ sent: true }` when it actually went out over SMTP,
 * or `{ sent: false }` when it was only logged (SMTP unconfigured). Never
 * throws for a missing transport — only a real send failure rejects.
 */
export async function sendMail(msg: MailMessage): Promise<{ sent: boolean }> {
  const tx = getTransport();
  const from = `"${env.mail.fromName}" <${env.mail.from}>`;

  if (!tx) {
    console.info(
      `[mailer] (not sent — SMTP off) to=${msg.to} subject=${JSON.stringify(msg.subject)}`
    );
    if (msg.text) console.info(`[mailer] body:\n${msg.text}`);
    return { sent: false };
  }

  await tx.sendMail({ from, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text });
  return { sent: true };
}

// ---------------------------------------------------------------------
// Verification-code email (branded HTML template).
// ---------------------------------------------------------------------

/** AR Trust brand palette — kept in sync with the web app's drawer. */
const BRAND = {
  ink: '#05161D',
  deep: '#09232C',
  panel: '#0D3A48',
  gold: '#D4AF37',
  goldSoft: '#C0AB6F',
  goldText: '#E7CF8A',
  line: 'rgba(192,171,111,0.35)',
};

function verificationHtml(opts: {
  name: string;
  code: string;
  minutes: number;
  appName: string;
}): string {
  const { name, code, minutes, appName } = opts;
  // Space the digits out so they're easy to read / copy from any mail client.
  const spaced = code.split('').join('&nbsp;&nbsp;');
  const year = new Date().getFullYear();
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BRAND.ink};font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.ink};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:linear-gradient(180deg,${BRAND.deep},${BRAND.ink});border:1px solid ${BRAND.line};border-radius:20px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="padding:28px 32px 20px;border-bottom:1px solid ${BRAND.line};">
                <div style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">
                  AR&nbsp;Trust <span style="color:${BRAND.gold};">Travel &amp; Tourism</span>
                </div>
                <div style="margin-top:4px;font-size:11px;color:${BRAND.goldSoft};text-transform:uppercase;letter-spacing:2px;">
                  Official Account Verification
                </div>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:28px 32px 8px;color:#cdd8dd;font-size:14px;line-height:1.6;">
                <p style="margin:0 0 14px;color:#ffffff;font-size:16px;font-weight:600;">Hello ${escapeHtml(name)},</p>
                <p style="margin:0 0 18px;">
                  Welcome to ${escapeHtml(appName)}. To finish creating your account and keep it
                  secure, enter the verification code below in the sign-up window.
                </p>
              </td>
            </tr>
            <!-- Code -->
            <tr>
              <td align="center" style="padding:6px 32px 8px;">
                <div style="background:${BRAND.panel};border:1px solid ${BRAND.line};border-radius:16px;padding:22px 16px;">
                  <div style="font-size:11px;color:${BRAND.goldSoft};text-transform:uppercase;letter-spacing:3px;margin-bottom:10px;">
                    Your Verification Code
                  </div>
                  <div style="font-size:40px;font-weight:800;color:${BRAND.goldText};letter-spacing:8px;font-family:Consolas,Menlo,monospace;">
                    ${spaced}
                  </div>
                </div>
              </td>
            </tr>
            <!-- Note -->
            <tr>
              <td style="padding:16px 32px 4px;color:#9fb0b6;font-size:13px;line-height:1.6;">
                <p style="margin:0 0 10px;">
                  This code expires in <strong style="color:#ffffff;">${minutes} minutes</strong>.
                  For your security, do not share it with anyone — AR Trust staff will never ask you for it.
                </p>
                <p style="margin:0;">
                  If you didn't try to create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:22px 32px 26px;border-top:1px solid ${BRAND.line};margin-top:12px;">
                <div style="font-size:11px;color:#6d7f85;line-height:1.6;">
                  &copy; ${year} AR Trust Travel &amp; Tourism · Licensed by Qatar Tourism #QTA-8819<br/>
                  This is an automated message — please do not reply directly.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Send the branded 6-digit verification code to a new user. */
export async function sendVerificationCodeEmail(opts: {
  to: string;
  name: string;
  code: string;
  minutes: number;
}): Promise<{ sent: boolean }> {
  const appName = env.mail.appName;
  const html = verificationHtml({ ...opts, appName });
  const text =
    `Hello ${opts.name},\n\n` +
    `Your ${appName} verification code is: ${opts.code}\n` +
    `It expires in ${opts.minutes} minutes. Do not share this code with anyone.\n\n` +
    `If you didn't request this, you can ignore this email.`;
  return sendMail({ to: opts.to, subject: `Your ${appName} verification code: ${opts.code}`, html, text });
}
