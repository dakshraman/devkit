"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

interface ParsedColumn {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  defaultValue?: string;
  foreignKey?: { table: string; column: string };
}

interface ParsedTable {
  name: string;
  columns: ParsedColumn[];
}

interface Relationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

const SAMPLE_SQL = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  user_id INTEGER NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);`;

const SAMPLE_PRISMA = `model users {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String
  posts     posts[]
  comments  comments[]
  createdAt DateTime @default(now())
}

model posts {
  id        Int      @id @default(autoincrement())
  title     String
  body      String?
  user      users    @relation(fields: [userId], references: [id])
  userId    Int
  published Boolean  @default(false)
  comments  comments[]
  createdAt DateTime @default(now())
}

model comments {
  id        Int      @id @default(autoincrement())
  content   String
  post      posts    @relation(fields: [postId], references: [id])
  postId    Int
  user      users    @relation(fields: [userId], references: [id])
  userId    Int
  createdAt DateTime @default(now())
}`;

const TYPE_COLORS: Record<string, string> = {
  INT: "text-blue-500",
  INTEGER: "text-blue-500",
  SMALLINT: "text-blue-400",
  BIGINT: "text-blue-600",
  SERIAL: "text-blue-500",
  BIGSERIAL: "text-blue-600",
  SMALLSERIAL: "text-blue-400",
  VARCHAR: "text-emerald-500",
  CHAR: "text-emerald-400",
  TEXT: "text-emerald-600",
  BOOLEAN: "text-amber-500",
  TIMESTAMP: "text-purple-500",
  DATE: "text-purple-400",
  UUID: "text-pink-500",
  JSONB: "text-orange-500",
  DECIMAL: "text-cyan-500",
  REAL: "text-cyan-400",
  DOUBLE: "text-cyan-600",
  NUMERIC: "text-cyan-500",
  FLOAT: "text-cyan-400",
  BLOB: "text-gray-500",
  BINARY: "text-gray-400",
  VARBINARY: "text-gray-500",
  MEDIUMTEXT: "text-emerald-500",
  LONGTEXT: "text-emerald-600",
  MEDIUMINT: "text-blue-500",
  "DOUBLE PRECISION": "text-cyan-600",
};

const TYPE_GROUPS: Record<string, string> = {
  INT: "number",
  INTEGER: "number",
  SMALLINT: "number",
  BIGINT: "number",
  SERIAL: "number",
  BIGSERIAL: "number",
  SMALLSERIAL: "number",
  MEDIUMINT: "number",
  VARCHAR: "string",
  CHAR: "string",
  TEXT: "string",
  MEDIUMTEXT: "string",
  LONGTEXT: "string",
  BOOLEAN: "boolean",
  TIMESTAMP: "datetime",
  DATE: "datetime",
  UUID: "id",
  JSONB: "json",
  DECIMAL: "number",
  REAL: "number",
  DOUBLE: "number",
  NUMERIC: "number",
  FLOAT: "number",
  "DOUBLE PRECISION": "number",
  BLOB: "binary",
  BINARY: "binary",
  VARBINARY: "binary",
};

const GROUP_BG: Record<string, string> = {
  number: "bg-blue-500/10",
  string: "bg-emerald-500/10",
  boolean: "bg-amber-500/10",
  datetime: "bg-purple-500/10",
  id: "bg-pink-500/10",
  json: "bg-orange-500/10",
  binary: "bg-gray-500/10",
};

function extractBalancedBody(input: string): string {
  let depth = 0;
  let start = -1;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === "(") {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (input[i] === ")") {
      depth--;
      if (depth === 0) return input.slice(start, i);
    }
  }
  return "";
}

function splitColumns(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of body) {
    if (ch === "(") { depth++; current += ch; }
    else if (ch === ")") { depth--; current += ch; }
    else if (ch === "," && depth === 0) { parts.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseSqlSchema(input: string): { tables: ParsedTable[]; relationships: Relationship[] } {
  const tables: ParsedTable[] = [];
  const relationships: Relationship[] = [];

  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(input)) !== null) {
    const tableName = tableMatch[1].toLowerCase();
    const bodyStart = tableMatch.index + tableMatch[0].length;
    const body = extractBalancedBody(input.slice(bodyStart - 1));
    const columns: ParsedColumn[] = [];

    const lines = splitColumns(body);

    for (const line of lines) {
      const fkMatch = line.match(
        /FOREIGN\s+KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)/i
      );
      if (fkMatch) {
        const fkCol = fkMatch[1].toLowerCase();
        const fkTable = fkMatch[2].toLowerCase();
        const fkRefCol = fkMatch[3].toLowerCase();
        const existing = columns.find((c) => c.name === fkCol);
        if (existing) {
          existing.isForeignKey = true;
          existing.foreignKey = { table: fkTable, column: fkRefCol };
        }
        relationships.push({
          fromTable: tableName,
          fromColumn: fkCol,
          toTable: fkTable,
          toColumn: fkRefCol,
        });
        continue;
      }

      const pkConstraint = line.match(/PRIMARY\s+KEY/i);
      if (pkConstraint) {
        const pkColMatch = line.match(/PRIMARY\s+KEY\s*\((\w+)\)/i);
        if (pkColMatch) {
          const pkCol = pkColMatch[1].toLowerCase();
          const existing = columns.find((c) => c.name === pkCol);
          if (existing) existing.isPrimaryKey = true;
        }
        continue;
      }

      const colMatch = line.match(
        /^(\w+)\s+([\w\s().,]+?)(?:\s+(NOT\s+NULL|NULL))?(?:\s+(DEFAULT\s+\S+))?(?:\s+(UNIQUE))?(?:\s+(PRIMARY\s+KEY))?$/i
      );
      if (colMatch) {
        const colName = colMatch[1].toLowerCase();
        const colType = colMatch[2].trim().toUpperCase();
        const isNotNull = colMatch[3] != null && /NOT\s+NULL/i.test(colMatch[3]);
        const defaultValue = colMatch[4]?.replace(/^DEFAULT\s+/i, "");
        const isUnique = !!colMatch[5];
        const isPrimaryKey = !!colMatch[6];

        columns.push({
          name: colName,
          type: colType,
          isPrimaryKey,
          isForeignKey: false,
          isNotNull,
          isUnique,
          defaultValue,
        });
      }
    }

    tables.push({ name: tableName, columns });
  }

  return { tables, relationships };
}

function parsePrismaSchema(input: string): { tables: ParsedTable[]; relationships: Relationship[] } {
  const tables: ParsedTable[] = [];
  const relationships: Relationship[] = [];

  const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
  let modelMatch;

  while ((modelMatch = modelRegex.exec(input)) !== null) {
    const modelName = modelMatch[1].toLowerCase();
    const body = modelMatch[2];
    const columns: ParsedColumn[] = [];

    const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (line.startsWith("//") || line.startsWith("}") || line.startsWith("model")) continue;

      const fieldMatch = line.match(/^(\w+)\s+(\S+)/);
      if (!fieldMatch) continue;

      const fieldName = fieldMatch[1].toLowerCase();
      let fieldType = fieldMatch[2].replace(/[?[\]]/g, "").toLowerCase();

      const isId = /@id/i.test(line);
      const isUnique = /@unique/i.test(line);
      const hasDefault = /@default/i.test(line);
      const isRelation = /@relation/i.test(line);

      let isPrimaryKey = isId;
      let isForeignKey = false;
      let foreignKey: ParsedColumn["foreignKey"] = undefined;

      if (isRelation) {
        const relMatch = line.match(
          /@relation\s*\(\s*fields:\s*\[([^\]]+)\]\s*,\s*references:\s*\[([^\]]+)\]\s*\)/i
        );
        if (relMatch) {
          const sourceField = relMatch[1].trim().toLowerCase();
          const refField = relMatch[2].trim().toLowerCase();
          isForeignKey = true;

          const refModel = fieldType.toLowerCase();
          foreignKey = { table: refModel, column: refField };

          columns.push({
            name: sourceField,
            type: "INTEGER",
            isPrimaryKey: false,
            isForeignKey: true,
            isNotNull: true,
            isUnique: false,
            foreignKey,
          });

          relationships.push({
            fromTable: modelName,
            fromColumn: sourceField,
            toTable: refModel,
            toColumn: refField,
          });
          continue;
        }
      }

      if (fieldType === "int" || fieldType === "float" || fieldType === "decimal") {
        fieldType = fieldType.toUpperCase();
      } else if (fieldType === "string") {
        fieldType = "VARCHAR";
      } else if (fieldType === "boolean") {
        fieldType = "BOOLEAN";
      } else if (fieldType === "datetime" || fieldType === "date") {
        fieldType = "TIMESTAMP";
      } else if (fieldType === "json" || fieldType === "jsonb") {
        fieldType = "JSONB";
      } else {
        fieldType = fieldType.toUpperCase();
      }

      columns.push({
        name: fieldName,
        type: fieldType,
        isPrimaryKey,
        isForeignKey: false,
        isNotNull: !line.includes("?"),
        isUnique,
        defaultValue: hasDefault ? line.match(/@default\(([^)]+)\)/)?.[1] : undefined,
      });
    }

    tables.push({ name: modelName, columns });
  }

  return { tables, relationships };
}

function getForeignKeyTarget(columns: ParsedColumn[]): string | null {
  for (const col of columns) {
    if (col.foreignKey) return col.foreignKey.table;
  }
  return null;
}

const RELATIONSHIP_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#10b981",
  "#3b82f6",
];

export default function SchemaVisualizerTool({ tool }: { tool: Tool }) {
  const [schemaMode, setSchemaMode] = useState<"sql" | "prisma">("sql");
  const [input, setInput] = useState(SAMPLE_SQL);
  const [result, setResult] = useState<{ tables: ParsedTable[]; relationships: Relationship[] } | null>(null);
  const [error, setError] = useState("");
  const diagramRef = useRef<HTMLDivElement>(null);
  const tableRefs = useRef<Map<string, HTMLDivElement>>(new Map);
  const [lineCoords, setLineCoords] = useState<
    { x1: number; y1: number; x2: number; y2: number; color: string }[]
  >([]);

  const handleModeChange = (mode: "sql" | "prisma") => {
    setSchemaMode(mode);
    setInput(mode === "sql" ? SAMPLE_SQL : SAMPLE_PRISMA);
    setResult(null);
    setError("");
  };

  const visualize = useCallback(() => {
    setError("");
    try {
      const parsed =
        schemaMode === "sql" ? parseSqlSchema(input) : parsePrismaSchema(input);
      if (parsed.tables.length === 0) {
        setError("No tables found. Check your schema syntax.");
        setResult(null);
        return;
      }
      setResult(parsed);
    } catch {
      setError("Failed to parse schema. Check your syntax.");
      setResult(null);
    }
  }, [input, schemaMode]);

  const computeLines = useCallback(() => {
    if (!result || !diagramRef.current) return;
    const containerRect = diagramRef.current.getBoundingClientRect();
    const coords: typeof lineCoords = [];

    const targetTableMap = new Map<string, string>();
    result.tables.forEach((t) => {
      targetTableMap.set(t.name, t.name);
    });

    result.relationships.forEach((rel, idx) => {
      const fromEl = tableRefs.current.get(rel.fromTable);
      const toEl = tableRefs.current.get(rel.toTable);
      if (!fromEl || !toEl) return;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const fromCenterX = fromRect.left + fromRect.width / 2 - containerRect.left;
      const fromBottom = fromRect.bottom - containerRect.top;
      const toCenterX = toRect.left + toRect.width / 2 - containerRect.left;
      const toTop = toRect.top - containerRect.top;

      const fromX = fromCenterX;
      const fromY = fromBottom;
      const toX = toCenterX;
      const toY = toTop;

      const color = RELATIONSHIP_COLORS[idx % RELATIONSHIP_COLORS.length];
      coords.push({ x1: fromX, y1: fromY, x2: toX, y2: toY, color });
    });

    setLineCoords(coords);
  }, [result]);

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(computeLines, 50);
    return () => clearTimeout(timer);
  }, [result, computeLines]);

  useEffect(() => {
    if (!result) return;
    const handleResize = () => computeLines();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [result, computeLines]);

  const setTableRef = useCallback((name: string, el: HTMLDivElement | null) => {
    if (el) {
      tableRefs.current.set(name, el);
    } else {
      tableRefs.current.delete(name);
    }
  }, []);

  return (
    <Shell tool={tool}>
      <Panel
        title="Database Schema Visualizer"
        description="Paste SQL DDL or Prisma schema to generate interactive ER diagrams."
      >
        <div className="flex gap-2">
          <Button
            variant={schemaMode === "sql" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("sql")}
          >
            SQL DDL
          </Button>
          <Button
            variant={schemaMode === "prisma" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("prisma")}
          >
            Prisma
          </Button>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="font-mono text-[13px]"
          spellCheck={false}
        />
        <Button onClick={visualize}>Visualize</Button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </Panel>

      {result && (
        <Panel title="ER Diagram" description="Tables and their relationships.">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-primary" /> Primary Key
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-amber-500" /> Foreign Key
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-emerald-500" /> Not Null
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-purple-500" /> Unique
            </span>
          </div>
          <div
            ref={diagramRef}
            className="relative overflow-auto rounded-xl border border-border bg-background p-6"
            style={{ minHeight: 300 }}
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 0 }}
            >
              {lineCoords.map((line, i) => {
                const midY = (line.y1 + line.y2) / 2;
                const path = `M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`;
                return (
                  <g key={i}>
                    <path
                      d={path}
                      fill="none"
                      stroke={line.color}
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      opacity={0.7}
                    />
                    <circle cx={line.x2} cy={line.y2} r={4} fill={line.color} />
                    <polygon
                      points={`${line.x2 - 5},${line.y2 - 3} ${line.x2 + 5},${line.y2 - 3} ${line.x2},${line.y2 + 5}`}
                      fill={line.color}
                    />
                  </g>
                );
              })}
            </svg>

            <div className="relative z-10 flex flex-wrap gap-8 justify-center">
              {result.tables.map((table) => (
                <div
                  key={table.name}
                  ref={(el) => setTableRef(table.name, el)}
                  className="w-64 rounded-xl border border-border bg-card shadow-sm overflow-hidden"
                >
                  <div className="bg-primary/10 border-b border-border px-4 py-2.5 flex items-center gap-2">
                    <svg className="size-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    <span className="font-semibold text-sm">{table.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground bg-background rounded-full px-2 py-0.5">
                      {table.columns.length} cols
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {table.columns.map((col) => {
                      const typeGroup = TYPE_GROUPS[col.type] ?? "string";
                      const typeColor = TYPE_COLORS[col.type] ?? "text-muted-foreground";
                      const bgClass = GROUP_BG[typeGroup] ?? "bg-muted";
                      return (
                        <div
                          key={col.name}
                          className="px-4 py-2 flex items-center gap-2 text-xs"
                        >
                          {col.isPrimaryKey && (
                            <span title="Primary Key" className="text-primary shrink-0">
                              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 10l2.5-1L12 3l2.5 6L17 10l-2.5 1L13 17h-2l-1.5-6z" />
                              </svg>
                            </span>
                          )}
                          {col.isForeignKey && !col.isPrimaryKey && (
                            <span title="Foreign Key" className="text-amber-500 shrink-0">
                              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </span>
                          )}
                          {!col.isPrimaryKey && !col.isForeignKey && (
                            <span className="size-3.5 shrink-0" />
                          )}
                          <span className="font-mono truncate flex-1">{col.name}</span>
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${bgClass} ${typeColor}`}
                          >
                            {col.type}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {col.isPrimaryKey && (
                              <span className="rounded bg-primary/15 text-primary px-1 py-0.5 text-[10px] font-medium">
                                PK
                              </span>
                            )}
                            {col.isForeignKey && (
                              <span className="rounded bg-amber-500/15 text-amber-500 px-1 py-0.5 text-[10px] font-medium">
                                FK
                              </span>
                            )}
                            {col.isNotNull && (
                              <span className="rounded bg-emerald-500/15 text-emerald-500 px-1 py-0.5 text-[10px] font-medium">
                                NN
                              </span>
                            )}
                            {col.isUnique && !col.isPrimaryKey && (
                              <span className="rounded bg-purple-500/15 text-purple-500 px-1 py-0.5 text-[10px] font-medium">
                                UQ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.relationships.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Relationships</p>
              {result.relationships.map((rel, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: RELATIONSHIP_COLORS[i % RELATIONSHIP_COLORS.length] }}
                  />
                  <span className="font-mono">{rel.fromTable}.{rel.fromColumn}</span>
                  <svg className="size-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 12h14m-4-4 4 4-4 4" />
                  </svg>
                  <span className="font-mono">{rel.toTable}.{rel.toColumn}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </Shell>
  );
}
