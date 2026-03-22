#!/usr/bin/env node

/**
 * AI Backbone — MCP Server for Claude Desktop
 *
 * Exposes three tools:
 *   search_memory  — semantic search over your knowledge base
 *   store_memory   — store a new insight or fact
 *   get_daily_brief — retrieve a daily brief by date
 *
 * Install: see README.md in this directory
 */

const BACKBONE_API_URL = process.env.BACKBONE_API_URL || "https://YOUR-APP.vercel.app";
const BACKBONE_API_KEY = process.env.BACKBONE_API_KEY || "";

// ── Tool definitions ─────────────────────────────────────────────

const TOOLS = [
  {
    name: "search_memory",
    description:
      "Search your personal knowledge base for relevant context. Returns the most semantically similar memories.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to search for" },
        count: { type: "number", description: "Number of results (default 5, max 20)" },
        category: {
          type: "string",
          description: "Optional category filter",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "store_memory",
    description:
      "Store a new insight, fact, or observation in your knowledge base. Use this when you learn something worth remembering.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "The text to remember" },
        category: { type: "string", description: "Category for this memory" },
        importance: {
          type: "number",
          description: "1-5 importance rating (default 3)",
          minimum: 1,
          maximum: 5,
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags for organization",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "get_daily_brief",
    description:
      "Retrieve a daily brief by date. Contains action items, draft replies, community pulse, and content ideas.",
    inputSchema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "ISO date string (YYYY-MM-DD). Omit for the most recent brief.",
        },
      },
    },
  },
];

// ── HTTP helpers ─────────────────────────────────────────────────

async function apiGet(path, params = {}) {
  const url = new URL(path, BACKBONE_API_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": BACKBONE_API_KEY,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(new URL(path, BACKBONE_API_URL).toString(), {
    method: "POST",
    headers: {
      "x-api-key": BACKBONE_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── Tool execution ──────────────────────────────────────────────

async function executeTool(name, args) {
  switch (name) {
    case "search_memory": {
      const result = await apiGet("/api/retrieve", {
        q: args.query,
        count: args.count,
        category: args.category,
      });
      return result.context || JSON.stringify(result);
    }

    case "store_memory": {
      const result = await apiPost("/api/ingest", {
        content: args.content,
        category: args.category || "general",
        source: "claude_session",
        importance: args.importance || 3,
        tags: args.tags || [],
      });
      return result.success
        ? `Stored memory (id: ${result.id})`
        : `Failed to store: ${result.error}`;
    }

    case "get_daily_brief": {
      const searchDate = args.date || new Date().toISOString().split("T")[0];
      const result = await apiGet("/api/retrieve", {
        q: `daily brief ${searchDate}`,
        count: 3,
      });
      return result.context || "No brief found for this date.";
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ── MCP stdio transport ─────────────────────────────────────────

let buffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let newlineIdx;
  while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, newlineIdx).trim();
    buffer = buffer.slice(newlineIdx + 1);
    if (line) handleMessage(line);
  }
});

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

async function handleMessage(line) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = msg;

  switch (method) {
    case "initialize":
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "ai-backbone", version: "1.0.0" },
        },
      });
      break;

    case "notifications/initialized":
      break;

    case "tools/list":
      send({
        jsonrpc: "2.0",
        id,
        result: { tools: TOOLS },
      });
      break;

    case "tools/call": {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const result = await executeTool(toolName, toolArgs);
        send({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }],
          },
        });
      } catch (err) {
        send({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true,
          },
        });
      }
      break;
    }

    default:
      if (id) {
        send({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        });
      }
  }
}

process.stderr.write("AI Backbone MCP server started\n");
