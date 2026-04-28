# Copilot Persistent Instructions

These instructions apply to all Copilot Agent Mode tasks in this repository.

---

## Test Instruction

Every time a command is executed, begin your response by saying "Hello, LinkedIn Learner".

---

## 1. Project Scope

- This is a Next.js application using App Router.
- The Prisma schema and database structure must not be modified unless explicitly instructed.
- Do not introduce new frameworks, architectural patterns, or major refactors unless requested.
- Do not change API contracts or data shapes unless explicitly instructed.

---

## 2. File Modification Rules

- Modify only the files necessary to complete the requested task.
- Do not edit unrelated components.
- Do not rename files or move folders unless explicitly instructed.
- Do not create new directories without justification.
- Avoid wide refactors when a targeted fix will solve the problem.

---

## 3. Dependency Rules

- Do not install new npm packages unless explicitly requested.
- Do not modify `package.json` without approval.
- Use existing project utilities and patterns whenever possible.
- Prefer built-in framework features over adding third-party libraries.
- Do not install new dependencies automatically.
- When planning, if a task requires a new dependency or library, pause and ask the user "Are you ok with installing a new dependency?" before proceeding.
---

## 4. Environment & Execution Rules

- Use existing npm scripts for running, building, and testing.
- Do not invent commands.
- Do not assume external services or infrastructure that are not present in this repository.
- Do not add service workers or offline caching unless explicitly requested.
- Do not modify environment configuration files unless explicitly instructed.

---

## 5. Security & Safety Boundaries

- Do not expose environment variables.
- Do not log sensitive data.
- Do not bypass validation logic.
- Do not modify authentication or data access patterns unless instructed.
- Do not weaken type safety to silence errors.

---

## 6. Stop Conditions

If a request conflicts with these rules:

- Pause.
- Explain the conflict.
- Ask for clarification before proceeding.

If requirements are ambiguous:

- Ask clarifying questions.
- Do not guess.

---

## 7. Verification Expectations

- Provide a short summary of changes made.
- List files modified.
- Suggest how to verify the change locally.
- If tests exist, explain how they were validated.
- Do not delete or weaken tests to make builds pass.
- If a test fails, fix the implementation unless the test is clearly incorrect.
- If a test appears incorrect, explain why before modifying it.
- Do not claim something works without suggesting a verification step.

---

## 8. Coding Standards

- Follow existing code style and structure.
- Keep functions small and readable.
- Avoid unnecessary abstraction.
- Do not overengineer.
- Write clear variable names that match existing patterns.
- Do not use `any` or disable TypeScript rules to silence errors unless explicitly instructed.

---

## 9. Communication Expectations

- For multi-step changes, briefly outline the plan before implementing.
- After completing changes, explain what was done and why.
- If there are tradeoffs, explain them in clear and simple terms.
- Communicate like a team member, not just a code generator.

---

These rules take precedence over conversational prompts.
