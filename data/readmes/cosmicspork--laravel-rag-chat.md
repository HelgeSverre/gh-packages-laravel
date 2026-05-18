# Laravel RAG Chat

A Laravel 12 chat widget with retrieval-augmented generation (RAG) and SAML SSO. Users authenticate via their identity provider, ask natural-language questions, and the backend performs a vector search against a knowledge base, injects the top results into the prompt, and proxies the conversation to an LLM completion endpoint. Message history and thumbs-up/down feedback persist to PostgreSQL.

## Background

This was built for the College of Information Science & Technology School of Interdisciplinary Informatics graduate capstone at the University of Nebraska Omaha (Spring 2025). The original deployment was scoped to a single K-12 district stakeholder; this repository is a sanitized, genericized version published to show end-to-end work in the Laravel stack.

The team was four people: a project manager, an Azure/Bicep deployment lead, the stakeholder, and me as the engineer. I architected and wrote the application code with AI-assisted development (see [AI_DISCLOSURE.md](AI_DISCLOSURE.md)); prompt design and the RAG pipeline were a collaborative effort across the team. The project was handed off to the stakeholder for production deployment at the end of the term.

## Status

Functional at handoff (SSO, RAG, message history, feedback, regeneration, Azure deployment via Bicep). This repo is not actively maintained — it's preserved as a portfolio artifact.

## License

MIT.

## Stack

- **Backend:** Laravel 12, PHP 8.2, PostgreSQL, Redis
- **Auth:** SAML 2.0 via `onelogin/php-saml`
- **Frontend:** Vanilla JS, Tailwind, Vite
- **LLM:** Any OpenAI-compatible chat-completion endpoint (originally Azure OpenAI `gpt-4o-mini`)
- **Retrieval:** Any search endpoint returning a `value` array of documents (originally Azure AI Search)
- **Deployment:** Azure App Service + PostgreSQL Flexible Server via Bicep; containerized with Nginx + PHP-FPM + supervisord

## Development

This repository includes a **Devcontainer** configuration to simplify the setup of a development environment using **VS Code Remote - Containers**.

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Docker](https://www.docker.com/get-started)**
- **[Visual Studio Code](https://code.visualstudio.com/)**
- **[Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** (for VS Code)

### Getting Started

#### 1. Clone the Repository

```sh
git clone https://github.com/cosmicspork/laravel-rag-chat.git
cd laravel-rag-chat
```

#### 2. Open in VS Code

Open the project folder in VS Code and open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P on Mac).

Search for and select:

```
Dev Containers: Reopen in Container
```

VS Code will now build and start the development environment inside a container.

#### 3. Devcontainer Features

The included .devcontainer configuration provides a docker-compose and dockerfile setup for:
* PHP (with necessary extensions)
* Composer
* Node.js & NPM
* PostgreSQL database
* Redis
* Laravel Debug Tools (Xdebug, Pail)

#### 4. Install Laravel Dependencies

These should all be done for you by the devcontainer extension but if not, run:

```sh
composer install
npm install
php artisan key:generate
php artisan migrate
```

#### 5. Setup Environment Variables

Copy the example environment file:

```sh
cp .env.example .env
```

Ensure the .env file is configured to match the Devcontainer settings (API, database, cache, etc.).

#### 6. Start the Development Server

```sh
composer run dev
```

#### 7. Access the Application

Your Laravel application should be accessible at:

```
http://localhost:8000
```

### Troubleshooting

If artisan commands fail, ensure .env, database, and cache settings are properly configured.

If node packages are missing, try running:

```sh
rm -rf node_modules package-lock.json && npm install
```

If the container does not start, try rebuilding it:

```
Dev Containers: Rebuild Container
```

### Additional Commands

If you need to generate a new application key, run:

```sh
php artisan key:generate
```

If you need to generate a certificate for SAML authentication, run:

```sh
openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout storage/saml/key.pem -out storage/saml/cert.pem
```

## Deployment

The original deployment ran on Azure App Service with the image published to GitHub Container Registry, triggered by a GitHub Actions workflow on pushes to `main`. The workflow file is not included in this repository.

The high-level deployment steps were:
1. Build the project's Docker image and push it to a container registry
2. Deploy the infrastructure-as-code in [azure/main.bicep](azure/main.bicep) to create the Azure PostgreSQL Database and Azure App Service
3. Deploy the published Docker image to the created Azure App Service

### Integrate GitHub Repository with Azure App Service

Configure deployment credentials in the App Service's Deployment Center so GitHub Actions can push container images and trigger deployments. See [azure/deployment-center-example.png](azure/deployment-center-example.png) for an example configuration.
