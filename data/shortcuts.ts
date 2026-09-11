export interface Shortcut {
  id: string;
  keys: string;
  label: string;
  description: string;
  category: "global" | "editor" | "navigation";
}

export const SHORTCUTS: Shortcut[] = [
  { id: "help", keys: "?", label: "Show shortcuts", description: "Open the keyboard shortcuts help panel", category: "global" },
  { id: "search", keys: "Ctrl+K", label: "Quick search", description: "Focus the tool search input", category: "global" },
  { id: "run", keys: "Ctrl+Enter", label: "Run / Format", description: "Execute the current tool action", category: "editor" },
  { id: "copy", keys: "Ctrl+Shift+C", label: "Copy output", description: "Copy the output to clipboard", category: "editor" },
  { id: "clear", keys: "Ctrl+Shift+X", label: "Clear", description: "Clear input and output fields", category: "editor" },
  { id: "download", keys: "Ctrl+Shift+D", label: "Download", description: "Download the output as a file", category: "editor" },
  { id: "new-line", keys: "Shift+Enter", label: "New line", description: "Insert a newline in the input", category: "editor" },
  { id: "tab-indent", keys: "Tab", label: "Indent", description: "Insert indent in editor", category: "editor" },
  { id: "prev-tool", keys: "Ctrl+[", label: "Previous tool", description: "Navigate to the previous tool", category: "navigation" },
  { id: "next-tool", keys: "Ctrl+]", label: "Next tool", description: "Navigate to the next tool", category: "navigation" },
  { id: "toggle-view", keys: "Ctrl+\\", label: "Toggle view", description: "Switch between split and stacked view", category: "editor" },
  { id: "find", keys: "Ctrl+F", label: "Find in output", description: "Focus the output search field", category: "editor" },
  { id: "escape", keys: "Escape", label: "Close / Cancel", description: "Close modals or cancel current action", category: "global" },
  { id: "save", keys: "Ctrl+S", label: "Save", description: "Save current state (where applicable)", category: "editor" },
  { id: "undo", keys: "Ctrl+Z", label: "Undo", description: "Undo last edit", category: "editor" },
];
