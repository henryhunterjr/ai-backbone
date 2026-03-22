# AI Backbone — MCP Server for Claude Desktop

This MCP server gives Claude Desktop three native tools:
- **search_memory** — semantic search over your knowledge base
- **store_memory** — save a new memory
- **get_daily_brief** — retrieve a daily brief by date

## Setup

1. Find your Claude Desktop config file:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add this block inside the `"mcpServers"` object:

```json
{
  "mcpServers": {
    "backbone": {
      "command": "node",
      "args": ["/FULL/PATH/TO/ai-backbone/mcp-server/index.js"],
      "env": {
        "BACKBONE_API_URL": "https://YOUR-APP.vercel.app",
        "BACKBONE_API_KEY": "your-backbone-api-key"
      }
    }
  }
}
```

3. Replace:
   - `/FULL/PATH/TO/` with the actual path to the repo on your machine
   - `YOUR-APP` with your Vercel deployment URL
   - `your-backbone-api-key` with your BACKBONE_API_KEY

4. Restart Claude Desktop

5. You should see the tools icon in the chat input area. Click it to verify "backbone" appears with 3 tools.
