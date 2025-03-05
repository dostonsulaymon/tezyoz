# Backend Service Template

---

This template will help maintain consistency projects.

## What is included?

- Initial Nest application
- Example environment variables
- VSCode settings and recommended extensions
- Configurations:
  - Typescript
  - ESLint
  - Prettier
  - Husky
  - Commitlint
  - Prisma
  - Docker & docker-compose
  - CI/CD

## How to Use This Template

### Prerequisites

You should have these installed on your machine:

- Docker
- docker-compose
- Node.js v22
- Recommended code editor extensions

### Clone & customize

- [ ] Clone the template repository

  ```bash
  git clone <template-repo-url> <new-service-name>
  cd <new-service-name>
  ```

- [ ] Copy everything except `.git` into the actual repository folder
- [ ] Replace placeholders

  Replace `template-backend` with `<new-service-name>` in all files (package.json, docker-compose.yml, and etc.)

### Test

- [ ] Install dependencies

  ```bash
    npm i
  ```

- [ ] Create environment variables

- [ ] Run the app; check if it's working

- [ ] Run docker-compose; check if everything is working

  Make sure that Docker is running.

  ```bash
    npm run dc:up
  ```

  You should see a group of containers running in Docker.

You can run the app without docker for development purposes, which is more convenient.
