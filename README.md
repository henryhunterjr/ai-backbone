# The AI Backbone

A shared memory layer that connects every AI tool you use into one brain.

You use ChatGPT, Claude, Perplexity, and maybe others. Right now, each one starts from zero every time you open it. The AI Backbone gives them all access to the same knowledge base, so when one tool learns something, every other tool knows it too.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhenryhunterjr%2Fai-backbone&env=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,OPENAI_API_KEY,BACKBONE_API_KEY&envDescription=See%20.env.local.example%20for%20details)

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for the full setup guide. Takes about 30 minutes.

## How Each AI Tool Connects

| Tool | Connection Method | What You Do |
|------|------------------|-------------|
| **Claude Desktop** | MCP Server (native tools) | Add config block to `claude_desktop_config.json` |
| **ChatGPT** | HTTP API calls | Paste the integration doc into Custom Instructions |
| **Perplexity** | HTTP API calls | Add endpoints to your automation prompt |
| **Any other AI** | HTTP API calls | Give it the endpoint URLs and your API key |
| **Browser** | Capture widget at `/capture` | Bookmark it, use it manually from any session |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://abc123.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase Settings > API |
| `OPENAI_API_KEY` | For generating embeddings (~$0.02 per million tokens) |
| `BACKBONE_API_KEY` | Any strong secret you make up — used in the `x-api-key` header |

## API Reference

All endpoints require the `x-api-key` header with your `BACKBONE_API_KEY`.

### POST /api/ingest

Store a memory.

```json
{
  "content": "The thing to remember",
  "category": "business",
  "source": "chatgpt",
  "tags": ["strategy", "voice"],
  "importance": 3
}
```

Returns: `{ "id": "uuid", "success": true }`

### GET /api/retrieve?q=search+terms

Semantic search. Returns the 5 most relevant memories ranked by meaning, not just keyword matching.

Optional params: `count` (max 20), `category` (filter)

Returns: `{ "context": "formatted text block", "memories": [...] }`

### POST /api/ingest/brief

Store a daily brief (action items, community pulse, content ideas, etc.)

```json
{
  "summary": "Brief summary text",
  "action_items": [...],
  "draft_replies": [...],
  "community_pulse": {...},
  "content_ideas": [...]
}
```

### POST /api/ingest/member

Store or update a member profile.

```json
{
  "skool_name": "Member Name",
  "notes": "What they're working on",
  "tags": ["sourdough", "beginner"]
}
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Database | Supabase (PostgreSQL + pgvector) |
| Embeddings | OpenAI text-embedding-3-small (1536 dimensions) |
| API | Vercel Serverless Functions |
| Search | Cosine similarity via pgvector |
| MCP Server | Node.js (stdio transport) |
| Hosting | Vercel (free tier) |

## Cost

Effectively zero at normal usage. Supabase free tier, Vercel free tier, and OpenAI embeddings cost about $0.02 per million tokens (you'd need to store thousands of memories before it costs a dollar).

## License

MIT
