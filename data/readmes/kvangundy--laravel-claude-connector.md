# Laravel Cloud Connector

A Laravel package for interacting with the Laravel Cloud via Claude's "Connectors."

## Setup Instructions for Claude Desktop

### 1. Get your Laravel Cloud API Token
Go to cloud.laravel.com
Navigate to Organization Settings → API Tokens
Create a new token and copy it

### 2. Configure Claude Desktop
Edit your Claude Desktop config file:

macOS: ~/Library/Application Support/Claude/claude_desktop_config.json

Windows: %APPDATA%\Claude\claude_desktop_config.json

Add this configuration:

{
  "mcpServers": {
    "laravel-cloud": {
      "command": "node",
      "args": ["/PATH/TO/FILE/Laravel-MCP-Claude-Connector/mcp-server/index.js"],
      "env": {
        "LARAVEL_CLOUD_API_TOKEN": "your-api-token-here"
      }
    }
  }
}

### 3. Restart Claude Desktop

Quit and reopen Claude Desktop. You should now see "laravel-cloud" in your available tools.

## Available Tools

Once connected, you can ask Claude to:

`list_applications`	List all your Laravel Cloud apps

`get_application`	Get details of a specific app

`create_application`	Create a new app

`list_environments`	List environments for an app

`start_environment` / `stop_environment`	Start or stop an environment

`add_environment_variables`	Set env variables

`create_deployment`	Trigger a deployment

`run_command`	Run artisan commands

`get_command`	Check command status/output

`list_domains`	List custom domains

`list_database_clusters`	List databases

`list_caches`	List Redis caches


### Example Prompts

After setup, you can say things like:

"List all my Laravel Cloud applications"

"Deploy the production environment of my app"

"Run php artisan migrate on environment env-123"

"Show me the recent deployments for my staging environment"

"Add APP_DEBUG=false to my production environment"

"What's the status of my last command?"
