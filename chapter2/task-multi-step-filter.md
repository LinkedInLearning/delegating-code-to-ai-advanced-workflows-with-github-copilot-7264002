Add an “Active Filter” badge above the results list that shows the selected tag and allows clearing the filter.

---
Task:
Add an “Active Filter” badge above the results list.

Steps:
1. Identify where the current filter state is stored.
2. Render a badge above the results list when a filter is active.
3. Display the active tag name inside the badge.
4. Add a clear action that removes the filter.
5. Ensure existing filtering behavior remains unchanged.

Constraints:
- Modify only ResourceBoard.tsx
- Do not change API routes
- Do not modify Prisma
- Do not install dependencies

Verification: s
- Selecting a tag shows the badge
- Clearing the badge removes the filter
- Filtering behavior remains unchanged