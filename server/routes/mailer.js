import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. Renewal reminder (3 days before expiry)
export async function sendRenewalReminder(email, expiryDate) {
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Must be verified in SendGrid,
    to: email,
    subject: "🔄 Renew Your Airdrop Checker Subscription!",
    html: `
      <p>Your subscription expires on <strong>${expiryDate.toDateString()}</strong>.</p>
      <p>Renew now to avoid missing out on exclusive airdrop alerts!</p>
      <a href="https://yourwebsite.com/renew">👉 Click here to renew</a>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// 2. Subscription expired notification
export async function sendSubscriptionExpiredEmail(email) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "⚠️ Your Airdrop Checker Subscription Has Expired",
    html: `
      <p>Your subscription has expired. You’ll no longer receive premium alerts.</p>
      <a href="https://yourwebsite.com/renew?urgent=true">🔓 Renew now to restore access</a>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// 3. Subscription renewal confirmation
export async function sendSubscriptionRenewalEmail(email, newExpiryDate) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "✅ Your Airdrop Checker Subscription Has Been Renewed!",
    html: `
      <p>Your subscription has been successfully renewed until <strong>${newExpiryDate.toDateString()}</strong>.</p>
      <p>Thank you for staying with us!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// 4. Deposit approval email
export async function sendDepositApprovalEmail(email, amount, method, reference) {
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Deposit Approved",
      html: `
          <h3>Deposit Approved</h3>
          <p>Your deposit of <strong>$${amount}</strong> via <strong>${method}</strong> has been approved.</p>
          ${reference ? `<p>Reference: ${reference}</p>` : ""}
          <p>You can now access your updated balance in your dashboard.</p>
      `,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email}`);
  } catch (error) {
      console.error("Email send error:", error.message);
  }
}

