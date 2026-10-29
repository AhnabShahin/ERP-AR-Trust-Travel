import 'dotenv/config';

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const smtpPort = Number(process.env.SMTP_PORT ?? 465);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  jwtSecret: required('JWT_SECRET', 'dev-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  isProd: (process.env.NODE_ENV ?? 'development') === 'production',

  // Outbound email (SMTP). When host/user/pass are blank the mailer logs to
  // the console instead of sending (handy for local dev). For Google Workspace
  // / Gmail use host smtp.gmail.com, port 465, and an *App Password* for
  // SMTP_PASS (a normal account password will be rejected by Google).
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: smtpPort,
    // Implicit TLS on 465; STARTTLS on 587. Override with SMTP_SECURE=true/false.
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465,
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
  mail: {
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER ?? 'support@artrusttravel.com',
    fromName: process.env.MAIL_FROM_NAME ?? 'AR Trust Travel & Tourism',
    appName: process.env.APP_NAME ?? 'AR Trust Travel & Tourism',
  },

  // Email-verification code policy.
  emailVerify: {
    codeTtlMinutes: Number(process.env.EMAIL_VERIFY_TTL_MINUTES ?? 15),
    maxAttempts: Number(process.env.EMAIL_VERIFY_MAX_ATTEMPTS ?? 6),
    resendCooldownSeconds: Number(process.env.EMAIL_VERIFY_RESEND_COOLDOWN ?? 60),
  },
};
