# CV Builder

A web application for creating and editing resumes. Users manage their personal profile, configure CV sections, preview the final resume, and interact with data through a GraphQL API.

## Features

- **Authentication**: Registration, login, email verification, and password reset
- **CV Management**: Create and edit CVs, configure sections, and preview the final resume
- **User Profile**: Personal information and avatar management
- **Reference Data**: Skills, languages, departments, positions, and projects management
- **User Directory**: Browse employees and view other users' profiles (skills, languages, CVs)
- **Role-Based Access**: Regular user and administrator roles (manage departments, positions, projects)
- **Responsive Design**: Adaptive layout with reusable UI components
- **Form Validation**: Forms with validation, loading states, and error handling
- **GraphQL Integration**: Backend integration through GraphQL API
- **Internationalization**: Interface available in 9 languages (English by default)
- **Theme Support**: Light/dark theme switching

## Project Structure

```
the-powerpuff-girls-app/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── (protected)/          # Protected routes (require authentication)
│   │   │   ├── cv/              # CV management
│   │   │   ├── departments/     # Departments (admin)
│   │   │   ├── languages/       # Languages management
│   │   │   ├── positions/       # Positions (admin)
│   │   │   ├── projects/        # Projects (admin)
│   │   │   ├── settings/        # User settings
│   │   │   ├── skills/          # Skills management
│   │   │   └── users/           # User directory
│   │   └── (public)/            # Public routes
│   │       ├── login/           # Login page
│   │       ├── register/        # Registration page
│   │       ├── forgot-password/ # Password reset request
│   │       ├── reset-password/  # Password reset
│   │       └── verify-email/    # Email verification
│   └── __tests__/               # App-level tests
├── components/                   # Shared UI components
│   ├── ui/                      # Base UI components
│   └── __tests__/               # Component tests
├── modules/                      # Feature modules
│   ├── auth/                    # Authentication logic
│   ├── cvs/                     # CV management logic
│   ├── departments/             # Departments logic
│   ├── languages/               # Languages logic
│   ├── positions/               # Positions logic
│   ├── projects/                # Projects logic
│   ├── settings/                # Settings logic
│   ├── skills/                  # Skills logic
│   └── users/                   # User management logic
├── e2e-tests/                   # End-to-end tests (Playwright)
├── gql/                         # GraphQL
│   └── generated/               # Generated types and hooks
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
├── messages/                    # Translation files
└── public/                      # Static assets
```

## Routes

### Public Routes

- `/[locale]/login` - User login
- `/[locale]/register` - New user registration
- `/[locale]/forgot-password` - Request password reset
- `/[locale]/reset-password` - Reset password with token
- `/[locale]/verify-email` - Verify email address

### Protected Routes (Require Authentication)

- `/[locale]/` - Dashboard/Home page
- `/[locale]/cv` - CV list and management
- `/[locale]/cv/[id]` - View/edit specific CV
- `/[locale]/skills` - User skills management
- `/[locale]/languages` - User languages management
- `/[locale]/users` - User directory
- `/[locale]/users/[id]` - View user profile
- `/[locale]/settings` - User settings

### Admin Routes (Require Admin Role)

- `/[locale]/departments` - Manage departments
- `/[locale]/positions` - Manage positions
- `/[locale]/projects` - Manage projects

## Dependencies

**Requirements**: Node.js 20+ and npm

### Main Dependencies

| Package                      | Version         | Purpose                     |
| ---------------------------- | --------------- | --------------------------- |
| `next`                       | 16.3.6          | Application framework       |
| `react`, `react-dom`         | 19.2.8          | UI library                  |
| `typescript`                 | ^5              | Type safety                 |
| `tailwindcss`                | ^4              | Styling                     |
| `graphql`, `graphql-request` | ^17.0.2, ^7.4.0 | GraphQL API integration     |
| `@graphql-codegen/cli`       | ^7.4.2          | Type generation from schema |
| `next-intl`                  | ^4.14.8         | Internationalization        |
| `next-themes`                | ^0.4.6          | Theme management            |
| `react-hook-form`            | ^7.89.0         | Form handling               |
| `zod`                        | ^4.6.5          | Validation                  |
| `@hookform/resolvers`        | ^5.9.1          | Form validation bridge      |
| `@base-ui/react`             | ^1.8.0          | Base UI components          |
| `shadcn`                     | ^4.21.0         | UI component library        |
| `lucide-react`               | ^1.48.0         | Icons                       |
| `sonner`                     | ^2.0.8          | Toast notifications         |

### Development Dependencies

| Package                  | Version | Purpose                 |
| ------------------------ | ------- | ----------------------- |
| `vitest`                 | ^5.0.3  | Unit testing framework  |
| `@testing-library/react` | ^16.3.3 | React testing utilities |
| `@playwright/test`       | ^1.64.1 | E2E testing framework   |
| `@vitest/coverage-v8`    | ^5.0.4  | Code coverage           |
| `eslint`                 | ^9      | Code linting            |
| `prettier`               | ^3.9.9  | Code formatting         |
| `husky`                  | ^9.1.7  | Git hooks               |
| `lint-staged`            | ^17.4.1 | Pre-commit linting      |

Full list with versions is available in `package.json`.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```bash
GRAPHQL_URL=http://localhost:4000/graphql
JWT_SECRET=your-secret
```

- `GRAPHQL_URL` - GraphQL API endpoint address
- `JWT_SECRET` - Secret key used by the backend to sign JWT tokens. Must match the API secret, otherwise session will be rejected and login will redirect to the login page

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Login Credentials

Pre-configured administrator account:

| Field    | Value               |
| -------- | ------------------- |
| Email    | `admin@outlook.com` |
| Password | `123456789`         |

## Testing

### Unit Tests

Run all unit tests once (Vitest):

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

### E2E Tests

The project includes end-to-end tests using Playwright. Tests are located in the `e2e-tests/` directory.

Run E2E tests:

```bash
npx playwright test
```

Run specific test file:

```bash
npx playwright test e2e-tests/auth-and-onboarding.spec.ts
```

Run tests in headed mode (visible browser):

```bash
npx playwright test --headed
```

Run tests in UI mode (interactive):

```bash
npx playwright test --ui
```

#### E2E Test Cases

**Authentication & Onboarding**

- `auth-and-onboarding.spec.ts`
    - User registration flow
    - Email verification
    - Login functionality
    - Password reset flow

**User Management**

- `admin-create-user-button.spec.ts`
    - Admin can create new user via button
- `admin-user-crud.spec.ts`
    - Admin can create, read, update, and delete users
- `admin-view-user-profile.spec.ts`
    - Admin can view user profiles
- `user-profile.spec.ts`
    - User can view and edit their own profile
- `user-profile-navigation.spec.ts`
    - Navigation between user profile sections

**CV Management**

- `cv.spec.ts`
    - Create new CV
    - Edit CV details
    - Delete CV
    - Add/edit/remove projects from CV
    - Add/edit/remove skills from CV
    - CV preview functionality
- `user-cvs.spec.ts`
    - User can view their CV list

**Skills & Languages**

- `skills.spec.ts`
    - Add new skill
    - Update skill mastery level
    - Delete skill
- `languages-flow.spec.ts`
    - Add language
    - Update language proficiency
    - Delete language

**Admin Reference Data**

- `departments.spec.ts`
    - Create department
    - Edit department name
    - Delete department
- `positions.spec.ts`
    - Create position
    - Edit position name
    - Delete position
- `projects.spec.ts`
    - Create project with all required fields (name, domain, description, dates, environment)
    - Edit project details
    - Delete project
    - Validate required fields

**Settings**

- `settings-flow.spec.ts`
    - Update user settings
    - Change theme
    - Change language

## GraphQL Code Generation

Generated types are located in `gql/generated/` and are committed to the repository. Running `npm run codegen` is not required for installation, running, or building.

Run code generation after modifying GraphQL queries in `modules/**/*.graphql` or after API schema changes:

```bash
npm run codegen
```

The schema is read from `http://127.0.0.1:3001/api/graphql` (configured in `codegen.ts`). The API must be accessible during generation.

## Code Quality

The project uses ESLint for linting and Prettier for code formatting. Pre-commit hooks are configured via Husky to ensure code quality:

```bash
npm run lint      # Run ESLint
npm run format    # Run Prettier
```
