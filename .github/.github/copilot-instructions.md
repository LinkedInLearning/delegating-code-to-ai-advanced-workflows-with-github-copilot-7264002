# Persistent Copilot Instructions

These instructions apply to all Copilot Agent Mode tasks in this repository.

General rules:
- Follow the existing project structure.
- Do not invent commands.
- Use only documented npm scripts (gp:*).
- Keep changes scoped to the request.
- If a request conflicts with these instructions, stop and ask for clarification before making changes.


UI behavior rules:
- Tag filtering must work via both tag chips and the dropdown.
- Dark/light mode toggle must remain functional and persist across refresh.
- Do not change UI behavior unless explicitly requested.

Quality rules:
- Do not delete tests to make builds pass.
- Explain tradeoffs when unsure before making changes.
