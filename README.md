# Delegating Code to AI: Advanced Workflows with GitHub Copilot
This is the repository for the LinkedIn Learning course `Delegating Code to AI: Advanced Workflows with GitHub Copilot`. The full course is available from [LinkedIn Learning][lil-course-url].

![lil-thumbnail-url]

## Course Description

Learn how to delegate complex coding tasks to GitHub Copilot using advanced agent workflows and customization techniques. This course teaches you how to effectively guide AI assistants through multi-step tasks, set boundaries with custom instructions, and leverage agent modes for better code generation results.

## This Branch — Chapter 4

This branch is the starting point for **Chapter 4: Log-Driven Debugging with a Custom Agent**.

The ResourceStack app has a broken tag filter. Your exercise is to use a custom **log-debugger** Copilot agent to diagnose and fix the issue using evidence from logs — not guesswork.

**What's broken (for you to fix):**
- Tag filtering is case-sensitive and does not work correctly
- No visible active filter badge when a tag is selected

**Your task:**
- Use the `log-debugger` agent defined in `chapter4/PROMPTS.md`
- Reproduce the issue and gather log evidence before suggesting a fix
- Add structured `[INFO]` and `[ERROR]` logs to identify the root cause
- Fix the issue only after identifying it through evidence
- Include verification steps before accepting the fix

## Prerequisites

To follow along with this course, you should have:
- Basic understanding of JavaScript/TypeScript
- Familiarity with GitHub Copilot
- **Node.js 18+** installed
- Git for version control
- A code editor (VS Code recommended with GitHub Copilot extension)

## Quick Start

### Running the ResourceStack Application

**⚠️ IMPORTANT**: You must create a `.env` file before running setup!

1. Navigate to the resourcestack directory:
   ```bash
   cd resourcestack
   ```

2. **Create the environment file** (REQUIRED):
   ```bash
   cp .env.example .env
   ```

   This creates a `.env` file with `DATABASE_URL="file:./dev.db"` which Prisma needs to connect to the SQLite database.

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
- **View logs**: Check `./logs/app.log`

## Switching Branches

To switch to another chapter:

```bash
git fetch origin
git switch chapter1
```

### Handling Local Changes

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
git stash pop
```

## About ResourceStack

ResourceStack is a full-stack web application built with:
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM with SQLite
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework

## Troubleshooting

**Missing DATABASE_URL error**: Make sure you created the `.env` file:
```bash
cd resourcestack
cp .env.example .env
```

**Database issues**: Try resetting the database:
```bash
cd resourcestack
npx prisma migrate reset --force
```

**Dependency issues**: Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Port already in use**:
```bash
npm run gp:dev -- -p 3001
```

## Instructor

Instructor name

Instructor description

Check out my other courses on [LinkedIn Learning](https://www.linkedin.com/learning/instructors/).


[0]: # (Replace these placeholder URLs with actual course URLs)

[lil-course-url]: https://www.linkedin.com/learning/
[lil-thumbnail-url]: https://media.licdn.com/dms/image/v2/D4E0DAQG0eDHsyOSqTA/learning-public-crop_675_1200/B4EZVdqqdwHUAY-/0/1741033220778?e=2147483647&v=beta&t=FxUDo6FA8W8CiFROwqfZKL_mzQhYx9loYLfjN-LNjgA

To resolve this issue:
	
    Add changes to git using this command: git add .
	Commit changes using this command: git commit -m "some message"

## Installing
1. To use these exercise files, you must have the following installed:
	- [list of requirements for course]
2. Clone this repository into your local machine using the terminal (Mac), CMD (Windows), or a GUI tool like SourceTree.
3. [Course-specific instructions]

## Instructor

Instructor name

Instructor description

                            

Check out my other courses on [LinkedIn Learning](https://www.linkedin.com/learning/instructors/).


[0]: # (Replace these placeholder URLs with actual course URLs)

[lil-course-url]: https://www.linkedin.com/learning/
[lil-thumbnail-url]: https://media.licdn.com/dms/image/v2/D4E0DAQG0eDHsyOSqTA/learning-public-crop_675_1200/B4EZVdqqdwHUAY-/0/1741033220778?e=2147483647&v=beta&t=FxUDo6FA8W8CiFROwqfZKL_mzQhYx9loYLfjN-LNjgA

