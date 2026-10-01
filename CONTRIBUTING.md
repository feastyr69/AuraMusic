# Contributing to AuraMusic

Thank you for your interest in contributing to AuraMusic! We welcome contributions from everyone.

## Getting Started

1. **Fork the repository** and clone it locally.
2. **Install dependencies**:
   - For the frontend: `cd frontend && npm install`
   - For the server: `cd server && npm install`
3. **Set up environment variables**:
   - Copy `.env.example` to `.env` in the root directory.
   - Fill in the necessary credentials (e.g., PostgreSQL URL, Google OAuth).
4. **Run the application**:
   - You can use Docker: `docker compose up -d --build`
   - Or run locally:
     - Frontend: `npm run dev`
     - Server: `cd server && npm run dev`

## Code Standards

- **Formatting**: We use Prettier and ESLint. Please ensure your code is linted (`npm run lint` in the frontend).
- **TypeScript**: Use TypeScript for both frontend and backend development. Avoid using `any` wherever possible.
- **Commits**: Write clear and concise commit messages.

## Pull Requests

1. Create a new branch for your feature or bug fix: `git checkout -b feature/my-new-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/my-new-feature`
4. Submit a pull request.

Please make sure to update tests as appropriate and verify that the CI pipeline passes.

## Reporting Bugs

If you find a bug, please create an issue with:
- A clear title and description.
- Steps to reproduce the issue.
- Expected vs. actual behavior.

Thank you for helping make AuraMusic better!
