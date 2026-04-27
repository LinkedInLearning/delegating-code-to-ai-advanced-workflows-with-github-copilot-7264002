Task:
Add search functionality to the resource list.

Context:
Resources are currently filterable by tag. We want text search by title.

Constraints:
- Modify only ResourceBoard.tsx and the API route for resources.
- Do not modify Prisma schema.
- Do not install new dependencies.

Acceptance Criteria:
- Add search input above list.
- Typing filters resources by title.
- Tag filtering continues to work.
- Both search and tag filters can work together.

Verification:
- Searching returns correct subset.
- Tag filtering still works.
- No console errors.
