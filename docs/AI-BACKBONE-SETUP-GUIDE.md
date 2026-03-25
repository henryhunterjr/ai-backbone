# AI Backbone Setup Guide
## Paste This Into Your AI to Get Started

Copy everything below the line and paste it into Claude, ChatGPT, or any AI assistant.
They will walk you through the entire setup, step by step, in plain language.

---

You are my setup assistant for the AI Backbone, a shared memory system that connects all my AI tools into one brain. Right now, every AI I use (ChatGPT, Claude, Perplexity) starts from zero every session. The AI Backbone fixes that by giving them all access to the same knowledge base.

Your job is to walk me through the full setup. I may not be technical, so explain everything in plain language. If I get stuck, help me troubleshoot. Never assume I know what a term means. If you use a technical term, define it in one sentence first.

Here is everything you need to know about the system and the steps to set it up.

---

## What the AI Backbone Does

It's a personal knowledge base that lives in the cloud. When I save something from one AI tool, every other AI tool can find it. It uses semantic search, which means it finds things by meaning, not just exact words. If I store "my sourdough starter has been sluggish in cold weather" and later ask "why is my starter slow?", it finds that memory.

**Cost:** Effectively free. All services used have free tiers. The only cost is OpenAI embeddings at about $0.02 per million tokens (you'd need thousands of memories before spending a dollar).

---

## What We Need Before We Start

Walk me through getting each of these. If I already have one, skip it.

1. **A Supabase account** (free at supabase.com)
   - Supabase is a cloud database. Think of it as a spreadsheet in the cloud that my AI tools can read and write to. It stores the memories.

2. **A Vercel account** (free at vercel.com)
   - Vercel hosts the API, the middleman that sits between my AI tools and the database. It's what turns my code into a live website/service.

3. **A GitHub account** (free at github.com)
   - GitHub stores the code. Vercel pulls from GitHub to deploy automatically.

4. **An OpenAI API key** (from platform.openai.com)
   - This powers the semantic search. It turns text into numbers (called "embeddings") so the system can find memories by meaning. Costs pennies.

---

## Step 1: Fork the Repository

A "repository" (repo) is just a folder of code stored on GitHub.

1. Go to: https://github.com/henryhunterjr/ai-backbone
2. Click the **Fork** button in the upper right
3. This creates your own copy of the code under your GitHub account
4. Keep the default name "ai-backbone" and click **Create fork**

**Check:** You should now see the repo at github.com/YOUR-USERNAME/ai-backbone

Ask me to confirm before moving on.

---

## Step 2: Set Up Supabase

Supabase is the database that stores all memories. We need to create a project and run the schema (the blueprint for how data is organized).

### Create a Supabase Project

1. Go to supabase.com and sign in
2. Click **New Project**
3. Choose your organization (or create one, any name is fine)
4. Project name: "ai-backbone" (or anything you like)
5. Set a strong database password. **Save this password somewhere.** You won't need it often, but you can't recover it.
6. Region: pick the one closest to you
7. Click **Create new project**
8. Wait 1-2 minutes for it to finish setting up

### Run the Database Schema

The "schema" is the blueprint. It tells the database what tables to create and how to organize data.

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste this entire block of SQL and click **Run**:

```sql
-- AI Backbone Database Schema
-- Safe to run multiple times (all statements use IF NOT EXISTS)

-- Enable pgvector for semantic search
create extension if not exists vector;

-- memories: the core knowledge store
create table if not exists memories (
  id               uuid default gen_random_uuid() primary key,
  content          text not null,
  embedding        vector(1536),
  category         text,
  source           text,
  importance       int default 3 check (importance between 1 and 5),
  tags             text[],
  related_ids      uuid[],
  created_at       timestamptz default now(),
  last_accessed_at timestamptz,
  access_count     int default 0
);

-- projects: track active initiatives
create table if not exists projects (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text,
  embedding   vector(1536),
  status      text default 'active',
  url         text,
  updated_at  timestamptz default now()
);

-- insights: high-signal extracted knowledge
create table if not exists insights (
  id             uuid default gen_random_uuid() primary key,
  insight        text not null,
  embedding      vector(1536),
  source_session text,
  tags           text[],
  created_at     timestamptz default now()
);

-- daily_briefs: archived daily summaries
create table if not exists daily_briefs (
  id               uuid default gen_random_uuid() primary key,
  brief_date       date not null unique,
  run_id           text,
  summary          text,
  embedding        vector(1536),
  action_items     jsonb,
  draft_replies    jsonb,
  community_pulse  jsonb,
  content_ideas    jsonb,
  morning_post     jsonb,
  created_at       timestamptz default now()
);

-- member_profiles: knowledge about people
create table if not exists member_profiles (
  id              uuid default gen_random_uuid() primary key,
  skool_name      text not null,
  embedding       vector(1536),
  notes           text,
  tags            text[],
  first_seen_at   timestamptz default now(),
  last_active_at  timestamptz,
  updated_at      timestamptz default now()
);

-- Semantic search function
create or replace function search_memories(
  query_embedding vector(1536),
  match_count     int default 5,
  filter_category text default null
)
returns table (id uuid, content text, category text, source text, similarity float)
language sql
as $$
  select
    id, content, category, source,
    1 - (embedding <=> query_embedding) as similarity
  from memories
  where
    (filter_category is null or category = filter_category)
    and embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Vector indexes for fast search
create index if not exists memories_embedding_idx
  on memories using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists insights_embedding_idx
  on insights using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists daily_briefs_embedding_idx
  on daily_briefs using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index if not exists member_profiles_embedding_idx
  on member_profiles using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Row-level security
alter table memories enable row level security;
alter table projects enable row level security;
alter table insights enable row level security;
alter table daily_briefs enable row level security;
alter table member_profiles enable row level security;

-- Allow read access for the anon role
create policy if not exists "anon_read_memories"
  on memories for select to anon using (true);

create policy if not exists "anon_read_projects"
  on projects for select to anon using (true);

create policy if not exists "anon_read_daily_briefs"
  on daily_briefs for select to anon using (true);
```

4. You should see "Success" with no errors

### Copy Your Supabase Credentials

1. Go to **Settings** (gear icon) > **API** in the left sidebar
2. Copy these two values and save them somewhere safe (a text file, notes app, anywhere private):
   - **Project URL** — looks like `https://abc123xyz.supabase.co`
   - **service_role key** — the long key under "service_role" (NOT the anon key). This is a secret. Don't share it publicly.

**Check:** You should have two values saved: a URL and a long key. Confirm before we continue.

---

## Step 3: Get Your OpenAI API Key

This key lets the system convert text into "embeddings" (numerical representations) so it can search by meaning.

1. Go to platform.openai.com
2. Sign in (or create an account)
3. Click your profile icon > **API keys** (or go to platform.openai.com/api-keys)
4. Click **Create new secret key**
5. Name it "AI Backbone" so you remember what it's for
6. Copy the key and save it with your Supabase credentials. It starts with `sk-`
7. You'll need a few cents of credit on your OpenAI account. If you've never used it, they usually give you some free credit.

**Check:** You should have a key starting with `sk-`. Confirm before we continue.

---

## Step 4: Choose Your API Key

The BACKBONE_API_KEY is a password you make up. Every AI tool that connects to your backbone uses this key to prove it's authorized.

**Make up a strong key now.** It can be anything, like a long random string. Example: `bb_k7Hx9mP2qR4vN8jL3wT6` (don't use this exact one, make your own).

Save this with your other credentials.

**Check:** You should now have 4 values saved:
1. Supabase Project URL
2. Supabase service_role key
3. OpenAI API key
4. BACKBONE_API_KEY (the one you just made up)

Confirm all four before we continue.

---

## Step 5: Deploy to Vercel

This is where your code goes live. Vercel takes the code from GitHub and turns it into a running service with a URL.

### Option A: One-Click Deploy (Easiest)

1. Go to this link:
   https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhenryhunterjr%2Fai-backbone&env=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,OPENAI_API_KEY,BACKBONE_API_KEY
2. Sign in with your GitHub account if prompted
3. It will ask you to fill in 4 environment variables. Paste your saved values:
   - `SUPABASE_URL` = your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service_role key
   - `OPENAI_API_KEY` = your OpenAI key
   - `BACKBONE_API_KEY` = the key you made up
4. Click **Deploy**
5. Wait 1-2 minutes for the build to complete

### Option B: Manual Deploy (If Option A doesn't work)

1. Go to vercel.com and sign in
2. Click **Add New** > **Project**
3. Import your forked `ai-backbone` repo from GitHub
4. Before clicking Deploy, expand **Environment Variables**
5. Add all 4 variables listed above
6. Click **Deploy**

### Get Your Deployment URL

After deployment finishes:
1. Look for the URL Vercel gives you. It looks like `ai-backbone-xxxx.vercel.app` or similar
2. Save this URL. This is your backbone's address.

**Check:** Open your URL in a browser. You should see a simple page (or a capture widget). If you get an error, tell me what it says.

---

## Step 6: Test It

Let's make sure everything works by storing and retrieving a test memory.

### Store a test memory

Ask me to send this request (or I'll explain how to do it in your browser's address bar):

```
POST https://YOUR-URL.vercel.app/api/ingest
Header: x-api-key: YOUR_BACKBONE_API_KEY
Body: {
  "content": "This is a test memory to verify the AI Backbone is working.",
  "category": "insight",
  "source": "setup-test",
  "tags": ["test"],
  "importance": 1
}
```

If you're using ChatGPT or another AI that can make HTTP requests, I can do this for you. Otherwise, we can use the capture widget at YOUR-URL.vercel.app/capture.

### Retrieve the test memory

```
GET https://YOUR-URL.vercel.app/api/retrieve?q=test+memory
Header: x-api-key: YOUR_BACKBONE_API_KEY
```

If this returns your test memory, the backbone is working.

**Check:** Did you get back the test memory? If yes, congratulations! If not, tell me the error and I'll help troubleshoot.

---

## Step 7: Connect Claude Desktop (Optional but Recommended)

If you use Claude Desktop (the app, not the website), you can give Claude native tools to search and store memories without any copy-pasting.

### Install Node.js (if you don't have it)

1. Go to nodejs.org
2. Download the LTS version (the one that says "Recommended")
3. Install it with the default settings
4. To verify: open a terminal/command prompt and type `node --version`. You should see a version number.

### Download the MCP Server

1. Download your forked ai-backbone repo to your computer (click the green "Code" button on GitHub > Download ZIP, then unzip it)
2. Note the full path to the `mcp-server` folder. For example:
   - Windows: `C:\Users\YourName\Downloads\ai-backbone\mcp-server\index.js`
   - Mac: `/Users/YourName/Downloads/ai-backbone/mcp-server/index.js`

### Configure Claude Desktop

1. Find your Claude Desktop config file:
   - **Windows**: Open File Explorer, paste this in the address bar: `%APPDATA%\Claude\`
   - **Mac**: Open Finder, press Cmd+Shift+G, paste: `~/Library/Application Support/Claude/`
2. Open `claude_desktop_config.json` in any text editor (Notepad works fine)
3. If the file is empty or doesn't exist, create it with this content:

```json
{
  "mcpServers": {
    "backbone": {
      "command": "node",
      "args": ["FULL_PATH_TO/ai-backbone/mcp-server/index.js"],
      "env": {
        "BACKBONE_API_URL": "https://YOUR-URL.vercel.app",
        "BACKBONE_API_KEY": "your-backbone-api-key"
      }
    }
  }
}
```

4. Replace the three placeholder values:
   - `FULL_PATH_TO` = the actual path on your computer
   - `YOUR-URL` = your Vercel deployment URL
   - `your-backbone-api-key` = the BACKBONE_API_KEY you made up

5. **Important for Windows users**: Use forward slashes (/) or double backslashes (\\\\) in the path. Single backslashes break JSON.
   - Wrong: `C:\Users\Me\ai-backbone\mcp-server\index.js`
   - Right: `C:/Users/Me/ai-backbone/mcp-server/index.js`

6. Save the file and restart Claude Desktop completely (quit and reopen)

7. In a new Claude chat, look for the tools icon (hammer or wrench) near the text input. Click it and you should see "backbone" with 3 tools: search_memory, store_memory, get_daily_brief.

**Check:** Can you see the backbone tools in Claude Desktop? If not, tell me what you see and I'll troubleshoot.

---

## Step 8: Connect ChatGPT (Optional)

You can't install plugins in ChatGPT, but you can tell it how to use your backbone through Custom Instructions or by pasting this at the start of a conversation:

```
I have a personal knowledge base called the AI Backbone.

To search my memories before answering questions about my business, projects, or preferences:
GET https://YOUR-URL.vercel.app/api/retrieve?q=search+terms
Header: x-api-key: YOUR_BACKBONE_API_KEY

To store new insights, decisions, or knowledge from our conversation:
POST https://YOUR-URL.vercel.app/api/ingest
Header: x-api-key: YOUR_BACKBONE_API_KEY
Body: {"content": "the memory", "category": "business|community|recipe|member|content|insight", "source": "chatgpt", "tags": ["relevant", "tags"], "importance": 3}

Before answering questions about my work, check the backbone first. At the end of productive sessions, store key decisions and insights.
```

Replace YOUR-URL and YOUR_BACKBONE_API_KEY with your actual values.

---

## Step 9: Seed Your Backbone (Optional)

If you've been using ChatGPT or Claude for a while, you have valuable knowledge trapped in old conversations. You can extract it.

Paste this into any AI tool that can make HTTP requests:

```
I need you to help me export my knowledge to an external memory system.

For each item you identify, make an HTTP POST request to:

URL: https://YOUR-URL.vercel.app/api/ingest
Header: x-api-key: YOUR_BACKBONE_API_KEY
Content-Type: application/json

Body format:
{
  "content": "the memory text",
  "category": "business|community|recipe|member|content|insight",
  "source": "chatgpt",
  "tags": ["relevant", "tags"],
  "importance": 3
}

Review our entire conversation history and extract:
1. Key decisions I have made about my business (importance: 4-5)
2. Recurring questions my audience or customers ask (importance: 3-4)
3. Things I have told you about my preferences, voice, and working style (importance: 4)
4. Specific people I have mentioned by name and what they are working on (importance: 3)
5. Content ideas or plans I have discussed (importance: 3)

Store each one as a separate memory. Go through the full conversation history thoroughly. Tell me how many memories you stored when done.
```

---

## Step 10: Bookmark the Capture Widget

For quick manual saves from any browser session:

1. Go to `https://YOUR-URL.vercel.app/capture`
2. Bookmark this page
3. Whenever you come across something worth remembering in any AI session, open the bookmark and type it in

---

## Troubleshooting

If something goes wrong at any step, describe the error to me and I'll help fix it. Common issues:

**"Failed to fetch" or network errors during testing:**
- Double-check your Vercel URL (no trailing slash)
- Make sure the deployment finished successfully in your Vercel dashboard

**Supabase SQL errors:**
- Make sure you copied the entire SQL block, including the first and last lines
- If it says "extension vector does not exist", your Supabase project might need a moment to finish initializing. Wait 30 seconds and try again.

**Claude Desktop doesn't show backbone tools:**
- Make sure you saved the config file and fully restarted Claude (not just closed the window, actually quit the app)
- Check for JSON syntax errors in the config file (missing commas, wrong brackets)
- Verify the path to index.js is correct and uses forward slashes

**OpenAI API errors:**
- Check that your key starts with `sk-`
- Make sure you have credits or a payment method on your OpenAI account

---

## You're Done

Once everything is working, you have a personal AI memory system that:
- Stores knowledge from any AI tool you use
- Lets any AI tool search your entire knowledge base
- Finds things by meaning, not just keywords
- Costs effectively nothing to run
- Is completely private (only you have the API key)

Welcome to the AI Backbone.
