import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

async function sendMail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"${config.emailFromName}" <${config.emailFrom}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}:`, err);
  }
}

function wrap(title: string, body: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#09090b;color:#f4f4f5;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:24px;font-weight:800;color:#22d3ee;">supr<em style="color:#f59e0b">fly</em></span>
      </div>
      <h2 style="color:#f4f4f5;margin-bottom:16px;">${title}</h2>
      ${body}
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;" />
      <p style="font-size:12px;color:#71717a;text-align:center;">Suprfly &mdash; Your AI Wingman for LinkedIn & X</p>
    </div>
  `;
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${config.frontendUrl}/verify-email?token=${token}`;
  await sendMail(email, 'Verify your Suprfly account', wrap('Verify Your Email', `
    <p>Click the button below to verify your email address:</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${url}" style="display:inline-block;padding:12px 32px;background:#22d3ee;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">Verify Email</a>
    </p>
    <p style="font-size:13px;color:#a1a1aa;">If you didn't create an account, you can ignore this email.</p>
  `));
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${config.frontendUrl}/reset-password?token=${token}`;
  await sendMail(email, 'Reset your Suprfly password', wrap('Reset Your Password', `
    <p>Click below to reset your password. This link expires in 1 hour.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${url}" style="display:inline-block;padding:12px 32px;background:#22d3ee;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
    </p>
  `));
}

export async function sendSessionExpiredAlert(email: string, platform: string, accountName: string) {
  await sendMail(email, `${platform} session expired — Suprfly`, wrap('Session Expired', `
    <p>Your <strong>${platform}</strong> account <strong>${accountName}</strong> session has expired.</p>
    <p>Please open the Suprfly Chrome Extension and reconnect to resume auto-commenting.</p>
  `));
}

export async function sendDailySummary(
  email: string,
  name: string | null,
  stats: { totalComments: number; failedComments: number; pendingComments: number; accounts: string[] }
) {
  const accountList = stats.accounts.map((a) => `<li>${a}</li>`).join('');
  await sendMail(email, `Your Suprfly Daily Report — ${new Date().toLocaleDateString()}`, wrap('Daily Summary', `
    <p>Hi ${name || 'there'}, here's your daily report:</p>
    <p style="font-size:32px;font-weight:800;color:#22d3ee;text-align:center;margin:16px 0;">${stats.totalComments} comments posted</p>
    ${stats.failedComments > 0 ? `<p style="color:#ef4444;">Failed: ${stats.failedComments}</p>` : ''}
    ${stats.pendingComments > 0 ? `<p style="color:#f59e0b;">Pending approval: ${stats.pendingComments}</p>` : ''}
    <p style="font-size:13px;color:#a1a1aa;margin-top:12px;">Connected accounts:</p>
    <ul style="list-style:none;padding:0;color:#a1a1aa;">${accountList}</ul>
    <p style="text-align:center;margin:24px 0;">
      <a href="${config.frontendUrl}/activity" style="display:inline-block;padding:12px 32px;background:#22d3ee;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">View Full Activity</a>
    </p>
  `));
}

export async function sendPlanLimitWarning(email: string, limitType: string) {
  await sendMail(email, 'You\'re approaching your plan limit — Suprfly', wrap('Plan Limit Warning', `
    <p>You're approaching your <strong>${limitType}</strong> limit. Consider upgrading your plan to continue uninterrupted.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${config.frontendUrl}/billing" style="display:inline-block;padding:12px 32px;background:#f59e0b;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">Upgrade Plan</a>
    </p>
  `));
}

export async function sendWelcomeEmail(email: string, name: string) {
  await sendMail(email, 'Welcome to Suprfly!', wrap(`Welcome, ${name}!`, `
    <p>You're all set to start auto-commenting on LinkedIn & X with AI that sounds like you.</p>
    <p><strong>Next steps:</strong></p>
    <ol style="padding-left:20px;color:#a1a1aa;">
      <li>Install the Chrome Extension</li>
      <li>Connect your LinkedIn and/or X accounts</li>
      <li>Add keywords and creators to target</li>
      <li>Tune your voice in Tone Settings</li>
    </ol>
    <p style="text-align:center;margin:24px 0;">
      <a href="${config.frontendUrl}/dashboard" style="display:inline-block;padding:12px 32px;background:#22d3ee;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">Open Dashboard</a>
    </p>
  `));
}

export async function sendPlanActivated(email: string, plan: string) {
  await sendMail(email, `${plan} Plan Activated — Suprfly`, wrap('Plan Activated!', `
    <p>Your <strong>${plan}</strong> plan is now active. Enjoy your upgraded limits!</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${config.frontendUrl}/dashboard" style="display:inline-block;padding:12px 32px;background:#22d3ee;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">Open Dashboard</a>
    </p>
  `));
}

export async function sendPlanExpiringWarning(email: string, name: string, plan: string, expiresAt: Date | null) {
  const dateStr = expiresAt ? expiresAt.toLocaleDateString() : 'soon';
  await sendMail(email, 'Your Suprfly plan is expiring soon', wrap('Plan Expiring', `
    <p>Hi ${name}, your <strong>${plan}</strong> plan expires on <strong>${dateStr}</strong>.</p>
    <p>Renew to keep your auto-commenting active.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${config.frontendUrl}/billing" style="display:inline-block;padding:12px 32px;background:#f59e0b;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">Renew Plan</a>
    </p>
  `));
}

export async function sendPlanExpired(email: string, name: string) {
  await sendMail(email, 'Your Suprfly plan has expired', wrap('Plan Expired', `
    <p>Hi ${name}, your paid plan has expired and your account has been downgraded to the Free plan.</p>
    <p>Upgrade anytime to restore your full commenting limits.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${config.frontendUrl}/billing" style="display:inline-block;padding:12px 32px;background:#f59e0b;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">Upgrade Plan</a>
    </p>
  `));
}

export async function sendPaymentFailed(email: string, name: string) {
  await sendMail(email, 'Payment failed — Suprfly', wrap('Payment Failed', `
    <p>Hi ${name}, your latest payment was declined. Please update your payment method to keep your plan active.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${config.frontendUrl}/billing" style="display:inline-block;padding:12px 32px;background:#ef4444;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:600;">Update Payment</a>
    </p>
  `));
}

export async function sendPaymentReceived(email: string, amount: string, plan: string) {
  await sendMail(email, 'Payment received — Suprfly', wrap('Payment Confirmed', `
    <p>We've received your payment of <strong>$${amount}</strong> for the <strong>${plan}</strong> plan. Thank you!</p>
  `));
}

export async function sendDailyLimitReached(email: string, name: string, accountName: string) {
  await sendMail(email, `Daily comment limit reached — ${accountName}`, wrap('Daily Limit Reached', `
    <p>Hi ${name}, your account <strong>${accountName}</strong> has reached its daily comment limit.</p>
    <p>Comments will resume tomorrow. Upgrade your plan for higher limits.</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="${config.frontendUrl}/billing" style="display:inline-block;padding:12px 32px;background:#f59e0b;color:#09090b;border-radius:8px;text-decoration:none;font-weight:600;">Upgrade Plan</a>
    </p>
  `));
}

export async function sendMilestone(email: string, name: string, milestone: number) {
  await sendMail(email, `You've hit ${milestone} comments! — Suprfly`, wrap('Milestone Reached!', `
    <p>Congrats ${name}! You've posted <strong>${milestone.toLocaleString()}</strong> comments with Suprfly.</p>
    <p>Keep building your presence on autopilot.</p>
  `));
}
