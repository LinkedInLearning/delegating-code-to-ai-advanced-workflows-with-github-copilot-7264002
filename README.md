# Delegating Code to AI: Advanced Workflows with GitHub Copilot
This is the repository for the LinkedIn Learning course `Delegating Code to AI: Advanced Workflows with GitHub Copilot`. The full course is available from [LinkedIn Learning][lil-course-url].

![lil-thumbnail-url]

## This Branch — Chapter 5

This branch is the starting point for **Chapter 5: Logging, Security, and Team Standards**.

The ResourceStack app is fully functional on this branch — tag filtering, search by title, and favorites all work. Your exercise is to use GitHub Copilot Agent Mode to add structured logging to the API routes, enforce security boundaries, and evaluate tasks against team delegation standards.

**What's working on this branch:**
- Tag filtering (case-insensitive)
- Search by title
- Active filter badge
- Favorites tab

**Your task:**
- Use the prompts in `chapter5/PROMPTS.md` as your guide
- Add structured `[INFO]` and `[ERROR]` log entries to API routes
- Apply the security boundary rules: do not log tokens, passwords, or full request bodies
- Use the `team-standards-reviewer` agent to evaluate the incomplete logging task in prompt 5-3

---

## Quick Start

```bash
cd resourcestack
cp .env.example .env
npm run gp:setup
npm run gp:dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Switching Branches

```bash
git switch <branch-name>
cd resourcestack && npm run gp:setup
```

## Troubleshooting

- **`DATABASE_URL` error** — Make sure you've copied `.env.example` to `.env` before running setup.
- **Prisma errors after switching branches** — Run `npm run gp:setup` again to re-migrate and re-seed.
- **Port already in use** — Kill the existing process or run on a different port with `PORT=3001 npm run gp:dev`.

## Instructor

Check out my other courses on [LinkedIn Learning](https://www.linkedin.com/learning/instructors/).


[0]: # (Replace these placeholder URLs with actual course URLs)

[lil-course-url]: https://www.linkedin.com/learning/
[lil-thumbnail-url]: https://media.licdn.com/dms/image/v2/D4E0DAQG0eDHsyOSqTA/learning-public-crop_675_1200/B4EZVdqqdwHUAY-/0/1741033220778?e=2147483647&v=beta&t=FxUDo6FA8W8CiFROwqfZKL_mzQhYx9loYLfjN-LNjgA

