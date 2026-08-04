import { AppShell } from "@/components/layout/app-shell";
import { DOCS } from "@/data/content";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <GlassCard className="p-8">
          <Badge variant="secondary">Documentation</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">DevKit documentation</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Admin-managed product guidance, usage notes and tool behavior.
          </p>
        </GlassCard>
        <div className="grid gap-6">
          {DOCS.map((page) => (
            <GlassCard key={page.slug} className="space-y-4 p-6">
              <div>
                <h2 className="text-xl font-semibold">{page.title}</h2>
                <p className="text-sm text-muted-foreground">{page.description}</p>
              </div>
              <div className="space-y-4">
                {page.sections.map((section) => (
                  <section key={section.id} className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </h3>
                    <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                      {section.content}
                    </p>
                  </section>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
