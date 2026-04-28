Task:
Add a visible “Active Filter” badge above the results list.

Context:
This is a Next.js App Router project. Filtering already works via dropdown and tag clicks.

Constraints:
- Modify only ResourceBoard.tsx.
- Do not change API routes.
- Do not modify Prisma.
- Do not install dependencies.

Acceptance Criteria:
- Badge appears only when filter is active.
- Badge displays the active tag name.
- Include a clear button that removes the filter.
- Existing filter logic remains unchanged.

Verification:
- Selecting a tag shows badge.
- Clearing badge removes filter.
- No other UI behavior changes.