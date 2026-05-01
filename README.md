# Delegating Code to AI: Advanced Workflows with GitHub Copilot
This is the repository for the LinkedIn Learning course `Delegating Code to AI: Advanced Workflows with GitHub Copilot`. The full course is available from [LinkedIn Learning][lil-course-url].

![lil-thumbnail-url]

## Course Description

Learn how to delegate complex coding tasks to GitHub Copilot using advanced agent workflows and customization techniques. This course teaches you how to effectively guide AI assistants through multi-step tasks, set boundaries with custom instructions, and leverage agent modes for better code generation results.

The course uses **ResourceStack**, a modern Next.js resource organizer application, as a hands-on learning environment where you'll practice:
- Creating and refining custom Copilot instructions
- Managing dependencies and scope with agent guardrails
- Debugging and fixing issues with AI assistance
- Implementing features through effective task delegation

## Prerequisites

To follow along with this course, you should have:
- Basic understanding of JavaScript/TypeScript
- Familiarity with GitHub Copilot
- Node.js 18+ installed
- Git for version control
- A code editor (VS Code recommended with GitHub Copilot extension)

## Quick Start

### Running the ResourceStack Application

1. Navigate to the project directory:
   ```bash
   cd resourcestack
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Run the setup script (installs dependencies, generates Prisma client, runs migrations, seeds database):
   ```bash
   npm run gp:setup
   ```

4. Start the development server:
   ```bash
   npm run gp:dev
   ```

5. Open your browser to [http://localhost:3000](http://localhost:3000)

### Additional Commands

- **Run tests**: `npm run gp:test`
- **Lint code**: `npm run gp:lint`
- **Reproduce bug** (for debugging exercises): `npm run gp:repro`
- **View logs**: Check `./logs/app.log`

## Repository Structure

```
.
├── resourcestack/          # Main Next.js application
│   ├── app/               # Next.js app router (pages & API routes)
│   ├── components/        # React components
│   ├── lib/               # Utility functions and database setup
│   ├── prisma/            # Database schema and migrations
│   ├── tests/             # Test files
│   └── scripts/           # Helper scripts
├── .github/
│   ├── agents/            # Custom Copilot agent definitions
│   ├── workflows/         # CI workflows
│   └── copilot-instructions.md  # Persistent agent instructions
├── chapter1/              # Chapter 1 exercises and prompts
├── chapter2/              # Chapter 2 exercises and prompts
├── chapter3/              # Chapter 3 exercises and prompts
├── chapter4/              # Chapter 4 exercises and prompts
├── chapter5/              # Chapter 5 exercises and prompts
└── chapter6/              # Chapter 6 exercises and prompts
```

## Course Chapters

Each branch in this repository corresponds to a chapter in the course. Switch to the branch to get the starting state for that chapter's exercises.

| Branch | Chapter | Topic |
|--------|---------|-------|
| `chapter1` | Chapter 1 | Agent Customization Fundamentals — custom instructions, guardrails, scope, stop conditions |
| `chapter2` | Chapter 2 | Advanced Task Delegation — refining prompts, scope checkpoints, verification |
| `chapter3` | Chapter 3 | Golden Path Scripting — enforcing `gp:` scripts, environment rules |
| `chapter4` | Chapter 4 | Log-Driven Debugging — using the `log-debugger` agent to diagnose issues with evidence |
| `chapter5` | Chapter 5 | Logging, Security & Team Standards — structured logging, safe boundaries, standards review |
| `chapter6` | Chapter 6 | Delegation Risk & Failure Review — evaluating tasks with `delegation-risk-reviewer` and `delegation-failure-reviewer` agents |
| `main` | Final state | Fully working app with all features |

## Custom Agents

This repository includes custom Copilot agent definitions in `.github/agents/`:

- **`log-debugger`** — Diagnoses issues using logs and evidence before suggesting fixes
- **`team-standards-reviewer`** — Reviews tasks against team delegation standards before work begins
- **`delegation-risk-reviewer`** — Evaluates whether a task should be delegated to AI or remain human-led
- **`delegation-failure-reviewer`** — Analyzes failed AI delegation outcomes and recommends corrections

## Working with Branches

The branches are structured to correspond to the chapters in the course. Each branch contains:
- Exercise files
- Custom instruction examples
- Prompts for practice

### Switching to Chapter Branches

1. **First time setup** - Fetch all available branches:
   ```bash
   git fetch origin
   ```

2. **Switch to a chapter branch**:
   ```bash
   git switch chapter1
   # or chapter2, chapter3, chapter4, chapter5, chapter6
   ```

Git will automatically create a local tracking branch from the remote branch.

Alternatively, you can browse different chapters using the branch menu in GitHub.

### Handling Local Changes

If you've made changes and want to switch branches, you may see an error. To resolve:

**Option 1 - Commit your changes:**
```bash
git add .
git commit -m "Your commit message"
git switch <branch-name>
```

**Option 2 - Stash your changes:**
```bash
git stash
git switch <branch-name>
git stash pop  # To restore your changes later
```

## About ResourceStack

ResourceStack is a full-stack web application built with:
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **Tailwind CSS** - Styling
- **SQLite** - Database (via Prisma)
- **Vitest** - Testing framework

The application intentionally includes a URL normalization bug for debugging exercises in the course.

## Troubleshooting

**Database issues**: Try resetting the database:
```bash
cd resourcestack
npx prisma migrate reset
```

**Dependency issues**: Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Port already in use**: Kill the process on port 3000 or use a different port:
```bash
npm run gp:dev -- -p 3001
```


[0]: # (Replace these placeholder URLs with actual course URLs)

[lil-course-url]: https://www.linkedin.com/learning/
[lil-thumbnail-url]: https://media.licdn.com/dms/image/v2/D4E0DAQG0eDHsyOSqTA/learning-public-crop_675_1200/B4EZVdqqdwHUAY-/0/1741033220778?e=2147483647&v=beta&t=FxUDo6FA8W8CiFROwqfZKL_mzQhYx9loYLfjN-LNjgA

