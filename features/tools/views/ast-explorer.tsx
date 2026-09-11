"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

const SAMPLE_CODE = `function hello(name) {
  return "Hello " + name;
}`;

type ParserPlugin =
  | "typescript"
  | "jsx"
  | "decorators"
  | "decorators-legacy"
  | "classProperties"
  | "classPrivateProperties"
  | "classPrivateMethods"
  | "classStaticBlock"
  | "exportDefaultFrom"
  | "exportNamespaceFrom"
  | "dynamicImport"
  | "optionalChaining"
  | "nullishCoalescingOperator"
  | "optionalCatchBinding"
  | "importMeta"
  | "bigInt"
  | "topLevelAwait"
  | "importAssertions"
  | "importAttributes"
  | "importReflection"
  | "explicitResourceManagement"
  | "regexpUnicodeSets"
  | "decimal"
  | "moduleBlocks"
  | "destructuringPrivate";

const LANGUAGES = [
  { label: "JavaScript", value: "js", sourceType: "module" as const, plugins: [] as ParserPlugin[] },
  { label: "TypeScript", value: "ts", sourceType: "module" as const, plugins: ["typescript"] as ParserPlugin[] },
  { label: "JSX", value: "jsx", sourceType: "module" as const, plugins: ["jsx"] as ParserPlugin[] },
  { label: "TSX", value: "tsx", sourceType: "module" as const, plugins: ["typescript", "jsx"] as ParserPlugin[] },
];

const SAMPLES: Record<string, string> = {
  js: `function hello(name) {
  return "Hello " + name;
}`,
  ts: `interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello \${user.name}\`;
}`,
  jsx: `function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}`,
  tsx: `type Props = {
  label: string;
  count: number;
};

const Badge: React.FC<Props> = ({ label, count }) => (
  <span className="badge">
    {label}: {count}
  </span>
);`,
};

const NODE_COLORS: Record<string, string> = {
  Program: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  FunctionDeclaration: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  FunctionExpression: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  ArrowFunctionExpression: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  VariableDeclaration: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  VariableDeclarator: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  ReturnStatement: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  IfStatement: "bg-orange-500/12 text-orange-600 dark:text-orange-400",
  BlockStatement: "bg-pink-500/12 text-pink-600 dark:text-pink-400",
  ExpressionStatement: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-400",
  CallExpression: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-400",
  Identifier: "bg-teal-500/12 text-teal-600 dark:text-teal-400",
  StringLiteral: "bg-lime-500/12 text-lime-600 dark:text-lime-400",
  NumericLiteral: "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400",
  TemplateLiteral: "bg-lime-500/12 text-lime-600 dark:text-lime-400",
  MemberExpression: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-400",
  JSXElement: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  JSXOpeningElement: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  JSXClosingElement: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  JSXIdentifier: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  JSXAttribute: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  JSXText: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  TSTypeAnnotation: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  TSTypeReference: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  TSTypeAliasDeclaration: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  TSInterfaceDeclaration: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  TSPropertySignature: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  TSFunctionType: "bg-purple-500/12 text-purple-600 dark:text-purple-400",
  ClassDeclaration: "bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400",
  ClassBody: "bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400",
  MethodDefinition: "bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400",
};

const DEFAULT_NODE_COLOR = "bg-secondary text-secondary-foreground";

function getNodeColor(type: string): string {
  return NODE_COLORS[type] ?? DEFAULT_NODE_COLOR;
}

function getChildren(node: Record<string, unknown>): [string, unknown][] {
  const children: [string, unknown][] = [];
  for (const [key, value] of Object.entries(node)) {
    if (key === "type" || key === "start" || key === "end" || key === "loc" || key === "leadingComments" || key === "trailingComments" || key === "innerComments") continue;
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && typeof (item as Record<string, unknown>).type === "string") {
          children.push([key, item]);
        }
      }
    } else if (typeof value === "object" && typeof (value as Record<string, unknown>).type === "string") {
      children.push([key, value]);
    }
  }
  return children;
}

function getNodeLabel(node: Record<string, unknown>): string {
  const type = node.type as string;
  if (type === "Identifier") return `Identifier: ${node.name}`;
  if (type === "StringLiteral") return `StringLiteral: "${String(node.value).slice(0, 30)}${String(node.value).length > 30 ? "..." : ""}"`;
  if (type === "NumericLiteral") return `NumericLiteral: ${node.value}`;
  if (type === "BooleanLiteral") return `BooleanLiteral: ${node.value}`;
  if (type === "NullLiteral") return "NullLiteral: null";
  if (type === "JSXIdentifier") return `JSXIdentifier: ${node.name}`;
  if (type === "JSXText") return `JSXText: "${String(node.value).slice(0, 30)}${String(node.value).length > 30 ? "..." : ""}"`;
  if (type === "JSXAttribute" && node.name && typeof node.name === "object") {
    return `JSXAttribute: ${(node.name as Record<string, unknown>).name}`;
  }
  return type;
}

function getProperties(node: Record<string, unknown>): [string, string][] {
  const props: [string, string][] = [];
  for (const [key, value] of Object.entries(node)) {
    if (key === "type" || key === "start" || key === "end" || key === "loc" || key === "leadingComments" || key === "trailingComments" || key === "innerComments") continue;
    if (value === null || value === undefined) continue;
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        const objItems = value.filter(
          (item) => item && typeof item === "object" && typeof (item as Record<string, unknown>).type === "string"
        );
        if (objItems.length > 0) continue;
        if (value.length > 0) {
          props.push([key, JSON.stringify(value)]);
        }
      } else if (typeof (value as Record<string, unknown>).type === "string") {
        continue;
      } else {
        props.push([key, JSON.stringify(value)]);
      }
    } else {
      props.push([key, String(value)]);
    }
  }
  return props;
}

interface AstNodeProps {
  node: Record<string, unknown>;
  path: string;
  source: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  selectedPath: string | null;
  onSelect: (path: string, node: Record<string, unknown>) => void;
  depth?: number;
  childKey?: string;
}

function AstNodeComponent({ node, path, source, expanded, onToggle, selectedPath, onSelect, depth = 0, childKey }: AstNodeProps) {
  const children = getChildren(node);
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(path);
  const isSelected = selectedPath === path;
  const label = getNodeLabel(node);
  const nodeType = node.type as string;
  const start = node.start as number;
  const end = node.end as number;
  const snippet = source.slice(start, Math.min(end, start + 80));

  const nodeColor = getNodeColor(nodeType);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (hasChildren) onToggle(path);
          onSelect(path, node);
        }}
        className={`group flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs font-mono transition-colors ${
          isSelected ? "bg-primary/12 text-primary" : "hover:bg-accent/60 text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {childKey && (
          <span className="text-muted-foreground mr-0.5 shrink-0">{childKey}:</span>
        )}
        {hasChildren ? (
          <span className="shrink-0 text-muted-foreground">
            {isOpen ? "▼" : "▶"}
          </span>
        ) : (
          <span className="shrink-0 text-muted-foreground w-3" />
        )}
        <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 ${nodeColor}`}>
          {label}
        </Badge>
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {start}:{end}
        </span>
      </button>
      {hasChildren && isOpen && (
        <div>
          {children.map(([key, child], i) => (
            <AstNodeComponent
              key={`${path}.${key}.${i}`}
              node={child as Record<string, unknown>}
              path={`${path}.${key}.${i}`}
              source={source}
              expanded={expanded}
              onToggle={onToggle}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
              childKey={key}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AstExplorerTool({ tool }: { tool: Tool }) {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [lang, setLang] = useState("js");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Record<string, unknown> | null>(null);
  const [ast, setAst] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const langConfig = useMemo(() => LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0], [lang]);

  const parseCode = useCallback(() => {
    setError(null);
    setSelectedPath(null);
    setSelectedNode(null);

    try {
      const plugins: string[] = [...langConfig.plugins];
      if (lang === "jsx" && !plugins.includes("jsx")) plugins.push("jsx");

      const { parse } = require("@babel/parser");
      const result = parse(code, {
        sourceType: langConfig.sourceType,
        plugins,
        errorRecovery: true,
      });
      setAst(result.program);
      setExpanded(new Set(["root"]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse");
      setAst(null);
    }
  }, [code, langConfig]);

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback((path: string, node: Record<string, unknown>) => {
    setSelectedPath(path);
    setSelectedNode(node);
  }, []);

  const handleLangChange = useCallback((newLang: string) => {
    setLang(newLang);
    setCode(SAMPLES[newLang] ?? SAMPLES.js);
    setAst(null);
    setError(null);
    setSelectedPath(null);
    setSelectedNode(null);
    setExpanded(new Set(["root"]));
  }, []);

  const detailProps = useMemo(() => {
    if (!selectedNode) return [];
    return getProperties(selectedNode);
  }, [selectedNode]);

  const highlightRange = useMemo(() => {
    if (!selectedNode || typeof selectedNode.start !== "number" || typeof selectedNode.end !== "number") return null;
    return { start: selectedNode.start as number, end: selectedNode.end as number };
  }, [selectedNode]);

  const highlightedCode = useMemo(() => {
    if (!highlightRange || !code) return null;
    const { start, end } = highlightRange;
    const before = code.slice(0, start);
    const highlighted = code.slice(start, end);
    const after = code.slice(end);
    return { before, highlighted, after };
  }, [highlightRange, code]);

  const nodeCount = useMemo(() => {
    if (!ast) return 0;
    let count = 0;
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if (typeof (node as Record<string, unknown>).type === "string") {
        count++;
        for (const value of Object.values(node as Record<string, unknown>)) {
          if (Array.isArray(value)) {
            value.forEach(walk);
          } else if (value && typeof value === "object" && typeof (value as Record<string, unknown>).type === "string") {
            walk(value);
          }
        }
      }
    };
    walk(ast);
    return count;
  }, [ast]);

  return (
    <Shell tool={tool} description="Parse JavaScript/TypeScript into an Abstract Syntax Tree and explore the structure interactively.">
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Code Editor" description="Write or paste code, then parse it into an AST.">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => handleLangChange(l.value)}
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                  lang === l.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={16}
            className="font-mono text-xs"
            spellCheck={false}
          />
          <div className="flex items-center gap-2">
            <Button onClick={parseCode}>Parse</Button>
            {ast && (
              <span className="text-xs text-muted-foreground">{nodeCount} nodes</span>
            )}
          </div>
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
              {error}
            </div>
          )}
          {highlightedCode && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Selected range ({highlightRange!.start}:{highlightRange!.end})</p>
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6">
                <span>{highlightedCode.before}</span>
                <mark className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{highlightedCode.highlighted}</mark>
                <span>{highlightedCode.after}</span>
              </pre>
            </div>
          )}
        </Panel>

        <Panel title="AST Tree" description="Click nodes to expand/collapse and view details.">
          {ast ? (
            <div className="space-y-4">
              <div className="max-h-[520px] overflow-auto rounded-xl border border-border bg-background p-2">
                <AstNodeComponent
                  node={ast}
                  path="root"
                  source={code}
                  expanded={expanded}
                  onToggle={handleToggle}
                  selectedPath={selectedPath}
                  onSelect={handleSelect}
                />
              </div>
              {selectedNode && (
                <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getNodeColor(selectedNode.type as string)}>
                      {(selectedNode.type as string) ?? "Unknown"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {String(selectedNode.start)}:{String(selectedNode.end)}
                    </span>
                  </div>
                  {detailProps.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Properties</p>
                      <div className="grid gap-1.5">
                        {detailProps.map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2 rounded-lg bg-secondary/50 px-2.5 py-1.5 text-xs">
                            <span className="shrink-0 font-medium text-muted-foreground">{key}:</span>
                            <span className="break-all font-mono text-foreground">{value.length > 120 ? value.slice(0, 120) + "..." : value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailProps.length === 0 && (
                    <p className="text-xs text-muted-foreground">No additional properties.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {error ? "Fix the parse error and try again." : "Click \"Parse\" to generate the AST."}
            </div>
          )}
        </Panel>
      </div>
    </Shell>
  );
}
