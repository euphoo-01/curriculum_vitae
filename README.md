# Curriculum Vitae Management System

Server-side rendered Nuxt.js application for managing employee CVs, profiles, skills, projects, and organizational dictionaries.

The project is a frontend client for a CV management platform. It focuses on authenticated employee workflows, structured CV editing, reusable management tables, and a typed GraphQL integration with a Dockerized backend for local development.

## Core Technologies

- **Nuxt.js 4 with SSR:** Server-side rendering is enabled through Nuxt and used as the application foundation.
- **Vue 3 and TypeScript:** The UI is built with Vue Composition API patterns and typed domain models.
- **Pinia:** Application state is organized into stores for authentication, CVs, employees, dictionaries, and projects.
- **GraphQL and Apollo Client:** Data access is handled through Apollo, with generated TypeScript documents from the GraphQL schema and `.gql` operations.
- **GraphQL Code Generator:** `graphql/generated` is produced from `graphql/schema.graphql`, Vue files, and GraphQL documents.
- **Vuetify and Tailwind CSS:** Vuetify provides the component system while Tailwind is used for layout and utility styling.
- **Nuxt i18n:** English and Russian locales are configured, with Russian as the default locale.
- **Vitest and Vue Test Utils:** Unit tests cover stores, composables, layouts, middleware, pages, and reusable components.
- **Playwright:** End-to-end test tooling is configured for browser-level validation.
- **Docker Compose:** Local backend services include PostgreSQL, the CV API service, and Browserless Chrome.

## Screenshots

<p align="center">
  <img src="screenshots/Screenshot%202026-05-30%20at%2021-53-37%20CV%20Preview%20-%20Innowise%20CV.png" alt="CV preview screen" width="100%" />
</p>

<table>
  <tr>
    <td colspan="2">
      <img src="screenshots/Screenshot%202026-05-30%20at%2022-04-04%20Profile%20-%20Innowise%20CV.png" alt="Employee profile screen" />
      <br />
      <sub><b>Employee Profile</b></sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="screenshots/Screenshot%202026-05-30%20at%2021-50-10%20Login%20-%20Innowise%20CV.png" alt="Login screen" />
      <br />
      <sub><b>Login</b></sub>
    </td>
    <td width="50%">
      <img src="screenshots/Screenshot%202026-05-30%20at%2021-50-50%20Employees%20-%20Innowise%20CV.png" alt="Employees list screen" />
      <br />
      <sub><b>Employees</b></sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="screenshots/Screenshot%202026-05-30%20at%2021-51-02%20CV%20List%20-%20Innowise%20CV.png" alt="CV list screen" />
      <br />
      <sub><b>CV List</b></sub>
    </td>
    <td width="50%">
      <img src="screenshots/Screenshot%202026-05-30%20at%2021-50-57%20Projects%20-%20Innowise%20CV.png" alt="Projects management screen" />
      <br />
      <sub><b>Projects</b></sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="screenshots/Screenshot%202026-05-30%20at%2021-52-31%20Employee%20Skills%20-%20Innowise%20CV.png" alt="Employee skills screen" />
      <br />
      <sub><b>Employee Skills</b></sub>
    </td>
    <td width="50%">
      <img src="screenshots/Screenshot%202026-05-30%20at%2021-52-38%20Employee%20Languages%20-%20Innowise%20CV.png" alt="Employee languages screen" />
      <br />
      <sub><b>Employee Languages</b></sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="screenshots/Screenshot%202026-05-30%20at%2021-52-44%20Employee%20CVs%20-%20Innowise%20CV.png" alt="Employee CVs screen" />
      <br />
      <sub><b>Employee CVs</b></sub>
    </td>
    <td width="50%">
      <img src="screenshots/Screenshot%202026-05-30%20at%2021-51-08%20Departments%20-%20Innowise%20CV.png" alt="Departments management screen" />
      <br />
      <sub><b>Departments</b></sub>
    </td>
  </tr>
</table>

## Engineering Approach

- **SSR-first Nuxt architecture:** The app uses Nuxt file-based routing, route middleware, layouts, runtime config, and Nitro dev proxying for a frontend that can run cleanly in local and production-like environments.
- **Typed API layer:** GraphQL operations are stored separately from UI code and compiled into strongly typed documents, reducing manual API typing and keeping store/component data contracts explicit.
- **Centralized authentication flow:** JWT access and refresh tokens are stored in cookies, decoded for expiry checks, refreshed through the auth store, and enforced by global route middleware.
- **Reusable CRUD patterns:** Common table, list, form, breadcrumb, formatting, file upload, and domain form behavior is extracted into composables and shared components.
- **Domain-oriented structure:** Components, pages, stores, and types are grouped around business areas such as CVs, users, projects, skills, languages, positions, and departments.
- **Testable state and UI boundaries:** Unit tests target stores, composables, middleware, and page/component behavior rather than relying only on manual UI checks.

## Implemented Features

### Authentication

- Login and registration screens.
- Cookie-based access and refresh token handling.
- Automatic token refresh before protected route access.
- Authenticated user loading from JWT payload data.
- Redirects for public and protected routes through global Nuxt middleware.

### Employee Management

- Employee list view.
- Employee profile editing and avatar upload.
- Employee-specific CV management.
- Employee skills management.
- Employee language proficiency management.

### CV Management

- CV list view.
- CV details editing.
- CV skills editing.
- CV project assignment and editing.
- CV preview page for review, printing, or sharing.

### Dictionaries And Organization Data

- Departments management.
- Positions management.
- Skills catalog management.
- Languages catalog management.
- Global projects management.
- Settings page.

### UI And Product Experience

- Sidebar-based authenticated layout.
- Auth-specific layout for login and registration.
- Breadcrumbs and tab navigation for nested workflows.
- Reusable add/edit modals and confirmation modal.
- Light and dark Vuetify themes with project-specific brand colors.
- English and Russian translations.

## Project Structure

```text
app/
  components/       Reusable UI components grouped by domain
  composables/      Shared table, list, form, breadcrumb, upload, and formatting logic
  layouts/          Authenticated and auth-only layouts
  middleware/       Global authentication route guard
  pages/            Nuxt file-based routes
  stores/           Pinia stores for auth and domain data
  types/            Domain TypeScript types
graphql/
  *.gql             GraphQL operations
  schema.graphql    API schema used by GraphQL Code Generator
  generated/        Generated typed GraphQL documents
i18n/locales/       English and Russian translations
tests/              Unit tests for components, composables, middleware, pages, and stores
screenshots/        README screenshots
```

## Running Locally

Install dependencies:

```bash
npm install
```

Generate GraphQL types after schema or operation changes:

```bash
npm run codegen
```

Start the frontend:

```bash
npm run dev
```

The Nuxt app runs at `http://localhost:3000` by default.

## Environment

The frontend reads the GraphQL endpoint from runtime config:

```bash
VITE_GRAPHQL_URL="http://localhost:3001/api/graphql"
VITE_GRAPHQL_BROWSER_URL="/api/graphql"
```

`VITE_GRAPHQL_URL` defaults to `http://localhost:3001/api/graphql`. `VITE_GRAPHQL_BROWSER_URL` defaults to `/api/graphql`, which is proxied by Nitro during development.

## Backend Services

The included Docker Compose setup starts:

- `cv_postgres`: PostgreSQL database.
- `cv_chrome`: Browserless Chrome service.
- `cv_node`: Backend GraphQL API service.

Create the expected backend environment files before starting Docker Compose:

```bash
.env.cv_node
.env.cv_postgres
```

Start and stop backend services:

```bash
docker-compose up -d
docker-compose down
```

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## Production Build

```bash
npm run build
npm run preview
```
