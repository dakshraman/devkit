import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="max-w-xl space-y-4 p-8 text-center">
          <Badge variant="secondary">404</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The requested page does not exist in the DevKit app.
          </p>
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Return home
          </Link>
        </GlassCard>
      </div>
    </AppShell>
  );
}
