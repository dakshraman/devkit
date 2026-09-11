"use client";

import { useState } from "react";
import { format as formatSql, type SqlLanguage } from "sql-formatter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

const SQL_DIALECTS: { id: SqlLanguage; label: string }[] = [
  { id: "sql", label: "Standard SQL" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "sqlite", label: "SQLite" },
  { id: "tsql", label: "SQL Server (T-SQL)" },
  { id: "plsql", label: "Oracle (PL/SQL)" },
  { id: "mariadb", label: "MariaDB" },
  { id: "snowflake", label: "Snowflake" },
  { id: "bigquery", label: "BigQuery" },
];

export default function SqlTool({ tool }: { tool: Tool }) {
  const [dialect, setDialect] = useState<SqlLanguage>("sql");
  const [input, setInput] = useState("SELECT u.id, u.name, COUNT(o.id) AS orders FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE u.active = 1 GROUP BY u.id, u.name ORDER BY orders DESC LIMIT 10;");
  const [output, setOutput] = useState("");
  const run = () => {
    try {
      setOutput(formatSql(input, { language: dialect, keywordCase: "upper", tabWidth: 2, linesBetweenQueries: 2 }));
    } catch (error) {
      setOutput(error instanceof Error ? error.message : "Invalid SQL");
    }
  };
  return (
    <Shell tool={tool}>
      <Panel title="Beautify SQL" description="Auto-format SELECT, INSERT, UPDATE, DDL and more.">
        <Select value={dialect} onValueChange={(v) => setDialect(v as SqlLanguage)}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Dialect" /></SelectTrigger>
          <SelectContent>
            {SQL_DIALECTS.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={9} className="font-mono text-[13px]" />
        <Button onClick={run}>Format SQL</Button>
        {output && (
          <div className="space-y-2">
            <CopyButton value={output} toolSlug={tool.slug} toolName={tool.name} />
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6">{output}</pre>
          </div>
        )}
      </Panel>
    </Shell>
  );
}
