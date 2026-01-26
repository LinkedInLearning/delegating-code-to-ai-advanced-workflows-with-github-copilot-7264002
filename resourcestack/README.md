# ResourceStack

A modern, visually clean resource organizer for links, notes, and tags. Designed for hands-on Copilot Agent Mode delegation labs.

## Quick start (golden path)

1. Copy env:
   - `cp .env.example .env`

2. Setup:
   - `npm run gp:setup`

3. Run:
   - `npm run gp:dev`

Open: http://localhost:3000

## Tests and lint
- `npm run gp:test`
- `npm run gp:lint`

## Reproduce the seeded bug (for debugging labs)
1. Run the dev server:
   - `npm run gp:dev`
2. In another terminal:
   - `npm run gp:repro`

Logs:
- `./logs/app.log`

## Notes
- The URL normalization function intentionally contains a known bug for the course.
- Fixing it should include a regression test update (see `tests/normalizeUrl.test.ts`).
