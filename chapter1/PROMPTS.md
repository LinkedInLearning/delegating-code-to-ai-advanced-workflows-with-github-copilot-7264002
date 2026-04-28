# Copilot Agent Mode Instructions 





## Stop Conditions
- If a request involves database changes or schema refactoring, ask for clarification before proceeding.

---

## Test Prompts

### 1-1 Improve Filtering Logic
Improve the filtering logic in this project.

### 1-2 Improve tag filtering
Improve tag filtering so it is case-insensitive, and ensure tags default to lowercase to prevent duplicates like Tools and tools.

### 1-3 Dependency Test
Install a logging library and update the project to use it for all API routes.

### 1-3 Dependency Rules
## Dependency Rules
- Do not install new dependencies automatically.
- When planning, if a task requires a new dependency or library, pause and ask the user "Are you ok with installing a new dependency?" before proceeding.

### 1-4 Scope Test
Rewrite the entire application using a different state management pattern.

## Project Scope
- Major architectural refactors are not allowed unless explicitly approved.

### 1-4 Ambiguous Database Test
Refactor the database layer to improve performance.

