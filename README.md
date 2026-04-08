# Curriculum Vitae Management System

This project is a modern web application serving as the frontend client for a Curriculum Vitae (CV) management system. It is built with a focus on efficient CV management, employee data organization, and skill tracking.

## Project Structure

The project follows a standard Nuxt.js directory structure, enhanced with dedicated folders for GraphQL, i18n, and testing.

```
├── app/                           # Main application source code
│   ├── app.vue                    # Main Vue entry file
│   ├── assets/                    # Static assets
│   ├── components/                # Reusable Vue components
│   │   ├── ConfirmModal.vue       
│   │   ├── auth/                  # Authentication-related components
│   │   ├── cvs/                   # CV-related components
│   │   ├── departments/           # Department management components
│   │   ├── languages/             # Language management components
│   │   ├── layout/                # Layout-specific components
│   │   ├── positions/             # Position management components
│   │   ├── projects/              # Project management components (global)
│   │   ├── skills/                # Skill management components
│   │   └── users/                 # User management components
│   ├── composables/               # Reusable Vue Composition API functions
│   ├── layouts/                   # Application layouts
│   ├── middleware/                # Nuxt route middleware
│   ├── pages/                     # Nuxt file-based routing views
│   │   ├── settings.vue           # Settings page
│   │   ├── auth/                  # Authentication pages
│   │   ├── cvs/                   # CV listing and management pages
│   │   │   ├── index.vue          # CV list page
│   │   │   └── [cvId]/            # Dynamic route for a specific CV
│   │   ├── departments/           # Department management pages
│   │   ├── languages/             # Language management pages
│   │   ├── positions/             # Position management pages
│   │   ├── projects/              # Project management pages (global)
│   │   ├── skills/                # Skill management pages
│   │   └── users/                 # User management pages
│   │       ├── index.vue          # User list page
│   │       └── [userId]/          # Dynamic route for a specific user
│   ├── stores/                    # Pinia state management stores
│   │   ├── auth.ts                # Authentication store
│   │   ├── cvs.ts                 # CVs store
│   │   ├── dictionaries.ts        # Store for static dictionary data (skills, positions, etc.)
│   │   ├── employees.ts           # Employees store
│   │   └── projects.ts            # Projects store
│   └── types/                     # TypeScript type definitions
│       ├── cvs/                   # CV related types
│       ├── departments/           # Department related types
│       ├── languages/             # Language related types
│       ├── positions/             # Position related types
│       ├── projects/              # Project related types
│       ├── skills/                # Skill related types
│       └── users/                 # User related types
├── codegen.ts                     # GraphQL Code Generator configuration
├── docker-compose.yml             # Docker Compose configuration for local development environment (backend services)
├── Dockerfile                     # Dockerfile for building the frontend application image
├── eslint.config.mjs              # ESLint configuration
├── graphql/                       # GraphQL related files
│   ├── auth.gql                   # Authentication GraphQL operations
│   ├── cvs.gql                    # CVs GraphQL operations
│   ├── departments.gql            # Departments GraphQL operations
│   ├── languages.gql              # Languages GraphQL operations
│   ├── me.gql                     # Current user (me) GraphQL operations
│   ├── positions.gql              # Positions GraphQL operations
│   ├── profile.gql                # User profile GraphQL operations
│   ├── projects.gql               # Projects GraphQL operations
│   ├── schema.graphql             # GraphQL schema definition
│   ├── skills.gql                 # Skills GraphQL operations
│   ├── users.gql                  # Users GraphQL operations
│   └── generated/                 # Automatically generated GraphQL types and hooks
├── i18n/                          # Internationalization files
│   └── locales/                   # Translation files for different languages
├── nuxt.config.ts                 # Nuxt.js configuration file
├── package.json                   # Project dependencies and scripts
├── package-lock.json              # Specific versioning for npm dependencies
├── playwright.config.ts           # Playwright end-to-end testing configuration
├── README.md                      # Project README file
├── tailwind.config.ts             # Tailwind CSS configuration
├── tests/                         # Unit tests
│   ├── setup.ts                   # Vitest setup file
│   ├── components/                # Unit tests for Vue components
│   ├── composables/               # Unit tests for Vue composables
│   ├── layouts/                   # Unit tests for layouts
│   ├── middleware/                # Unit tests for middleware
│   ├── pages/                     # Unit tests for pages (minimal)
│   └── stores/                    # Unit tests for Pinia stores
├── tsconfig.json                  # TypeScript configuration
└── vitest.config.ts               # Vitest unit testing configuration
```

## Features

The application provides a comprehensive set of features, structured across various pages:

### Authentication Module
-   **Login:** Allows existing users to authenticate and access the system.
-   **Register:** Enables new users to create an account within the system.

### CV Management
-   **CV List (`/cvs`):** Displays a list of all available CVs.
-   **CV Details (`/cvs/[cvId]/details`):** Provides a detailed view of a specific CV, including personal information, experience, and education.
-   **CV Preview (`/cvs/[cvId]/preview`):** Offers a preview of the CV, suitable for printing or sharing.
-   **CV Projects (`/cvs/[cvId]/projects`):** Manages projects associated with a specific CV.
-   **CV Skills (`/cvs/[cvId]/skills`):** Manages skills associated with a specific CV.

### Employee & User Management
-   **User List (`/users`):** Displays a list of all registered users/employees.
-   **User Profile (`/users/[userId]/profile`):** Shows detailed profile information for a specific user.
-   **User CVs (`/users/[userId]/cvs`):** Lists CVs linked to a particular user.
-   **User Languages (`/users/[userId]/languages`):** Manages language proficiencies for a specific user.
-   **User Skills (`/users/[userId]/skills`):** Manages skill sets for a specific user.

### Settings & Dictionaries
-   **Settings (`/settings`):** General application settings.
-   **Departments (`/departments`):** Manages departmental information.
-   **Languages (`/languages`):** Manages available languages within the system.
-   **Positions (`/positions`):** Manages job positions.
-   **Projects (`/projects`):** Manages project information across the organization.
-   **Skills (`/skills`):** Manages the skill catalog.

## Technologies

This project leverages a modern stack to deliver a robust and scalable application:

*   **Framework:** [Nuxt.js 4](https://nuxt.com/)
*   **State Management:** [Pinia](https://pinia.vuejs.org/)
*   **API Communication:** GraphQL via [Apollo Client](https://apollo.vuejs.org/) and [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) for strong typing.
*   **UI Framework/Styling:** [Vuetify](https://vuetifyjs.com/) combined with [Tailwind CSS](https://tailwindcss.com/).
*   **Internationalization:** `@nuxtjs/i18n` with support for English and Russian.
*   **Code Quality:** ESLint, Prettier, and TypeScript.
*   **Testing:** [Vitest](https://vitest.dev/) for unit tests.

## Dependencies

The project relies on the following key dependencies:

### Production Dependencies
*   `@pinia/nuxt`: Pinia integration for Nuxt.
*   `nuxt`: The intuitive Vue Framework.
*   `vue`: The progressive JavaScript framework.
*   `vue-router`: The official router for Vue.js.

### Development Dependencies
*   `@graphql-codegen/cli`: GraphQL code generation command-line tool.
*   `@graphql-codegen/client-preset`: Client-side GraphQL code generation preset.
*   `@graphql-typed-document-node/core`: Type definitions for GraphQL documents.
*   `@nuxt/eslint`: ESLint integration for Nuxt.
*   `@nuxt/test-utils`: Utilities for testing Nuxt applications.
*   `@nuxtjs/apollo`: Apollo client integration for Nuxt.
*   `@nuxtjs/i18n`: Internationalization module for Nuxt.
*   `@nuxtjs/tailwindcss`: Tailwind CSS integration for Nuxt.
*   `@playwright/test`: Playwright test runner.
*   `@types/node`: TypeScript type definitions for Node.js.
*   `@vitest/coverage-v8`: Vitest coverage reporter.
*   `@vue/test-utils`: Official Vue Test Utils.
*   `autoprefixer`: PostCSS plugin to parse CSS and add vendor prefixes.
*   `eslint`: Pluggable JavaScript linter.
*   `eslint-config-prettier`: ESLint config for Prettier.
*   `eslint-plugin-prettier`: Runs Prettier as an ESLint rule.
*   `graphql`: A query language for your API.
*   `happy-dom`: A server-side DOM implementation for Node.js.
*   `jsdom`: A JavaScript implementation of the WHATWG DOM and HTML standards.
*   `pinia`: The intuitive store for Vue.
*   `postcss`: A tool for transforming CSS with JavaScript.
*   `prettier`: An opinionated code formatter.
*   `tailwindcss`: A utility-first CSS framework.
*   `typescript`: JavaScript with syntax for types.
*   `vitest`: A blazing fast unit test framework powered by Vite.
*   `vue-tsc`: Vue's native TypeScript support.
*   `vuetify-nuxt-module`: Vuetify integration for Nuxt.

## Getting Started

Follow these instructions to set up and run the project locally.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/cv-innowise/cv-front.git
    cd cv-front
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Generate GraphQL types (if needed):**
    ```bash
    npm run codegen
    ```

### Environment Variables

Both the frontend and the Dockerized backend services require specific environment variables to function correctly.

#### Frontend Environment Variables

For the frontend, the GraphQL API endpoint is configured via `VITE_GRAPHQL_URL`. While a default is provided (`http://localhost:3001/api/graphql`), you might need to override it for specific deployments or if your backend runs on a different address.

You can set this environment variable directly in your shell before running the development server, or create a `.env` file in the project root:

```bash
# .env (for frontend)
VITE_GRAPHQL_URL="http://localhost:3001/api/graphql"
# VITE_GRAPHQL_BROWSER_URL="/api/graphql" # Only if you need a different URL for client-side requests
```

#### Backend Environment Variables (Docker Compose)

The `docker-compose.yml` configuration expects two environment files for the backend services: `.env.cv_node` and `.env.cv_postgres`. These files should be created in the same directory as your `docker-compose.yml` file.

**`.env.cv_node` (for the backend application)**
This file configures the `cv_node` service. An example content might look like this (adjust values as necessary for your setup):

```
# .env.cv_node
PORT=3001
DATABASE_URL=postgres://user:pass@cv_postgres:5432/db
DATABASE_SSL=
JWT_SECRET=
JWT_SECRET_2=
CLOUDINARY_URL=
MAIL_FROM=
SMTP_URL=
CHROME_WS=
SENTRY_DSN_URL=

```
*   `PORT`: The port the Node.js backend listens on within its container.
*   `NODE_ENV`: Application environment (e.g., `development`, `production`).
*   `DATABASE_URL`: Connection string for the PostgreSQL database. Note that `cv_postgres` is the service name defined in `docker-compose.yml`.
*   `JWT_SECRET`: Secret key for JSON Web Token (JWT) generation. **Change this to a strong, unique value.**

**`.env.cv_postgres` (for the PostgreSQL database)**
This file configures the PostgreSQL service. An example content might look like this:

```
# .env.cv_postgres
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=database_name
```
*   `POSTGRES_USER`: Username for the PostgreSQL database.
*   `POSTGRES_PASSWORD`: Password for the PostgreSQL user.
*   `POSTGRES_DB`: Name of the database to be created.

**Action Required:** Before running `docker-compose up`, ensure you have created these two `.env` files with appropriate values.

### Running the Development Server

To start the development server with hot-reloading:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will typically be available at `http://localhost:3000`.

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This will generate a `.output` directory with the production-ready build.

### Previewing Production Build

To locally preview the production build:

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

### Running the Backend (with Docker Compose)

This frontend application requires a backend service to function correctly. You can run the backend using Docker Compose, which will set up a PostgreSQL database and the `cv_node` backend service.

1.  **Ensure Docker is running:** Make sure Docker Desktop or Docker Engine is running on your system.
2.  **Navigate to the project root:**
    ```bash
    cd /path/to/your/cv-front
    ```
3.  **Start the backend services:**
    ```bash
    docker-compose up -d
    ```
    This command will start the `cv_postgres` and `cv_node` services in detached mode.
4.  **Verify services are running:** You can check the status of your services:
    ```bash
    docker-compose ps
    ```
5.  **Stop the backend services:** When you are done, you can stop the services:
    ```bash
    docker-compose down
    ```
    The backend service (`cv_node`) will be accessible at `http://localhost:3001` (as configured in `docker-compose.yml` and `nuxt.config.ts` for GraphQL communication).

## Running Tests

The project includes both unit tests and end-to-end tests to ensure quality.

### Unit Tests

Unit tests are written using [Vitest](https://vitest.dev/).

To run all unit tests:

```bash
npm run test
# or
yarn test
# or
pnpm test
```
