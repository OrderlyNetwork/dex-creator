# Orderly One

A platform that lets you create your own perpetual decentralized exchange (DEX) easily using Orderly Networks infrastructure.

## Project Overview

Orderly One is a tool that simplifies the process of launching your own perpetual DEX. The platform handles the complexity of DEX creation and deployment by leveraging Orderly Networks' infrastructure.

## Project Structure

This is a monorepo managed with Yarn Workspaces:

- `app/`: Frontend application built with Remix
- `api/`: Backend API server built with Node.js that stores user DEX information

## How It Works

1. Users configure their DEX parameters through our intuitive UI
2. The API server stores the configuration and user information
3. The system forks a base repository and customizes it based on user preferences
4. GitHub Actions are automatically enabled on the forked repository
5. A deployment token is securely added as a repository secret
6. CI/CD automatically deploys the DEX to GitHub Pages without any user intervention

## Features

### User Features

- Create and customize a DEX with your own branding
- Configure social media links and appearance
- Create custom navigation menus with structured name and URL inputs
- Deploy your DEX through an automated process
- Upgrade your DEX through a graduation process to earn fee splits and enable rewards

### Admin Features

- Role-based access control for platform administrators
- Manage DEX instances across the platform
- Delete DEXs by wallet address
- Approve broker ID requests for graduated DEXs
- View admin-only information

For detailed documentation on the admin implementation, see [COMPOSER.md](./COMPOSER.md).

## Getting Started

### Prerequisites

- Node.js (v22 or later)
- Yarn (v1.22 or later)
- Docker and Docker Compose (for PostgreSQL database)
- GitHub account with Personal Access Token (for repository operations)

### Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:OrderlyNetworkDexCreator/dex-creator.git
cd dex-creator
yarn install
```

### Environment Setup

The application requires several environment variables to be set for both frontend and backend.

1. **Create environment files from templates**:

```bash
# For API
cp api/.env.example api/.env

# For frontend
cp app/.env.example app/.env
```

2. **Configure environment variables**:

Edit both `.env` files with your specific configuration. See the [Environment Variables](#environment-variables) section for details.

### Database Setup

The application uses PostgreSQL for data storage and MySQL for the Orderly database integration.

#### PostgreSQL Database (Primary)

You can run PostgreSQL using Docker:

```bash
# Start a PostgreSQL container
docker run --name dex-creator-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=dex_creator \
  -p 5432:5432 \
  -d postgres:16
```

Once PostgreSQL is running, initialize the database schema:

```bash
# Generate Prisma client
yarn api db:generate

# Create initial database migration and apply it
yarn db:migrate:dev --name initial_migration
```

We also need to initialize other external database schemas via:

```bash
yarn api nexus:generate
yarn api orderly:generate
yarn api sv:generate
```

#### Mastra PostgreSQL Database (For AI Memory/Storage)

Mastra requires a separate PostgreSQL database for storing agent memory, conversation history, and workflow state. This keeps AI-related data isolated from your main application database.

```bash
# Start a PostgreSQL container for Mastra
docker run --name dex-creator-agents \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=mastra \
  -p 54321:5432 \
  -d postgres:16
```

Add the Mastra database connection string to your `api/.env` file:

```bash
MASTRA_DATABASE_URL=postgresql://postgres:postgres@localhost:54321/mastra?schema=mastra
```

Mastra will automatically create the necessary tables in the `mastra` schema when first used.

#### Orderly MySQL Database (For Graduation Testing)

For testing the DEX graduation system with Orderly database integration:

```bash
# Start the Orderly MySQL database
yarn orderly:start

# Set the environment variable in your api/.env file:
# ORDERLY_DATABASE_URL=mysql://orderly_user:orderly_password@localhost:3307/orderly_test
```

**Orderly Database Management Commands:**

- `yarn orderly:start` - Start the MySQL database
- `yarn orderly:stop` - Stop the database
- `yarn orderly:restart` - Restart the database
- `yarn orderly:connect` - Connect to the database via MySQL client
- `yarn orderly:reset` - Reset the database (removes all data)

The Orderly database runs on port 3307 to avoid conflicts with PostgreSQL on port 5432.

### Development

To start both the frontend and backend development servers simultaneously with auto-reloading:

```bash
# Start both frontend and backend with a single command
yarn dev
```

This will launch:

- The frontend Remix app on http://localhost:3000 (with Vite hot module replacement)
- The backend API on http://localhost:3001 (with tsx watch for auto-reloading)

Both servers are configured to auto-reload when changes are detected in their respective source files.

If you prefer to run them separately:

```bash
# For the frontend app
yarn dev:app

# For the backend API
yarn dev:api
```

### Building

The project uses high-performance build tools:

- **Frontend**: Built with Vite for fast bundling
- **API**: Built with tsup for ultra-fast TypeScript compilation (30-50x faster than tsc)

To build both packages:

```bash
# Build everything
yarn build:app && yarn build:api

# Build just the API
cd api && yarn build
```

### Database Management

The project includes several commands for managing the database:

```bash
# Open Prisma Studio to view and edit the database
yarn db:studio

# Apply all pending migrations (for production environments)
yarn db:migrate:deploy

# Generate the Prisma client after schema changes
yarn db:generate

# Push schema changes directly to the database (for development only)
yarn db:push
```

## Environment Variables

The application requires several environment variables for proper operation. Below are the required variables for different components and features:

### API Server Environment (.env in api/ directory)

#### Core Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | API server port | 3001 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `MASTRA_DATABASE_URL` | PostgreSQL connection string for Mastra AI memory/storage | - | Yes |

#### GitHub Integration

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub token for repo forking (needs 'admin:org' and 'repo' scopes) | Yes |
| `GITHUB_TEMPLATE_REPO` | Template repository to fork | Yes |
| `TEMPLATE_PAT` | Token for GitHub Pages deployments (needs 'repo' and 'workflow' permissions) | Yes |

#### Theme Generation

| Variable | Description | Required |
|----------|-------------|----------|
| `CEREBRAS_API_KEY` | API key for Cerebras AI theme generation | Yes |
| `CEREBRAS_API_URL` | Cerebras API endpoint | Yes |

#### DEX Graduation System

| Variable | Description | Required |
|----------|-------------|----------|
| `ORDER_RECEIVER_ADDRESS` | Wallet address to receive graduation payments (used for all chains) | Yes |
| `GRADUATION_USDC_AMOUNT` | Fixed USDC amount required for graduation (e.g., "50") | Yes |
| `GRADUATION_ORDER_REQUIRED_PRICE` | Required USD amount for ORDER token graduation (e.g., "50") | Yes |
| `GRADUATION_ORDER_MINIMUM_PRICE` | Minimum USD amount for ORDER token graduation (e.g., "45") | Yes |
| `ORDERLY_DATABASE_URL` | MySQL connection string for Orderly database (e.g., "mysql://user:pass@localhost:3307/db") | Yes |

#### Solana Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SOLANA_MAINNET_RPC_URL` | Solana mainnet-beta RPC URL | https://api.mainnet-beta.solana.com | No |
| `SOLANA_DEVNET_RPC_URL` | Solana devnet RPC URL | https://api.devnet.solana.com | No |

### Frontend Environment (.env in app/ directory)

#### Core Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Frontend server port | 3000 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `VITE_DEPLOYMENT_ENV` | Deployment environment (mainnet/staging/qa/dev) | dev | Yes |

## DEX Graduation System

Orderly One includes a graduation system that allows DEX owners to graduate their exchange to earn fee revenue and enable trader rewards. The graduation process involves:

1. Users choosing between USDC or ORDER token payment
2. Sending the required amount based on their choice
3. Choosing a unique broker ID for their DEX
4. Configuring custom maker and taker fees

### Payment Options

The graduation system supports two payment methods:

- **USDC Payment**: Fixed amount set by `GRADUATION_USDC_AMOUNT` (e.g., $50 USDC)
- **ORDER Payment**: Dynamic amount calculated based on current ORDER token price to match `GRADUATION_ORDER_REQUIRED_PRICE` (e.g., ~454 ORDER tokens worth $50)

### Setting Up the Graduation System

For the graduation system to work properly, you need to:

1. Set a valid address for `ORDER_RECEIVER_ADDRESS` in the API environment
2. Configure graduation amounts:
   - `GRADUATION_USDC_AMOUNT`: Fixed USDC amount (e.g., "50")
   - `GRADUATION_ORDER_REQUIRED_PRICE`: Target USD amount for ORDER payments (e.g., "50")
   - `GRADUATION_ORDER_MINIMUM_PRICE`: Minimum USD amount for price validation (e.g., "45")
3. Configure `VITE_DEPLOYMENT_ENV` to match your deployment environment (mainnet/staging/qa/dev)

The token addresses are automatically configured based on the deployment environment:
- **Mainnet**: Uses mainnet ORDER and USDC token addresses for Ethereum and Arbitrum
- **Testnet environments**: Uses testnet ORDER and USDC token addresses for Sepolia and Arbitrum Sepolia

## Deployment

### Frontend Deployment

The frontend is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the main branch. The workflow:

1. Builds the Remix app in SPA mode
2. Deploys the build to the `orderlynetworkdexcreator.github.io` repository 
3. Sets up the custom domain `dex.orderly.network` via a CNAME file

To enable this deployment, you'll need:
- A GitHub Personal Access Token with repo permissions added as a repository secret named `GH_PAGES_DEPLOY_TOKEN`
- A CNAME DNS record pointing `dex.orderly.network` to `orderlynetworkdexcreator.github.io`

### API Deployment with Docker

The backend API can be deployed using Docker:

```bash
# Build the API Docker image
docker build -t dex-creator-api .

# Run the API container
docker run -d \
  --name dex-creator-api \
  -e DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dex_creator?schema=public \
  -e GITHUB_TOKEN=your-github-token \
  -e GITHUB_TEMPLATE_REPO=OrderlyNetworkDexCreator/dex-creator-template \
  -e TEMPLATE_PAT=your-template-personal-access-token \
  -e CEREBRAS_API_KEY=your-cerebras-api-key \
  -e CEREBRAS_API_URL=https://api.cerebras.ai/v1 \
  -e ORDER_RECEIVER_ADDRESS=0xyourReceiverAddress \
  -e DEPLOYMENT_ENV=qa \
  -e BROKER_CREATION_PRIVATE_KEY=-x<broker-creation-private-key> \
  -e BROKER_CREATION_PRIVATE_KEY_SOL=broker-creation-private-key-sol \
  -e GRADUATION_USDC_AMOUNT=1000 \
  -e GRADUATION_ORDER_REQUIRED_PRICE=750 \
  -e GRADUATION_ORDER_MINIMUM_PRICE=725 \
  -e MIGRATE_DB=true \
  dex-creator-api
```

#### Automatic Database Migrations

The API container includes automatic database migration capabilities:

- Set `MIGRATE_DB=true` to run Prisma migrations on container startup
- Set `MIGRATE_DB=false` (default) to skip migrations

This is useful for fresh deployments or when applying schema changes. For production environments, you may want to run migrations manually or separately to have more control over the process.

## License

MIT
