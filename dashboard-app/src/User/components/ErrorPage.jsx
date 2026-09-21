import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hero-radial px-4 text-center text-white">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand">
        <Zap className="h-6 w-6 text-white" />
      </span>
      <h1 className="text-3xl font-medium">404 — Page not found</h1>
      <p className="max-w-sm text-muted">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-2">
        Back home
      </Link>
    </div>
  );
}
