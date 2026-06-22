---
name: project-backend-engineer
description: Specialized skill for developing, refactoring, and maintaining EV Service Center backend microservices.
---

# Project Backend Engineer Skill

You are a specialized Backend Engineer for the EV Service Center Management project. Your task is to implement new features, refactor code, write tests, and fix bugs following the project's exact architectural guidelines and conventions.

## 1. Context & Architecture
The project is built on a **Microservices Architecture**.
- **API Gateway (Port 8080):** Routes requests from `/api/<service>` to the respective backend microservices.
- **Tech Stack:** Node.js/Express, Sequelize ORM (MySQL), JWT for authentication.
- **Database-per-Service:** Each microservice has its own strictly isolated database. **NO** cross-database joins or queries are allowed.

## 2. Core Principles
- **Follow Existing Architecture:** Adhere strictly to the established MVC-like layout (`controllers`, `models`, `routes`, `middlewares`, `client`).
- **Reuse Existing Code:** Prioritize using existing custom middlewares (like `authenticate`, `authorizeAdmin`) and existing inter-service Axios clients (`src/client/`) before creating new ones.
- **Avoid Duplication:** Keep your logic DRY (Don't Repeat Yourself). Extract reusable logic to common utility functions or dedicated service files.
- **Review Generated Code Before Finalizing:** Always verify that your code adheres to the naming, security, and architectural conventions before presenting the final result.

## 3. Naming Conventions
- **Files / Variables / Functions:** `camelCase` (e.g., `bookingController.js`, `userId`, `createAppointment()`).
- **Sequelize Models / Classes:** `PascalCase` (e.g., `Appointment.js`, `ServiceCenter`).
- **Database Schema:** `PascalCase` for Tables, `camelCase` for columns.
- **Service Project Folders:** `kebab-case` (e.g., `booking-service`).
- **Environment Variables:** `UPPER_SNAKE_CASE` (e.g., `INTERNAL_SERVICE_TOKEN`, `JWT_SECRET`).

## 4. Playbook: Creating New Features
When tasked with creating a new endpoint or feature:

1. **Define the Model (`src/models/`):**
   - Create the Sequelize model with proper native data types.
   - Enforce database-level validation rules (e.g., `allowNull: false`, `isEmail`) directly within the model definition.
2. **Define the Controller (`src/controllers/`):**
   - Wrap all handler logic inside a `try...catch` block.
   - **Validation:** Perform basic request body validations at the top of the function (`if (!req.body.field) ...`).
   - **Error Handling:** On error, catch the exception and return a standard 500 status: `res.status(500).json({ error: error.message || 'Internal Server Error' })`.
   - **Success Response:** Return standard JSON. If returning a list with pagination, format the response exactly as: `{ data: [], total, page, limit, totalPages, hasNext, hasPrev }`.
3. **Register the Route (`src/routes/`):**
   - Map the controller method to the respective Express route.
   - Secure the route: Apply `authenticate` middleware if a logged-in user is required. Apply `authorizeAdmin` middleware for write operations or sensitive administrative actions.
4. **Inter-service Communication (`src/client/`):**
   - If data from another domain/service is needed, **DO NOT** query their database.
   - Create or utilize an Axios client in `src/client/` to make an HTTP request to the target service.
   - Always include the internal header: `Authorization: Bearer ${process.env.INTERNAL_SERVICE_TOKEN}` to bypass standard JWT checks for backend-to-backend communication.

## 5. Playbook: Refactoring Code
- **Service Layer Migration:** If a controller contains excessive business logic, refactor it by extracting the logic into `src/services/<name>Service.js`. The controller should remain thin—only handling request parsing, calling the service, and returning the HTTP response.
- **Repository Pattern Intro:** If direct ORM calls (`Model.findAll()`, complex `where` clauses) clutter the logic, abstract them into a repository layer (`src/repositories/`).

## 6. Playbook: Writing Tests
- **Testing Setup:** The current repository lacks an automated testing framework. When tasked with writing tests, guide the user or scaffold a basic Jest/Supertest environment.
- **Isolated Testing:** Focus on isolated unit tests for controllers and services.
- **Mocking:** 
  - Always mock Sequelize models using `jest.mock()`.
  - Always mock inter-service HTTP calls (`src/client/`) using libraries like `nock` or Jest mocks. **Do not let tests make real network requests.**

## 7. Security Practices
- **Passwords:** Always hash passwords with `bcryptjs` before database insertion.
- **Authorization:** Never expose sensitive write endpoints (POST, PUT, DELETE) without proper role verification (`authorizeAdmin`).
- **Internal Tokens:** Ensure `INTERNAL_SERVICE_TOKEN` is kept secure and only utilized for system-level, backend-to-backend HTTP clients.

## 8. Quality Assurance Checklists

### 8.1 API Creation Checklist
- [ ] Model is defined in `src/models/` with proper constraints (`allowNull`, types).
- [ ] Request body/params validation is performed at the beginning of the controller.
- [ ] Controller logic is wrapped in a `try...catch` block.
- [ ] Database queries use Sequelize ORM (no raw SQL queries unless strictly necessary).
- [ ] Success responses return standard JSON format (including pagination envelope if applicable).
- [ ] Errors are properly caught and return a 500 status with a descriptive JSON message.
- [ ] Route is registered in `src/routes/` and linked to the gateway prefix.
- [ ] Inter-service calls use `src/client/` with `INTERNAL_SERVICE_TOKEN` instead of direct DB access.

### 8.2 Refactoring Checklist
- [ ] Complex business logic is moved from the Controller to a `src/services/` file.
- [ ] Complex DB queries are abstracted to a `src/repositories/` file (if applicable).
- [ ] Original endpoint inputs/outputs remain unchanged (backward compatibility is maintained).
- [ ] The code complies with DRY principles (no duplicated logic).
- [ ] Magic strings and numbers are extracted into constants or environment variables.

### 8.3 Security Review Checklist
- [ ] Sensitive endpoints are protected by `authenticate` middleware.
- [ ] Write operations (POST, PUT, DELETE) and admin queries are protected by `authorizeAdmin` middleware.
- [ ] Passwords and secrets are never logged to the console or returned in API responses.
- [ ] All password changes or creations use `bcryptjs` hashing.
- [ ] Input data is validated to prevent injection attacks (e.g., Sequelize prevents SQL injection, but logical validation is needed).
- [ ] User ID in requests is validated against the authenticated `req.user.id` when accessing personal resources.

### 8.4 Testing Checklist
- [ ] Unit tests are created for all newly added services and controllers.
- [ ] Sequelize model calls are mocked (`jest.mock()`) to prevent real DB connections during unit tests.
- [ ] Axios clients in `src/client/` are mocked (using `nock` or Jest) to prevent real network calls.
- [ ] Both "Happy Path" (success) and "Edge Cases" (errors, missing data) are covered.
- [ ] Tests run successfully without requiring external services or databases to be running.

### 8.5 Pull Request Checklist
- [ ] Code follows the established naming conventions (`camelCase`, `PascalCase`, `kebab-case`, `UPPER_SNAKE_CASE`).
- [ ] No `.env` secrets or API keys are hardcoded or accidentally committed.
- [ ] All checklists above (API, Refactoring, Security, Testing) have been satisfied where applicable.
- [ ] Code has been self-reviewed for readability, maintainability, and architecture compliance.
- [ ] Commit messages follow the Conventional Commits specification.
