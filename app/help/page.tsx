import { AppShell } from "@/components/layout/app-shell";
import { FAQS } from "@/data/content";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

export default function HelpPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard className="p-8">
          <Badge variant="secondary">Help</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Help and FAQ</h1>
          <p className="mt-2 text-muted-foreground">
            Short answers about privacy, persistence and tool behavior.
          </p>
        </GlassCard>
        <div className="grid gap-4">
          {FAQS.map((item) => (
            <GlassCard key={item.q} className="space-y-2 p-6">
              <h2 className="text-base font-semibold">{item.q}</h2>
              <p className="text-sm leading-7 text-muted-foreground">{item.a}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
