import { AppShell } from "@/components/layout/app-shell";
import { CHANGELOG } from "@/data/content";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

export default function ChangelogPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard className="p-8">
          <Badge variant="secondary">Changelog</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Release notes</h1>
          <p className="mt-2 text-muted-foreground">
            Admin-authored release history and major product updates.
          </p>
        </GlassCard>
        <div className="space-y-4">
          {CHANGELOG.map((entry) => (
            <GlassCard key={entry.version} className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{entry.title}</h2>
                  <p className="text-sm text-muted-foreground">{entry.date}</p>
                </div>
                <Badge>{entry.version}</Badge>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>• {highlight}</li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
