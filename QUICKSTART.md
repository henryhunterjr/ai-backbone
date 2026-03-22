# AI Backbone — Quick Start

You'll be up and running in about 30 minutes.

## Prerequisites

- A Supabase account (free at supabase.com)
- A Vercel account (free at vercel.com)
- An OpenAI API key (for embeddings — costs pennies)

## Step 1 — Set up Supabase

1. Create a new project at supabase.com
2. Go to SQL Editor, click New Query
3. Paste the contents of `sql/schema.sql` and click Run
4. Copy your Project URL and service_role key from Settings > API

## Step 2 — Deploy to Vercel

1. Click the Deploy button in the README (or run `vercel deploy`)
2. Set these environment variables in Vercel project settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `BACKBONE_API_KEY` (make up a strong secret key)

## Step 3 — Seed Your Backbone

1. Open the file `docs/seeding-prompt.txt`
2. Replace `YOUR-BACKBONE-URL` with your Vercel deployment URL
3. Replace `YOUR_BACKBONE_API_KEY` with the key you chose in Step 2
4. Paste the prompt into ChatGPT or Claude
5. It will extract key knowledge from your conversation history and store it

## Step 4 — Install the MCP Server (Claude Desktop)

1. Open your Claude Desktop config file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add the MCP server block from `mcp-server/README.md`
3. Restart Claude Desktop
4. Claude now has `search_memory` and `store_memory` as native tools

## Step 5 — Bookmark the Capture Widget

Navigate to `/capture` on your deployed URL and bookmark it.
Use it to manually store anything from any AI session.

## Step 6 — Wire Your Automations (Optional)

If you run automated workflows (morning briefs, research agents, etc.),
add a POST to `/api/ingest` at the end of each run. See the README for the payload format.
