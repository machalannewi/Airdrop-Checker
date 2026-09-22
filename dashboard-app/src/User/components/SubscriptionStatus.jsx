import { CheckCircle2, CircleAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function SubscriptionStatus() {
  const { subscribed, subscriptionExpiry } = useAuth();

  const expiryDate = subscriptionExpiry ? new Date(subscriptionExpiry) : null;
  const expiryText =
    expiryDate && !Number.isNaN(expiryDate.getTime())
      ? expiryDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : null;

  if (subscribed) {
    return (
      <div className="card flex items-start gap-3 border border-emerald-500/20 bg-emerald-500/5 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
        <div>
          <p className="font-medium text-emerald-400">You're on the Pro plan</p>
          <p className="mt-0.5 text-sm text-muted">
            {expiryText
              ? `Your subscription renews on ${expiryText}.`
              : "Your subscription is active."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex items-start gap-3 border border-ink-700 p-4">
      <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-light" />
      <div>
        <p className="font-medium">No active subscription</p>
        <p className="mt-0.5 text-sm text-muted">
          Subscribe to the Pro plan to unlock airdrop alerts and automated claim reminders.
        </p>
      </div>
    </div>
  );
}
