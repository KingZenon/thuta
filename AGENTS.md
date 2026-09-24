# Workspace boundaries

This Git repository links three sibling project repositories as submodules: `app/` (web client), `api/` (HTTP service and database), and `mobile/` (reserved native client). Read the relevant project's `AGENTS.md` before changing it. The root `SPEC.md` describes shared product behavior; each project `SPEC.md` describes its own features. `README.md` files are for people setting up or using the projects.

## Stable architecture

- The API owns authentication, listing data, status transitions, and authorization. Clients use its versioned HTTP interface; they do not import source from sibling projects or query the database directly.
- Keep the web and API independently buildable and deployable. `mobile/` has no runtime implementation yet.
- Keep secrets and local database files out of Git. Use each project's environment example. Do not put access credentials in documentation or client bundles.
- Server-side ownership and administrator checks are required for protected listing operations. Client checks only improve navigation and feedback.
- Database schema changes go through Prisma migrations. Review migration SQL before deployment.
- Keep implementation status honest in docs: distinguish working features from planned ones.

## Chosen technology

- Web: TypeScript, React, Vite, React Router, Tailwind CSS 4, and locally owned UI components.
- API: TypeScript, Node.js, Express 5, Prisma ORM 7, SQLite with the better-sqlite3 adapter, and Zod.
- Mobile target: TypeScript, React Native, Expo, and Expo Router when mobile work starts.
- The current lockfiles in `app/` and `api/` use pnpm. Run commands from the project directory.

For feature requirements, see [SPEC.md](SPEC.md). For setup and project status, see [README.md](README.md).
