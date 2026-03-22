# NotebookLM Prompts for AI Backbone Content

---

## Prompt 1: Audio Overview (Podcast-Style Deep Dive)

Paste this into NotebookLM's Audio Overview instructions:

```
Create an engaging audio overview that explains The AI Backbone to someone who uses multiple AI tools daily but has never heard of this product.

Start with the problem: every AI tool forgets everything between sessions. Make this relatable. Use the "four employees with amnesia" analogy.

Then walk through the solution: one shared database that every AI reads from and writes to. Explain semantic search in plain English, using the "flat bread" vs "underfermentation" example to show how it finds meaning, not just matching words.

Spend time on the "real day" scenario from Part 2 of the source document. Walk through the morning brief at 7 AM, Claude picking it up at 7:30, ChatGPT using brand voice rules it never learned, and the brainstorming session at 9 PM. This is where people will say "oh, I need this."

Cover the setup: 30 minutes, free tiers, no DevOps degree. Emphasize that this was built and deployed in a single afternoon.

End with who this is for and the $97 price point. Don't be salesy. Be matter-of-fact: here's what it costs, here's what you get, here's why it's worth it.

Tone: two smart people talking at a coffee shop. Curious, practical, occasionally impressed by the elegance of the solution. Not hype. Not corporate. Think "wait, you can actually do this?" energy.

Do NOT use phrases like "game changer," "revolutionary," "unlock," or "supercharge." Keep it grounded.
```

---

## Prompt 2: Slide Deck Generation

Paste this into NotebookLM for slide generation:

```
Create a slide deck that presents The AI Backbone as a product overview. This will be used in a video walkthrough and potentially as a standalone sales asset.

Slide structure:

Slide 1 — Title
"The AI Backbone: Connect the Memory of Every AI You Use"
Subtitle: A shared memory layer for ChatGPT, Claude, Perplexity, and beyond.
By Henry Hunter Jr.

Slide 2 — The Problem
Your AI tools don't talk to each other.
Every session starts from zero.
You're re-explaining yourself constantly.
Visual: isolated circles labeled ChatGPT, Claude, Perplexity with no connections between them.

Slide 3 — The Cost of the Problem
10+ minutes per day re-teaching context
Inconsistent advice across tools
Lost insights from past conversations
No institutional memory

Slide 4 — The Solution
One database. Every AI reads from it and writes to it.
Visual: the same circles now connected through a central node labeled "AI Backbone"

Slide 5 — How Semantic Search Works
Not keyword matching. Meaning matching.
Search "flat bread" and find "underfermentation causes dense crumb"
Powered by vector embeddings (1,536 numbers that represent meaning)

Slide 6 — A Real Day With the Backbone
7:00 AM: Perplexity runs morning brief, stores it
7:30 AM: Claude recalls the brief instantly
10:00 AM: ChatGPT uses brand voice rules it never learned
9:00 PM: Claude stores brainstorming insights for tomorrow

Slide 7 — What's Inside
Complete codebase (ready to deploy)
SQL schema (paste and run)
Seeding prompt (extract existing AI knowledge)
MCP server for Claude Desktop
Capture widget for manual entry
Step-by-step setup guide
Video walkthroughs

Slide 8 — Setup in 30 Minutes
Step 1: Create Supabase project, paste schema
Step 2: Deploy to Vercel (one click)
Step 3: Seed with the included prompt
Step 4: Connect Claude Desktop via MCP
Step 5: Bookmark the capture widget

Slide 9 — The Tech Stack
Database: Supabase (PostgreSQL + pgvector) — free
API: Vercel Serverless Functions — free
Embeddings: OpenAI text-embedding-3-small — pennies
Monthly cost: effectively $0

Slide 10 — Who Built This
Henry Hunter Jr.
400+ member paid Skool community
50,000+ member Facebook group
5 published books
Uses this system every single day to run his business
This is the exact code running behind his operation right now.

Slide 11 — Pricing
$97 one-time
No subscription. You own it.
Instant delivery after payment.

Slide 12 — Get Started
ai-backbone-site.vercel.app
Deploy in an afternoon. Use it for years.

Keep slides clean. Dark background, light text, lime green (#c8f55a) accent color. Minimal text per slide. Let the visuals and the narration do the work.
```

---

## Prompt 3: Video Walkthrough Script (What to Focus On)

Use this prompt to guide the narration for a recorded video walkthrough:

```
Write a video walkthrough script for The AI Backbone. This video should be 8-12 minutes long and serve as the primary product walkthrough that buyers see on the delivery page.

Structure:

INTRO (1 minute)
Open with the problem. Don't start with "hi, I'm Henry." Start with: "If you use more than one AI tool, you already know the problem. They don't remember anything." Then introduce yourself briefly: who you are, what you run, why you built this.

THE PROBLEM IN DETAIL (2 minutes)
Walk through a specific scenario. "Monday morning, I open Claude and explain my brand voice. Tuesday, I open ChatGPT and explain it again. Wednesday, Perplexity does amazing research and none of my other tools know about it." Make it personal. Use your actual experience. Then deliver the line: "It's like having four employees who never talk to each other."

THE SOLUTION (2 minutes)
Explain the backbone concept simply. One database, every tool reads and writes. Show the flow diagram: ChatGPT, Claude, Perplexity all pointing to a central backbone node. Explain semantic search briefly: "It doesn't just match words. It matches meaning. Search for 'flat bread' and it finds a memory about underfermentation, because those concepts are related."

LIVE DEMO (3 minutes)
This is the most important section. Show the backbone actually working:
1. Open Claude Desktop and ask it something. Show the search_memory tool being called and returning results.
2. Open the capture widget in a browser. Store a new memory.
3. Go back to Claude and search for what you just stored. Show it appearing in results.
4. If possible, show how ChatGPT can also access the same memories via the API.
The demo proves this is real, not theoretical.

THE SETUP (2 minutes)
Walk through the 6 steps from QUICKSTART.md. Show Supabase, show Vercel, show the schema being pasted, show the env vars being set. Emphasize: "This took me 30 minutes. The tools are free. The code is ready to go."

CLOSE (1 minute)
Recap the value: "Every AI you use gets smarter because they all share the same memory. Set it up once, use it forever." Don't be pushy. Just be direct: "It's $97, one time, and you own everything."

Tone guidance:
- Talk like you're showing a friend something cool you built
- Don't read from a script (use these notes as an outline, not a teleprompter)
- Pause on the demo. Let people see the results. Don't rush the proof.
- Be warm but not gushing. Confident but not salesy.
- If something doesn't work perfectly in the demo, acknowledge it. That's more trustworthy than a polished performance.
```

---

## Usage

1. Upload `notebooklm-source-document.md` to NotebookLM as the source
2. Use Prompt 1 for the Audio Overview generation
3. Use Prompt 2 for the Slide Deck generation
4. Use Prompt 3 as your personal outline when recording the screen-share walkthrough video
