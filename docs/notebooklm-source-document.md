# The AI Backbone: Complete Source Document for Video Walkthrough

## Document Purpose

This is the comprehensive reference document for creating video walkthroughs of The AI Backbone. It covers what the system is, why it was built, how every piece works, the complete technical architecture, the build process, and how buyers should set it up. This document should give a narrator or presenter complete understanding of the product without needing any other reference.

---

## Part 1: The Origin Story

### The Problem That Started Everything

Henry Hunter Jr. runs a complex multi-platform business. He's the founder of Crust & Crumb Academy (a 400+ member paid Skool community), Baking Great Bread at Home (a 50,000+ member Facebook group), a published author of five books, and manages a blog, a recipe site, a YouTube channel, and multiple social platforms.

Every day, Henry uses four AI tools:
- **Claude** (Desktop and Code) for strategy, writing, community operations, and building software
- **ChatGPT** for quick utility tasks and brainstorming
- **Perplexity** for research and automated morning community briefs
- **Claude in the browser** for live community management on Skool

The problem was simple but painful: none of these tools could talk to each other.

Henry would have a great conversation with ChatGPT about his content strategy on Monday. On Tuesday, he'd open Claude and it had zero memory of that conversation. He'd explain his brand voice rules to Perplexity, then have to explain them again to Claude, then again to ChatGPT. Every tool started from zero, every single time.

His description of the problem: "It's like having four employees who never talk to each other and each one has amnesia every morning."

### The Insight

The fix wasn't to find one AI tool that does everything. The fix was to build a shared layer that sits behind ALL of them. A single database that every tool can read from and write to. When one tool learns something, every other tool can access that knowledge instantly.

Henry called this the AI Backbone.

### How It Got Built

The AI Backbone was built in a single afternoon using Claude Code (Anthropic's CLI agent). The entire system, from database schema to API endpoints to MCP server, was designed, coded, tested, and deployed in one session.

The build process:
1. Henry described what he needed in plain English
2. Claude Code designed the database schema with vector search support
3. The SQL was pasted into Supabase's SQL Editor and run
4. Claude Code wrote four API endpoints and deployed them to Vercel
5. Claude Code wrote an MCP server that gives Claude Desktop native memory tools
6. Claude Code wrote a browser-based capture widget for manual memory entry
7. 27 memories were extracted from ChatGPT and ingested into the system
8. The MCP server was connected to Claude Desktop
9. A live semantic search test confirmed everything worked end-to-end

Total cost of the infrastructure: effectively zero (Supabase free tier, Vercel free tier, OpenAI embeddings at $0.02 per million tokens).

---

## Part 2: How It Works (Non-Technical Explanation)

### The Core Concept

Imagine you have a filing cabinet in the middle of your office. Every AI tool you use has a key to that cabinet. When ChatGPT learns that you prefer short paragraphs and contractions in your writing, it drops a note in the cabinet. When you open Claude the next day, before Claude responds to anything, it checks the cabinet first. It finds the note about your writing preferences and uses them automatically.

That's the AI Backbone. Except instead of a physical filing cabinet, it's a database. And instead of notes, it stores "memories" with mathematical representations of their meaning so the system can find relevant information even when the exact words don't match.

### What Makes It Smart: Semantic Search

Normal search works by matching words. If you search for "flat bread," it finds documents containing those exact words. Semantic search is different. It understands meaning.

When you store a memory like "Dense crumb in my sourdough is usually caused by underfermentation," the system converts that sentence into 1,536 numbers (called a vector embedding) that represent its meaning. Later, if you search for "why is my bread flat," the system finds that memory even though none of the words match, because the meanings are related.

This is powered by OpenAI's text-embedding-3-small model. It costs about $0.02 per million tokens, which means you'd need to store thousands of memories before it costs a dollar.

### The Four Endpoints

The backbone exposes four API endpoints that any tool can call over the internet:

1. **POST /api/ingest** ("Remember this")
   - You send it a piece of text, a category, and an importance rating
   - It generates a vector embedding and stores everything in the database
   - Example: "Henry's brand voice is warm, direct, and practical. He uses contractions naturally and varies sentence length."

2. **GET /api/retrieve** ("What do you know about X?")
   - You send it a search query
   - It converts your query into a vector, then finds the 5 most similar memories
   - Returns them ranked by relevance with a similarity score
   - Example query: "writing style rules" returns memories about voice, brand guidelines, and content preferences

3. **POST /api/ingest/brief** ("Store today's morning brief")
   - Stores a structured daily summary with action items, draft replies, community pulse data, and content ideas
   - Designed for automated workflows that generate daily reports

4. **POST /api/ingest/member** ("Remember this person")
   - Stores or updates knowledge about a specific person
   - Name, notes about them, tags for categorization
   - Useful for community managers who interact with many members

### How Each AI Tool Connects

Different AI tools have different capabilities, so they connect in different ways:

**Claude Desktop** connects via MCP (Model Context Protocol). MCP is a standard that lets AI assistants use external tools natively. When Claude Desktop starts with the backbone MCP server configured, it gains three built-in tools: search_memory, store_memory, and get_daily_brief. Claude can use these automatically without any prompting. It just knows it has memory.

**ChatGPT** connects via HTTP API calls. You paste instructions into ChatGPT's Custom Instructions or a custom GPT's system prompt. The instructions tell ChatGPT the endpoint URLs and when to use them. ChatGPT can then make web requests to store and retrieve memories.

**Perplexity** connects the same way as ChatGPT, via HTTP API calls described in its automation prompt.

**Any other AI tool** that can make HTTP requests can connect. You just need the URL and your API key.

**The Capture Widget** is a web page (at /capture on your deployment) that anyone can bookmark. It's a simple form: type what you want to remember, pick a category, rate its importance, and click Store. It sends the memory to the backbone via the same API.

### A Real Day Using the Backbone

Here's what an actual day looks like with the backbone running:

**7:00 AM** — Perplexity runs an automated morning brief of Henry's Skool community. It scans new posts, pending members, and trending discussions. At the end of the run, it POSTs the entire brief to /api/ingest/brief. The brief is now stored with a vector embedding.

**7:30 AM** — Henry opens Claude Desktop and says "What happened in the community overnight?" Claude doesn't need to scan anything. It uses its search_memory tool to query the backbone. It finds the morning brief Perplexity stored 30 minutes ago and gives Henry a complete summary.

**10:00 AM** — Henry is in ChatGPT working on a blog post. He asks ChatGPT to check his brand voice rules before editing. ChatGPT hits GET /api/retrieve?q=brand+voice+rules and gets back: "Henry avoids em dashes, never says 'ensure' or 'delve,' uses contractions naturally, varies sentence length." ChatGPT didn't learn those rules. Claude taught them to the backbone weeks ago. But ChatGPT can use them like it always knew.

**2:00 PM** — A community member asks about switching flours in their sourdough starter. Any tool Henry opens already knows this is a common question (it's tagged as a recurring FAQ in the backbone) and knows to keep the answer consistent with his published sourdough starter guide.

**9:00 PM** — Henry has a brainstorming session with Claude about a new course. Claude stores three key insights from the conversation as memories. Tomorrow, if Henry opens ChatGPT to continue the planning, those insights are already available.

The key insight: no single tool needs to be the "main" tool. They all contribute to and benefit from the same shared knowledge.

---

## Part 3: Technical Architecture

### The Database Layer (Supabase + pgvector)

The backbone uses PostgreSQL (via Supabase) with the pgvector extension for vector similarity search.

**Five tables:**

1. **memories** — The core knowledge store
   - id (UUID, auto-generated)
   - content (text, the actual memory)
   - embedding (vector(1536), the mathematical meaning)
   - category (text: business, community, content, insight, etc.)
   - source (text: chatgpt, claude_session, manual, perplexity, etc.)
   - importance (integer 1-5, default 3)
   - tags (text array for organization)
   - related_ids (UUID array for cross-referencing)
   - created_at, last_accessed_at, access_count

2. **projects** — Active initiatives and their status
   - name, description, embedding, status, url, updated_at

3. **insights** — High-signal extracted knowledge
   - insight text, embedding, source_session, tags

4. **daily_briefs** — Archived daily summaries
   - brief_date (unique), summary, embedding
   - action_items, draft_replies, community_pulse, content_ideas, morning_post (all JSONB)

5. **member_profiles** — Knowledge about people
   - skool_name, embedding, notes, tags
   - first_seen_at, last_active_at

**The search function:**

A PostgreSQL function called search_memories takes a query embedding and returns the most similar memories using cosine similarity (the <=> operator in pgvector). It supports optional category filtering and configurable result count.

**Indexes:**

IVFFlat indexes on all embedding columns for fast approximate nearest neighbor search. These indexes use 100 lists for partitioning, which is appropriate for collections up to hundreds of thousands of records.

**Row-Level Security:**

RLS is enabled on all tables. The service role (used by the API) bypasses RLS. Anon users can read memories and projects but can't write.

### The API Layer (Vercel Serverless Functions)

Four TypeScript serverless functions deployed on Vercel:

Each function:
- Validates the API key from the x-api-key header (or Authorization: Bearer header, or ?key= query param)
- Handles CORS preflight requests
- Returns proper HTTP status codes and JSON responses

The auth module (lib/auth.ts) extracts and validates the key. The embeddings module (lib/embeddings.ts) calls OpenAI's embedding API. The Supabase client (lib/supabase.ts) uses the service role key to bypass RLS.

### The MCP Server

A Node.js script (mcp-server/index.js) that implements the Model Context Protocol over stdio (standard input/output). When Claude Desktop launches, it starts this script as a subprocess and communicates with it via JSON-RPC messages over stdin/stdout.

The server exposes three tools:
- search_memory — calls GET /api/retrieve
- store_memory — calls POST /api/ingest
- get_daily_brief — calls GET /api/retrieve with a date-specific query

The MCP server is configured in Claude Desktop's config file (claude_desktop_config.json) with the backbone URL and API key as environment variables.

### The Capture Widget

A single HTML file (public/capture/index.html) that provides a browser-based form for manual memory entry. It's a dark-themed UI matching the backbone aesthetic with:
- A password gate (API key serves as the password)
- A text area for content
- Category and source dropdowns
- A 5-star importance rating
- Comma-separated tags input
- A submit button that POSTs to /api/ingest

No framework, no build step. Just HTML, CSS, and vanilla JavaScript.

### The Embedding Process

When a memory is stored:
1. The text content is sent to OpenAI's text-embedding-3-small model
2. OpenAI returns a 1,536-dimensional float array
3. This array is stored in the embedding column as a pgvector vector
4. When searching, the query text goes through the same process
5. PostgreSQL calculates cosine similarity between the query vector and all stored vectors
6. Results are returned sorted by similarity (highest first)

The embedding model costs $0.02 per million tokens. A typical memory is 50-100 tokens. You'd need to store about 10,000-20,000 memories before the embedding costs reach $1.

---

## Part 4: The Product Package

### What Buyers Get

The AI Backbone is sold as a $97 one-time purchase. Buyers get:

1. **The complete codebase** — A GitHub repository containing all source code, ready to deploy
2. **The SQL schema** — A single file that creates all tables, indexes, functions, and policies
3. **The seeding prompt** — A pre-written prompt that extracts knowledge from existing AI conversation history
4. **The MCP server** — A Node.js script that gives Claude Desktop native memory tools
5. **The capture widget** — A browser-based form for manual memory entry
6. **QUICKSTART.md** — A 6-step plain-English setup guide
7. **Video walkthroughs** — Recorded explanations of the full system

### The Setup Process

The full setup takes about 30 minutes:

**Step 1: Create a Supabase project (5 minutes)**
- Sign up at supabase.com (free)
- Create a new project
- Go to SQL Editor, paste schema.sql, click Run
- Copy the Project URL and service_role key from Settings > API

**Step 2: Deploy to Vercel (5 minutes)**
- Click the Deploy button in the README (one-click deploy)
- Set four environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, BACKBONE_API_KEY
- The BACKBONE_API_KEY is any strong secret you make up (like a UUID)

**Step 3: Seed the backbone (10 minutes)**
- Open docs/seeding-prompt.txt
- Replace the placeholder URL and API key with your real values
- Paste the prompt into ChatGPT or Claude
- The AI reviews your conversation history and extracts key knowledge
- Each piece of knowledge is stored as a separate memory with proper categorization

**Step 4: Install the MCP server for Claude Desktop (5 minutes)**
- Open your Claude Desktop config file
- Add the MCP server config block with your URL and API key
- Restart Claude Desktop
- Verify the tools icon appears in the chat input

**Step 5: Bookmark the capture widget (1 minute)**
- Navigate to /capture on your deployed URL
- Bookmark it for quick access

**Step 6: Wire automations (optional)**
- If you run automated workflows, add a POST to /api/ingest at the end of each run

### The Tech Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Database | Supabase (PostgreSQL + pgvector) | Free tier |
| Embeddings | OpenAI text-embedding-3-small | ~$0.02/million tokens |
| API hosting | Vercel Serverless Functions | Free tier |
| Vector search | pgvector cosine similarity | Included with Supabase |
| MCP Server | Node.js (stdio transport) | Runs locally, free |
| Total monthly cost | | Effectively $0 |

---

## Part 5: The Build Timeline

This section documents exactly how the system was built, for anyone who wants to understand the process.

### Saturday, March 22, 2026

**Morning:** Henry and Claude Code audited the existing Supabase project (anponqqhjugwflakydsf.supabase.co) which already had 25+ tables for the Crust & Crumb Academy helper app. They decided to create the backbone tables in a new Supabase project to keep concerns separated.

**Schema deployment:** Claude Code generated the complete SQL schema. Henry's Claude in the browser pasted it into the Supabase SQL Editor and ran it. All five tables, the search function, four vector indexes, RLS policies, and the pgvector extension were created in one execution.

**API development:** Claude Code wrote four TypeScript serverless functions (ingest.ts, retrieve.ts, ingest-brief.ts, ingest-member.ts) plus three shared library files (supabase.ts, embeddings.ts, auth.ts). These were deployed to Vercel via the existing AssetMap project.

**Build debugging:** The first deployment failed because Vercel's bundler couldn't resolve the lib/ imports with "type": "module" in package.json. Removing that line fixed the issue. A second issue (FUNCTION_INVOCATION_FAILED) was resolved by ensuring the Vercel env vars were set correctly.

**First successful test:** An unauthenticated request to /api/retrieve returned {"error":"Unauthorized"}, confirming the function was running and the auth middleware was working correctly. An authenticated request returned {"results":[]}, confirming the full pipeline (auth, embedding, vector search) was operational.

**Memory seeding:** ChatGPT extracted 27 memories from its conversation history with Henry. These covered brand voice rules, teaching philosophy, recurring student questions, business decisions, content strategy, and key collaborator information. Claude Code ingested all 27 via POST requests to /api/ingest.

**MCP server connection:** The MCP server config was added to Henry's Claude Desktop config file. After restarting Claude Desktop, a test query ("Recall what you know about my sourdough starter FAQs") successfully retrieved relevant memories via semantic search.

**Integration documents:** Claude Code generated three integration documents: one for Claude Desktop (MCP config), one for ChatGPT (Custom Instructions), and one for Perplexity (automation prompt). Each document contains the endpoint URLs, authentication headers, and usage instructions specific to that tool.

**Product decision:** After seeing the backbone work end-to-end, Henry decided to package it as a $97 digital product. Claude Code built the complete product delivery system in the same session: landing page, Stripe checkout integration, delivery page with payment verification, and a clean public GitHub repository.

### The Product Build

**Landing page:** A single-page marketing site with dark theme (#0a0a0a background, #c8f55a lime accent), IBM Plex Mono for body text, Syne for headlines. Sections: Hero, Problem, Solution (with flow diagram), What's Inside (checklist), How It Works (3 steps), The Numbers (stats grid), Who This Is For, credibility section, and Pricing ($97 CTA).

**Stripe integration:** Server-side Checkout Sessions via Stripe's Node.js SDK. The CTA button calls POST /api/checkout, which creates a session and returns the Stripe Checkout URL. On successful payment, Stripe redirects to /thank-you with a session_id query parameter.

**Delivery page:** Verifies the Stripe session_id via /api/verify-session before showing content. Shows: GitHub repo link, ZIP download, setup documents (QUICKSTART, schema.sql, seeding-prompt.txt), video placeholder section, and a 6-step quick start guide. Stores the session in localStorage so returning customers don't need to re-verify.

**Two separate repositories:**
- henryhunterjr/ai-backbone (public) — the product itself
- henryhunterjr/ai-backbone-site (private) — the sales page and delivery system

---

## Part 6: Key Design Decisions

### Why Supabase instead of a hosted vector database?

Supabase gives you PostgreSQL with pgvector, which means you get relational data AND vector search in one database. Dedicated vector databases (Pinecone, Weaviate, Qdrant) are more powerful for massive-scale search, but for a personal knowledge base with hundreds to thousands of memories, pgvector is more than sufficient and keeps the architecture simple.

### Why Vercel Serverless Functions instead of Supabase Edge Functions?

The backbone API was built to be framework-agnostic. Vercel functions are simple TypeScript files that handle HTTP requests. They deploy automatically from a git push. No configuration beyond vercel.json. The existing Supabase project already has edge functions for the Crust & Crumb helper app, so keeping the backbone API on Vercel maintains clean separation.

### Why OpenAI for embeddings instead of an open-source model?

OpenAI's text-embedding-3-small model is inexpensive ($0.02/million tokens), produces high-quality 1,536-dimensional embeddings, and requires no infrastructure to run. Open-source alternatives (sentence-transformers, Nomic) would require hosting a model server. For a product meant to be deployed in an afternoon, an API call is simpler than self-hosting.

### Why a custom MCP server instead of using an existing one?

The MCP server is about 150 lines of JavaScript. It does exactly three things: search, store, and retrieve briefs. Using a generic MCP framework would add dependencies and complexity without benefit. The custom server has zero dependencies (uses Node.js built-in fetch), starts instantly, and is trivial to modify.

### Why static HTML instead of React/Next.js for the landing page?

The product site is a marketing page with a checkout button. It has no client-side routing, no state management, no data fetching beyond the checkout API call. Static HTML with inline CSS loads instantly, has zero JavaScript bundle overhead, and is trivially maintainable. The two API routes (checkout and verify-session) are Vercel serverless functions that don't need a framework.

### Why $97?

The price reflects the value of the system (saves 10+ minutes daily of re-explaining context to AI tools) while being accessible to solo operators and small business owners who are the target audience. It's positioned below course-level pricing ($297+) but above impulse-buy territory ($19-47), signaling that this is a real system, not a PDF guide.

---

## Part 7: Future Improvements

These are improvements that could be made to the system after the initial release:

1. **Email delivery** — Send buyers an email with the delivery link after payment, so they never lose access even if they close the browser
2. **Custom domain** — theaibackbone.com or similar for professional branding
3. **Analytics** — Vercel Analytics on the landing page to track traffic and conversion
4. **OG image** — Henry's thumbnail (showing ChatGPT, Claude, and Perplexity with "THEY DON'T TALK" and him pointing at the backbone) should be the social sharing image
5. **Automatic memory decay** — Lower the effective importance of old, rarely-accessed memories so fresh knowledge surfaces first
6. **Multi-user support** — Allow multiple users to have separate memory spaces in the same deployment
7. **Memory deduplication** — Detect and merge semantically identical memories to prevent bloat
8. **Export/backup** — One-click export of all memories as JSON for portability
9. **Dashboard** — A simple web UI showing memory count, categories, recent additions, and search history

---

## Glossary

**Vector embedding** — A list of numbers (typically 1,536) that represents the meaning of a piece of text. Two texts with similar meanings will have similar embeddings, even if they use completely different words.

**Cosine similarity** — A mathematical measure of how similar two vectors are. A score of 1.0 means identical, 0.0 means completely unrelated. In the backbone, memories with similarity above ~0.5 are typically relevant.

**pgvector** — A PostgreSQL extension that adds vector data types and similarity search operations. It enables "find me the 5 most similar items" queries on embedding columns.

**MCP (Model Context Protocol)** — A standard protocol that allows AI assistants to use external tools. Claude Desktop supports MCP natively. An MCP server defines tools (with names, descriptions, and input schemas) and handles tool calls via JSON-RPC over stdio.

**Supabase** — An open-source Firebase alternative built on PostgreSQL. Provides a database, authentication, file storage, and edge functions. The free tier includes 500MB database storage and 50,000 monthly active users.

**Vercel** — A cloud platform for deploying web applications. Serverless Functions run your backend code on demand without managing servers. The free tier includes 100GB bandwidth and 100 hours of serverless execution per month.

**Serverless function** — A piece of backend code that runs on demand. You write a function, deploy it, and the platform handles scaling, infrastructure, and billing. You only pay for the milliseconds your code actually runs.

**API key** — A secret string used to authenticate requests. The backbone uses a single BACKBONE_API_KEY that must be included in every request via the x-api-key header. Anyone with the key can read and write memories.

**RLS (Row-Level Security)** — A PostgreSQL feature that restricts which rows a user can access based on their role. The backbone uses RLS to prevent unauthorized direct database access while allowing the service role (used by the API) full access.

---

## About the Creator

Henry Hunter Jr. is a founder, author, baker, and strategist. He spent 26 years in marketing at CBS and Fox before building his baking education business. He learned to bake challah from a German baker named Herr Sherman during military service, and that story is the foundation of everything he teaches.

His community tagline: "Where bakers come not to get likes, but to get better."

His published works include Sourdough for the Rest of Us, From Oven to Market, The Yeast Water Handbook, The Loaf and the Lie, and Bread: A Journey Through History, Science, Art, and Community.

The AI Backbone was born from his daily experience managing a complex multi-platform business with multiple AI tools, and his frustration that none of them could share what they knew.
