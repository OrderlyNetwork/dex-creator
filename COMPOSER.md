# DEX Creator - Composer Documentation

This document provides a comprehensive guide for AI composers working on this project, focusing on the current structure and technical decisions.

## For AI Composers

**IMPORTANT**: This document should be automatically maintained by AI composers. As the AI composer working on this project, you are responsible for:

1. Updating this document whenever you make changes to the codebase or architecture
2. Keeping the "Known Issues" section current when resolving or discovering issues
3. Maintaining the "Current Tasks and Roadmap" section in sync with project progress
4. Adding new API endpoints to the documentation as they are implemented
5. Updating file paths and code examples when the codebase structure changes
6. Expanding technical explanations based on new implementations

You should proactively update this document without waiting for explicit instructions to do so. The goal is to keep this documentation continuously accurate as the project evolves.

**TERMINAL USAGE**: Do not start any terminal processes or run commands. The project maintainer will handle running the necessary commands and starting development servers.

**DOCUMENTATION GUIDELINES**:

- When a task is completed, remove it entirely from the tasks list
- When a bug or issue is fixed, remove it entirely from the tasks list or known issues
- When adding new components or features, ensure they're properly documented with file paths and descriptions
- Keep the roadmap updated based on current priorities
- Use consistent formatting throughout the document

## Project Overview

DEX Creator is a platform that lets users create their own perpetual decentralized exchanges (DEXs) using Orderly Networks infrastructure. The platform simplifies DEX creation and deployment through an intuitive UI and automated processes.

## System Architecture

This is a monorepo managed with Yarn Workspaces:

```
dex-creator/
├── app/            # Remix-based frontend (SPA)
│   ├── app/        # Application source code
│   │   ├── components/ # React components
│   │   ├── context/    # React contexts
│   │   ├── utils/      # Utility functions
│   │   └── styles/ # Source styles (including global.css)
│   └── public/     # Public assets
├── api/            # Node.js API server (Hono)
│   ├── src/        # API source code
│   │   ├── models/ # Data models
│   │   └── routes/ # API routes
│   └── prisma/     # Prisma ORM configuration
│       └── schema.prisma  # Database schema
├── .github/        # GitHub configuration
│   └── workflows/  # GitHub Actions workflows
├── tsconfig.base.json  # Shared TypeScript configuration
└── package.json    # Root package with workspaces
```

### Technology Stack

- **Frontend**: Remix (SPA mode), React 19, TypeScript, Wagmi, TanStack React Query
- **Styling**: UnoCSS, a utility-first CSS framework with atomic CSS capabilities
- **Icons**: Iconify with @iconify/react for SVG icons
- **Notifications**: React-Toastify for toast messages
- **Backend**: Node.js v22+, Hono, TypeScript, Ethers.js
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: GitHub Pages (automated through CI)
- **Package Management**: Yarn Workspaces
- **CI/CD**: GitHub Actions
- **Authentication**: EVM Wallet (Ethereum) signature-based authentication

## Key Components

### Frontend Application (`app/`)

The frontend is a Remix-based Single Page Application (SPA) for DEX creation and management.

Key files:

- `app/vite.config.ts`: Configuration for Vite with Node.js polyfills
- `app/remix.config.js`: Remix configuration with SPA mode enabled
- `app/app/entry.client.tsx`: Client entry point
- `app/app/root.tsx`: Root component with Wagmi and Auth providers
- `app/app/routes/_index.tsx`: Home page component
- `app/app/styles/global.css`: Stylesheets directly imported in components
- `app/app/components/WalletConnect.tsx`: Component for wallet connection and authentication
- `app/app/components/LoginModal.tsx`: Modal explaining the wallet signing process
- `app/app/context/AuthContext.tsx`: Authentication context for wallet auth state management
- `app/app/utils/wagmiConfig.ts`: Configuration for Wagmi web3 provider
- `app/uno.config.ts`: UnoCSS configuration file defining themes, colors, and shortcuts

### Backend API (`api/`)

The backend is a Node.js API server built with Hono for storing user DEX configurations and handling authentication.

Key files:

- `api/src/index.ts`: Main server entry point
- `api/src/routes/dex.ts`: API routes for DEX operations
- `api/src/routes/auth.ts`: API routes for wallet authentication
- `api/src/models/dex.ts`: Data models and storage for DEXes
- `api/src/models/user.ts`: User model for authentication
- `api/src/lib/prisma.ts`: Prisma client configuration
- `api/prisma/schema.prisma`: Database schema definition

### Database Architecture

The application uses PostgreSQL as the database with Prisma ORM for database operations:

1. **Schema Definition**: Located at `api/prisma/schema.prisma`
2. **Models**:
   - `User`: Stores user information and authentication details
   - `Token`: Manages authentication tokens with expiration
3. **Database Connection**: Managed through the Prisma client in `api/src/lib/prisma.ts`
4. **Migrations**: Automatically generated in `api/prisma/migrations/` folder

The database is configured with proper indexes and relations to ensure efficient queries and data integrity:
- The `User` model has an index on the `address` field for quick lookups
- The `Token` model has indexes on both `token` and `userId` fields
- Cascading deletes ensure that when a user is deleted, their tokens are automatically removed

### Authentication Flow

The platform uses EVM wallet authentication with token validation:

1. User connects their wallet (e.g., MetaMask) using Wagmi
2. A login explainer modal appears automatically to guide users through signing
3. Backend generates a random nonce for the user's address
4. User signs a message containing the nonce
5. Backend verifies the signature using ethers.js
6. Upon verification, a token is issued with a 24-hour expiration and the user is authenticated
7. On page refresh or application restart, the token is validated with the server
8. Expired or invalid tokens trigger automatic logout with notification
9. Background validation occurs every 15 minutes to ensure token freshness
10. Toast notifications provide feedback throughout the process

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

- `.github/workflows/ci.yml`: Main CI workflow that runs on pushes to main and pull requests
  - Linting with ESLint
  - Format checking with Prettier
  - Type checking with TypeScript
  - Building both the frontend and API

## Coding Standards

1. **TypeScript Usage**:

   - Prefer type inference over manual type definitions
   - Only add explicit type annotations when necessary
   - Use interfaces for object shapes that will be implemented or extended
   - Use type aliases for unions, intersections, and simpler object types

2. **Naming Conventions**:

   - Use camelCase for variables, functions, and methods
   - Use PascalCase for classes, interfaces, types, and React components
   - Use UPPER_CASE for constants

3. **CSS Strategy**:

   - **IMPORTANT**: Always prefer UnoCSS utility classes over manual CSS
   - UnoCSS configuration in `app/uno.config.ts` defines shortcuts, themes, and colors
   - For complex components, use composition of UnoCSS utility classes instead of writing custom CSS
   - Only use global.css for base styles and overrides that cannot be achieved with UnoCSS
   - When using icons, prefer Iconify with the @iconify/react package

4. **UI Components**:

   - Use pill-shaped designs for interactive elements (rounded-full)
   - Maintain consistent padding and font sizes across similar components
   - Use subtle background colors with transparency (background-light/30)
   - Prefer subtle borders to define component boundaries
   - Follow the Orderly color palette defined in UnoCSS config

5. **Responsive Design**:

   - Use mobile-first approach with responsive utility classes (e.g., `md:px-4`)
   - Reduce paddings, margins, and font sizes on mobile screens
   - Hide non-essential UI elements on small screens using `hidden md:block`
   - Scale down icon sizes and interactive elements for better mobile ergonomics
   - Test all UI components on multiple device sizes during development

6. **Error Handling**:

   - Use toast notifications for error feedback instead of inline error messages
   - Log errors to console for debugging
   - Provide clear user feedback for all interactions

7. **Code Quality**:

   - All code must pass ESLint rules
   - All code must be properly formatted with Prettier
   - All TypeScript code must type check without errors
   - CI pipeline ensures these standards are maintained

8. **Authentication and Security**:

   - Always validate tokens on application load
   - Include token expiration checks
   - Handle expired tokens gracefully with user feedback
   - Do not store sensitive information in localStorage
   - Implement periodic token validation for long-lived sessions

9. **Database Operations**:
   - Use Prisma's type-safe operations for all database interactions
   - Keep transactions atomic when performing related operations
   - Include proper error handling for database operations
   - Use async/await for all database operations (Prisma methods return Promises)
   - Implement periodic cleanup for expired tokens

## UI Design Patterns

### Wallet Connection

The application uses a consistent wallet connection pattern:

1. **Connect Wallet Button**: Initial state showing a prominent gradient button
2. **Connected Wallet Pill**: After connection, shows a pill with:

   - Wallet address with a colored indicator dot
   - Login/Disconnect actions grouped in the same container
   - Consistent hover and active states

3. **Authentication States**:

   - Unauthenticated: Gray address text with login button
   - Authenticated: Colored address text showing successful authentication
   - Loading states for all operations

4. **Modals**:

   - Login explainer modal appears automatically after wallet connection
   - Modals use consistent styling with the main UI
   - Z-index management ensures proper modal layering
   - Options to proceed or defer authentication

5. **Mobile Adaptations**:
   - Login button hidden on mobile screens
   - Reduced padding and margins for space efficiency
   - Smaller text and icon sizes
   - Compact wallet pill to fit smaller screens

Example implementation in `WalletConnect.tsx` shows the pattern with all states.

### Responsive Design

The application follows a mobile-first approach with these key principles:

1. **Base Mobile Styles**:

   - Smaller text sizes: `text-xs` for mobile, `md:text-sm` for larger screens
   - Compact padding: `p-1 md:p-1.5`, `px-2 py-1 md:px-4 md:py-2`
   - Reduced margins: `gap-1 md:gap-2`, `mr-2 md:mr-3`
   - Smaller interactive elements: `w-1.5 h-1.5 md:w-2 md:h-2`

2. **Progressive Enhancement**:

   - Features appear as screen size increases
   - More generous spacing on larger screens
   - Additional UI elements become visible (e.g., `hidden md:block`)

3. **Flexible Layouts**:

   - Elements naturally adapt to available space
   - Maintain readability at all screen sizes
   - Avoid fixed-width elements that might break on small screens

4. **Touch Consideration**:
   - Ensure tap targets are at least 44x44px on mobile
   - Provide enough spacing between interactive elements
   - Use simpler interactions on touch devices

### Notifications

The application uses React-Toastify for notifications:

1. **Toast Types**:

   - Error notifications (red left border)
   - Success notifications (green left border)
   - Info notifications (blue left border)

2. **Styling**:

   - Custom styling in global.css matching the application theme
   - Semi-transparent backgrounds with blur effect
   - Consistent animation and positioning
   - Auto-dismiss after 5 seconds

3. **Usage Pattern**:
   - Call `toast.error()`, `toast.success()`, etc. directly
   - Provide clear, concise messages
   - Log to console simultaneously for debugging

## Known Issues

Currently, there are no known issues in the project.

## Current Tasks and Roadmap

1. **Short-term tasks**:

   - Add documentation for API endpoints (OpenAPI/Swagger)
   - Implement testing for API endpoints
   - Improve error handling with more specific error messages

2. **Medium-term tasks**:

   - Create UI components for the DEX customization
   - Implement the forking and deployment workflow
   - Add JWT tokens for more secure authentication

3. **Long-term vision**:
   - Add dashboard for DEX operators to monitor performance
   - Implement templates for different types of DEXes
   - Add white-labeling options

## Configuration Details

### Node.js Requirements

The project requires Node.js v22 or later for improved ES module support, performance, and modern JavaScript features.

### Database Configuration

The project uses PostgreSQL with Prisma ORM:

1. **Setup with Docker**:

   ```bash
   # Start a PostgreSQL container
   docker run --name dex-creator-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_DB=dex_creator \
     -p 5432:5432 \
     -d postgres:16
   ```

2. **Connection String**:
   The database connection string is configured in the `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dex_creator?schema=public"
   ```

3. **Prisma Commands**:
   - `yarn db:migrate:dev`: Create and apply development migrations
   - `yarn db:migrate:deploy`: Apply migrations in production
   - `yarn db:generate`: Generate Prisma client after schema changes
   - `yarn db:studio`: Open Prisma Studio to browse and edit data
   - `yarn db:push`: Push schema changes directly to the database (dev only)

4. **Schema Location**:
   The Prisma schema is defined in `api/prisma/schema.prisma`

### TypeScript Configuration

The project uses a shared base TypeScript configuration (`tsconfig.base.json`) with:

- Target set to ES2023
- Module resolution set to "bundler"
- Strict type-checking enabled

### UnoCSS Configuration

The project uses UnoCSS for styling with a configuration file at `app/uno.config.ts`:

- Custom color palette aligned with the Orderly design system
- Presets including UnoCSS default and web fonts
- Custom shortcuts for common UI patterns (buttons, cards, etc.)
- Responsive design utilities

### Responsive Breakpoints

The application uses the following responsive breakpoints with UnoCSS:

- `sm`: 640px (small tablets and large phones)
- `md`: 768px (tablets and small laptops)
- `lg`: 1024px (laptops and desktops)
- `xl`: 1280px (large desktops)
- `2xl`: 1536px (extra large screens)

Default (no prefix) styles apply to mobile first, with larger screen adjustments using prefixes.

### Icons

The project uses Iconify for SVG icons:

- @iconify/react package provides React components for icons
- Icons can be loaded dynamically from various icon sets
- Heroicons is the primary icon set used for UI elements
- Usage pattern: `<Icon icon="heroicons:icon-name" width={14} className="md:w-4" />`

### Notifications

The application uses React-Toastify for toast notifications:

- Configured in the root component with global settings
- Custom theme matching the application's dark mode
- Custom CSS styling in global.css
- Z-index management to ensure proper layering

### CI Configuration

The project uses GitHub Actions for continuous integration:

- Runs on pushes to the main branch and on pull requests
- Uses Node.js v22
- Caches Yarn dependencies for faster builds
- Separates code quality checks from build steps

## Development Instructions

To run the project locally:

1. Install dependencies: `yarn install`
2. Set up PostgreSQL using Docker (see Database Configuration section)
3. Initialize the database:
   ```bash
   cd api
   yarn db:generate
   yarn db:migrate:dev --name initial_migration
   ```
4. Start both frontend and backend with auto-reloading: `yarn dev`
   - This uses concurrently to run both servers in parallel
   - The frontend runs on http://localhost:3000 with hot module replacement
   - The backend runs on http://localhost:3001 with auto-reloading

Alternative individual commands:

- Start only the frontend: `yarn dev:app`
- Start only the backend: `yarn dev:api`
- Build the frontend: `yarn build:app`
- Build the backend: `yarn build:api`

## API Documentation

### Implemented API Endpoints

| Method | Endpoint           | Description                       | Status      |
| ------ | ------------------ | --------------------------------- | ----------- |
| GET    | /api/dex           | List all DEXes                    | Planned     |
| GET    | /api/dex/:id       | Get a specific DEX                | Planned     |
| POST   | /api/dex           | Create a new DEX                  | Planned     |
| PUT    | /api/dex/:id       | Update a DEX                      | Planned     |
| DELETE | /api/dex/:id       | Delete a DEX                      | Planned     |
| POST   | /api/auth/nonce    | Get a nonce for authentication    | Implemented |
| POST   | /api/auth/verify   | Verify signature and authenticate | Implemented |
| POST   | /api/auth/validate | Validate authentication token     | Implemented |
| POST   | /api/auth/cleanup-tokens | Clean up expired tokens     | Implemented |

### Authentication API Endpoints

#### Request a Nonce (POST /api/auth/nonce)

Request:

```json
{
  "address": "0x1234567890123456789012345678901234567890"
}
```

Response (200):

```json
{
  "message": "Sign this message to authenticate with DEX Creator: 123456",
  "nonce": "123456"
}
```

#### Verify Signature (POST /api/auth/verify)

Request:

```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "signature": "0xabcdef123456789...signature-data"
}
```

Response (200):

```json
{
  "user": {
    "id": "user-uuid",
    "address": "0x1234567890123456789012345678901234567890"
  },
  "token": "auth-token"
}
```

#### Validate Token (POST /api/auth/validate)

Request:

```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "token": "auth-token"
}
```

Response (200):

```json
{
  "valid": true,
  "user": {
    "id": "user-uuid",
    "address": "0x1234567890123456789012345678901234567890"
  }
}
```

Error Response (401):

```json
{
  "valid": false,
  "error": "Token invalid or expired"
}
```

#### Clean Up Expired Tokens (POST /api/auth/cleanup-tokens)

Response (200):

```json
{
  "success": true,
  "message": "Cleaned up 5 expired tokens"
}
```

## Technical Decisions

### Technology Choices

- **Hono for API**: Lightweight, fast, TypeScript-friendly API framework with middleware support
- **Remix for Frontend**: Excellent DX, built-in SPA mode, React 19 compatibility
- **UnoCSS**: Atomic CSS framework for efficient, maintainable styling with excellent performance
- **Iconify**: Comprehensive icon solution with thousands of icons and no bundle size impact
- **React-Toastify**: Flexible, customizable toast notification system
- **Zod for Validation**: Type-safe schema validation with TypeScript integration
- **Prisma ORM**: Type-safe database access with excellent TypeScript integration and auto-generated client
- **PostgreSQL**: Robust, reliable relational database with excellent JSON support
- **Yarn Workspaces**: Efficient dependency management for monorepo structure
- **GitHub Actions**: Automated CI/CD pipeline for quality control and deployment
- **Wagmi**: Modern React hooks library for Ethereum
- **ethers.js**: Complete Ethereum library for signature verification
- **vite-plugin-node-polyfills**: Provides Node.js polyfills for web3 libraries in the browser
- **Concurrently**: Tool for running multiple commands simultaneously with organized output
- **TSX**: TypeScript execution and watch mode for Node.js applications

### Development Approach

- **CSS Strategy**: UnoCSS utility classes for styling, with direct composition in JSX
- **Mobile-First Approach**: Base styles for mobile with responsive modifiers for larger screens
- **TypeScript Strategy**: Emphasis on type inference over explicit annotations
- **Database Strategy**: Type-safe operations with Prisma, organized schema with proper indexing
- **Development Tools**: tsx for running TypeScript, ESLint and Prettier for code quality
- **Quality Assurance**: Automated checks through CI pipeline ensure consistent code quality
- **Authentication**: EVM wallet-based authentication with message signing for security
- **Error Handling**: Toast notifications for user feedback, console logging for debugging
- **Auto-Reloading**: Concurrent dev environment with automatic reloading for seamless development
  - Frontend uses Vite's hot module replacement for instantaneous updates without page refresh
  - Backend uses tsx watch mode to automatically restart the server on file changes
  - Concurrently package runs both servers with organized, color-coded output

---

## Contact Information

For questions or clarifications about this project:

- **Project Maintainer**: Mario Reder <mario@orderly.network>
- **Repository**: git@github.com:OrderlyNetwork/dex-creator.git

## Onboarding Checklist for New AI Composers

When you're first assigned to this project, follow these steps:

1. Review this entire document to understand the project structure and standards
2. Examine the key files mentioned in the [Key Components](#key-components) section
3. Run the project locally following the [Development Instructions](#development-instructions)
4. Review current [Known Issues](#known-issues) and [Current Tasks](#current-tasks-and-roadmap)
5. When making changes, ensure you update this documentation as specified in the [For AI Composers](#for-ai-composers) section

---

_This document will be continuously updated as the project evolves._
