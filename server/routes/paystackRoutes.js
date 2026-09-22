import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../Models/user.js";
import Transaction from "../Models/Transaction.js";
import { sendDepositApprovalEmail } from "./mailer.js";
import axios from "axios";

const router = express.Router();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

// Initialize Paystack Payment
router.post("/pay", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const { email } = user;
    const amount = 500 * 100; // Subscription fee in kobo

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount,
        currency: "NGN",
        callback_url: `${backendUrl}/api/paystack/verify`,
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    res.json({ authorization_url: paystackResponse.data.data.authorization_url });
  } catch (error) {
    console.error("Paystack error:", error.response?.data || error.message);
    res.status(500).json({ msg: "Payment initialization failed" });
  }
});

router.get("/verify", async (req, res) => {
  const { reference } = req.query;

  try {
    if (!reference) return res.status(400).json({ msg: "No transaction reference provided" });

    // Reject replays up front: if this reference was already recorded, don't
    // re-grant a subscription extension for it.
    const existing = await Transaction.findOne({ reference });
    if (existing) {
      return res.redirect(`${frontendUrl}/dashboard?success=true`);
    }

    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    const amount = paystackResponse.data.data.amount / 100;

    if (paystackResponse.data.data.status !== "success") {
      console.error(`Payment failed: ${paystackResponse.data.data.status}, reference: ${reference}`);
      return res.redirect(`${frontendUrl}/dashboard?success=false&reason=payment_failed`);
    }

    const email = paystackResponse.data.data.customer.email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found after successful payment`);
      return res.redirect(`${frontendUrl}/dashboard?success=false&reason=user_not_found`);
    }

    // Save the transaction record first — if it fails validation (or the
    // reference was already used, closing a race with a concurrent request),
    // nothing else has changed yet and we can safely report a failure. Once
    // this succeeds, the subscription grant below is not allowed to fail for
    // a reason that would misreport a real payment as an error.
    await new Transaction({
      userId: user._id,
      amount,
      paymentMethod: "Paystack",
      status: "verified",
      currency: "NGN",
      reference,
    }).save();

    const currentDate = new Date();
    let newExpiryDate;

    if (user.isSubscribed && user.subscriptionExpiry > currentDate) {
      newExpiryDate = new Date(user.subscriptionExpiry);
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);
    } else {
      newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);
    }

    user.isSubscribed = true;
    user.subscriptionExpiry = newExpiryDate;
    await user.save();

    // Best-effort — a failed confirmation email must not turn an already
    // -successful payment into an error page for the user.
    sendDepositApprovalEmail(user.email, amount, "paystack", reference).catch((err) =>
      console.error("Deposit approval email failed:", err.message)
    );

    return res.redirect(`${frontendUrl}/dashboard?success=true`);
  } catch (error) {
    console.error("Verification error details:", {
      message: error.message,
      response: error.response?.data,
      reference,
    });

    return res.redirect(`${frontendUrl}/dashboard?success=false&reason=verification_error`);
  }
});

export default router;
