import type { ChangelogEntry, DocPage, FaqItem } from "@/types";

/* ------------------------------------------------------------------ */
/* Documentation & support content — admin-managed.                    */
/* ------------------------------------------------------------------ */

export const DOCS: DocPage[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "An introduction to DevKit and how to get the most out of it.",
    sections: [
      {
        id: "what-is-devkit",
        title: "What is DevKit?",
        content:
          "DevKit is an all-in-one developer productivity toolkit that runs entirely in your browser. It bundles 20+ focused tools — formatters, encoders, generators, analyzers and testers — into one place so you can stop tab-hopping between scattered utilities.\n\nEvery tool is frontend-only. Your input never leaves your device, which means no accounts, no uploads, and no worrying about where your data goes.",
      },
      {
        id: "navigating",
        title: "Navigating DevKit",
        content:
          "Use the sidebar to browse tools grouped by category. Press Ctrl+K (⌘K on macOS) to open the Command Palette for instant tool switching, and use the global search box in the header to filter the whole toolkit.\n\nThe Dashboard shows featured and popular tools, your favorites, recently used tools and recently copied items.",
      },
      {
        id: "keyboard-shortcuts",
        title: "Keyboard Shortcuts",
        content:
          "Ctrl+K — Open command palette.\nCtrl+1 … Ctrl+9 — Jump to the tool occupying that position in the quick-access bar on the dashboard.\nCtrl+Shift+C — Open copy history.\nT — Toggle between light and dark theme.\nEscape — Close any open palette, dialog or drawer.",
      },
      {
        id: "privacy",
        title: "Privacy & Local-Only Processing",
        content:
          "DevKit stores only personalization data — theme, favorites, recent tools and copy history — in your browser's LocalStorage. Nothing else is persisted. Tool data such as pasted JSON, generated passwords or uploaded images is stored in memory only and discarded when you leave the page.\n\nThe only network requests are the ones you explicitly trigger: GitHub and npm public APIs in the analyzers, and your own requests in the API Tester.",
      },
    ],
  },
  {
    slug: "conversion-tools",
    title: "Conversion Tools",
    description: "JSON formatting, Base64, URL encoding and image conversion.",
    sections: [
      {
        id: "json",
        title: "JSON Formatter",
        content:
          "Paste or upload JSON, then pretty-print it with a selected indentation (2 or 4 spaces), or minify it into a single compact line. The validator catches syntax and structural errors before formatting, and the summary panel shows counts for objects, arrays, strings and primitives.\n\nYou can directly download the formatted result as a .json file or copy it.",
      },
      {
        id: "base64",
        title: "Base64 Encode / Decode",
        content:
          "The Base64 tool converts plain text to Base64 and back. It supports UTF-8 text safely, handles URL-safe Base64, and shows an immediate live conversion with copy buttons for both outputs.",
      },
      {
        id: "url",
        title: "URL Encoder / Decoder",
        content:
          "Encodes characters that are unsafe in URLs (spaces, &, =, #, etc.) using percent-encoding, and decodes them back. Use the URI mode when you want broader encoding encompassable of the entire address.",
      },
      {
        id: "image",
        title: "Image to Base64",
        content:
          "Drop or select an image file. DevKit reads it locally and produces a data URI you can embed directly into HTML <img> tags, CSS background-image values, or email signatures. Output mirrors the exact MIME type of the source file — PNG stays png, JPEG stays jpeg.",
      },
    ],
  },
  {
    slug: "generator-tools",
    title: "Generator Tools",
    description: "UUIDs, hashes, passwords, QR codes and lorem ipsum.",
    sections: [
      {
        id: "uuid",
        title: "UUID Generator",
        content:
          "Generate an RFC 4122 version 4 UUID with a single click, or switch to bulk mode to create 5, 10, 50, 100 or 500 identifiers at once. Copy all generated IDs as newline-separated values, one per line, or as a comma-separated list.",
      },
      {
        id: "hash",
        title: "Hash Generator",
        content:
          "Compute an MD5, SHA-1 or SHA-256 digest of any text. SHA variants are generated with the Web Crypto API (hardware accelerated); MD5 uses a pure-JavaScript implementation for compatibility. Select each algorithm to reveal its digest, and compare multiple algorithms side by side.",
      },
      {
        id: "password",
        title: "Password Generator",
        content:
          "Create strong random passwords on-device. Toggle to include uppercase, lowercase, numbers and symbols, then set your desired length between 4 and 128 characters. The generator guarantees at least one character from every enabled set, and a strength meter grades your result.",
      },
      {
        id: "qrcode",
        title: "QR Code Generator",
        content:
          "Turn any text or URL into a scannable QR code. Pick an error-correction level (L/M/Q/H) for resilience, choose the module size, and download the result as a crisp PNG at your chosen scale.",
      },
      {
        id: "lorem",
        title: "Lorem Ipsum Generator",
        content:
          "Generate placeholder text in word, sentence or paragraph lengths. Configure the number and starting options, enable markdown formatting for easy pasting into documents, and copy the result in one click.",
      },
    ],
  },
  {
    slug: "developer-tools",
    title: "Developer Tools",
    description: "JWT, regex, markdown, API testing, diff and snippets.",
    sections: [
      {
        id: "jwt",
        title: "JWT Decoder",
        content:
          "Paste a JSON Web Token and DevKit decodes its header and payload automatically, showing each field with its full value. For tokens carrying exp (expiry), nbf (not valid before) and iat (issued at) claims, it renders human-readable timestamps and a live expiration status badge.",
      },
      {
        id: "regex",
        title: "Regex Playground",
        content:
          "Write a pattern, pick your flags (g, i, m, s, u) and test against sample text. Matches are highlighted inline, and the match list shows the full match plus capture groups with their indices. The right-hand panel explains the pattern with a safety timeout so catastrophic backtracking can't hang the page.",
      },
      {
        id: "markdown",
        title: "Markdown Editor",
        content:
          "Write Markdown in the left panel with instant rendered preview on the right. Headings, lists, links, images, code blocks, blockquotes and tables render in real time, and you can copy the raw source or the rendered HTML.",
      },
      {
        id: "api",
        title: "API Tester",
        content:
          "An in-browser request builder. Pick a method (GET, POST, PUT, PATCH, DELETE), enter a URL, configure headers and query parameters as key-value rows, and attach a JSON body. DevKit performs the real request, shows the request summary, status code, response time, and pretty-printed response body with timing breakdowns.",
      },
      {
        id: "diff",
        title: "Diff Checker",
        content:
          "Paste two texts and the unified diff view highlights added, removed and unchanged lines at a glance, together with a change summary and a word-level count. Copy the unified diff for your changelog or Pull Request.\n\nTip: enable \"Trim trailing whitespace\" when comparing code formatted differently.",
      },
      {
        id: "snippets",
        title: "Code Snippet Viewer",
        content:
          "Browse the curated snippet library bundled with the application. Use the language filter and search box to refine, then copy any snippet or download it to your machine. Snippets are maintained by DevKit; users cannot add, edit or delete them.",
      },
    ],
  },
  {
    slug: "analyzer-tools",
    title: "Analyzer Tools",
    description: "GitHub profile analysis and npm package exploration.",
    sections: [
      {
        id: "github",
        title: "GitHub Profile Analyzer",
        content:
          "Enter any public GitHub username. DevKit calls the public GitHub API to pull profile data, the public repository list, avatar, follower and following counts, and the user's public contributions. The dashboard charts aggregate their top languages by repository and the most starred repositories.",
      },
      {
        id: "npm",
        title: "NPM Package Explorer",
        content:
          "Enter an npm package name (e.g. react, axios, zod). DevKit fetches from the npm registry and renders the package summary, weekly download trends over the last year, the README, dependencies and a full version history table.",
      },
    ],
  },
];

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.2.0",
    date: "2026-07-20",
    title: "Diff Checker & visual polish",
    highlights: [
      "New Diff Checker tool with line-by-line comparison and unified diff export.",
      "GitHub analyzer now resolves profile pinned repositories.",
      "Smoother sidebar animations and refined command palette.",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-06-02",
    title: "Analyzers ship",
    highlights: [
      "New GitHub Profile Analyzer and NPM Package Explorer.",
      "Copy History now captures previews from every tool.",
      "Dark/light themes load instantly without a flash.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-05-01",
    title: "DevKit launch",
    highlights: [
      "20 tools launched: formatters, generators, codecs and analyzers.",
      "Dashboard with featured, popular, recent and favorite tools.",
      "Command palette (Ctrl+K), global search, keyboard shortcuts.",
      "Fully local: no accounts, no backend, no data stored.",
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    q: "Is my data stored anywhere?",
    a: "No. DevKit is 100% front-end. The only persistence is your personal preferences, favorites, recent tools and copy history — and even that lives only in your browser's LocalStorage.",
  },
  {
    q: "Do I need an account or API key?",
    a: "No. All tools work instantly with no sign-up. Network tools that need a source (GitHub, npm, your own REST requests) call the matching public APIs directly from your browser.",
  },
  {
    q: "Are the online analyzers rate-limited?",
    a: "The GitHub API rate-limits anonymous requests (60 requests/hour per IP) and the npm registry is generous. Wait a while if you exceed it — or simply refresh later.",
  },
  {
    q: "Can users add snippets?",
    a: "No. Snippets are curated by the DevKit team and ship with the application. As a user you can search, copy and download, but never edit or create snippet content.",
  },
  {
    q: "Is my data stored anywhere?",
    a: "Only locally. Everything else is computed in memory and discarded when you navigate away.",
  },
];