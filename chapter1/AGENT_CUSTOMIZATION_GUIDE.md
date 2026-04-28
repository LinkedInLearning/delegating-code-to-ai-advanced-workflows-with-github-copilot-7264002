# Agent Customization Guide

This guide explains the GitHub Workflows directory and how to create custom GitHub Copilot agent files for ResourceStack.

---

## GitHub Workflows Directory

The [.github/workflows](.github/workflows) directory contains **GitHub Actions** configuration files that automate tasks in the repository.

### Current Workflows

**[main.yml](.github/workflows/main.yml)** - A workflow that copies content to different branches. This is useful for the LinkedIn Learning course structure where branches represent different chapters (e.g., `02_03b`, `02_03e`). It runs manually via `workflow_dispatch`.

### Common GitHub Actions Use Cases

GitHub Actions workflows can automate:
- Running tests on pull requests
- Deploying to production
- Code quality checks
- Building and publishing releases
- Dependency updates
- Security scans

---

## Creating Agent Files

Agent customization files configure how GitHub Copilot behaves in your workspace. These files enable you to create specialized agents, reusable workflows, and context-aware instructions.

### 📁 Agent File Types

| Type | File | Location | Purpose |
|------|------|----------|---------|
| **Agent Instructions** | `copilot-instructions.md` | `.github/` | Always-on rules that apply everywhere in the project |
| **Custom Agents** | `*.agent.md` | `.github/agents/` | Specialized agents with specific tools and roles |
| **Skills** | `SKILL.md` | `.github/skills/<name>/` | On-demand workflows with bundled assets (scripts, docs, templates) |
| **File Instructions** | `*.instructions.md` | `.github/instructions/` | Rules that apply to specific file patterns |
| **Prompts** | `*.prompt.md` | `.github/prompts/` | Reusable task templates with parameters |

---

## Quick Start Examples

### ✨ Creating a Custom Agent

Custom agents are specialized personas with focused responsibilities and minimal tool access.

**1. Create the agents directory:**
```bash
mkdir -p .github/agents
```

**2. Create `.github/agents/reviewer.agent.md`:**
```yaml
---
description: "Code reviewer that checks style and best practices. Use when reviewing code or checking quality."
tools: [read, search]
user-invocable: true
---

You are a code quality specialist. Review code for:
- Best practices
- Potential bugs
- Style consistency
- Security issues

## Constraints
- DO NOT modify code
- ONLY provide review feedback
- Focus on actionable improvements

## Output Format
Provide a bulleted list of issues found with file locations and line numbers.
```

**3. Use the agent:**
- Type `@` in Copilot Chat and select your custom agent from the picker
- Or invoke as subagent: it auto-loads when the description matches the task

---

### 🎯 Creating a Skill (with bundled scripts/docs)

Skills are for repeatable workflows that include scripts, templates, or reference documentation.

**1. Create the skill structure:**
```bash
mkdir -p .github/skills/database-migration
cd .github/skills/database-migration
```

**2. Create `SKILL.md`:**
```yaml
---
name: database-migration
description: 'Manage Prisma database migrations. Use for creating migrations, seeding data, or schema changes.'
argument-hint: 'migration name or task'
---

# Database Migration

## When to Use
- Creating new database migrations
- Seeding test data
- Updating the schema
- Rolling back migrations

## Procedure

### Creating a Migration
1. Review [schema.prisma](../../../resourcestack/prisma/schema.prisma)
2. Make changes to the schema
3. Run: `npm run prisma -- migrate dev --name <descriptive_name>`
4. Verify migration in [migrations/](../../../resourcestack/prisma/migrations/)

### Seeding Data
1. Edit [seed.ts](../../../resourcestack/prisma/seed.ts)
2. Run: `npm run prisma -- db seed`
3. Verify data in the database

## Notes
- Always test migrations in development first
- Migration names should be descriptive (e.g., `add_user_roles`)
- Check for breaking changes before applying to production
```

**3. Optional: Add supporting files**
```bash
# Add reference documentation
mkdir references
echo "# Migration Best Practices" > references/best-practices.md

# Add scripts
mkdir scripts
echo "#!/bin/bash\nnpm run prisma -- migrate dev" > scripts/create-migration.sh
chmod +x scripts/create-migration.sh
```

---

## Tool Aliases Reference

When configuring custom agents, you can specify which tools they have access to:

| Alias | Purpose |
|-------|---------|
| `execute` | Run shell commands and scripts |
| `read` | Read file contents |
| `edit` | Edit and create files |
| `search` | Search files or text in the workspace |
| `agent` | Invoke other custom agents as subagents |
| `web` | Fetch URLs and perform web searches |
| `todo` | Manage task lists |

### Common Tool Patterns

```yaml
tools: [read, search]             # Read-only research agent
tools: [read, edit, search]       # Editor without terminal access
tools: [execute, read]            # Script runner
tools: []                         # Conversational only (no file access)
```

**Omit `tools` entirely** = agent gets default tools

---

## Key Principles

### 1. **Keyword-Rich Descriptions**
The `description` field is how agents discover when to activate. Include trigger words and use cases.

❌ Bad: `"A helpful agent"`
✅ Good: `"Code reviewer that checks style and best practices. Use when reviewing code or checking quality."`

### 2. **Minimal Tools**
Only grant tools the agent needs. Fewer tools = more focused behavior.

### 3. **Single Responsibility**
Each agent should have one clear purpose. Create multiple agents rather than one Swiss-army agent.

### 4. **YAML Frontmatter Syntax**
- Always between `---` markers
- Quote descriptions with colons: `description: "Use when: doing X"`
- Use spaces, not tabs
- Ensure `name` matches folder name for skills

---

## Progressive Loading

Skills support progressive loading to manage context efficiently:

1. **Discovery** (~100 tokens): Agent reads `name` and `description` from frontmatter
2. **Instructions** (<5000 tokens): Loads `SKILL.md` body when relevant
3. **Resources**: Additional files load only when referenced in the skill

Keep file references one level deep from `SKILL.md` (e.g., `./scripts/test.js`, `./references/guide.md`).

---

## Slash Command Behavior

Skills and prompts appear as slash commands in Copilot Chat (type `/`).

| Configuration | Slash command | Auto-loaded by agent |
|---|---|---|
| Default (omitted) | ✅ Yes | ✅ Yes |
| `user-invocable: false` | ❌ No | ✅ Yes |
| `disable-model-invocation: true` | ✅ Yes | ❌ No |
| Both set to restrict | ❌ No | ❌ No |

---

## Decision Flow: Which Primitive to Use?

| Need | Use This |
|------|----------|
| Always-on project rules | **Agent instructions** (`copilot-instructions.md`) |
| Specific file patterns | **File Instructions** (`*.instructions.md`) |
| Specialized workflow with scripts/templates | **Skill** (`SKILL.md` in folder) |
| Focused agent with tool restrictions | **Custom Agent** (`*.agent.md`) |
| Single parameterized task | **Prompt** (`*.prompt.md`) |
| External API/data integration | **MCP Server** |
| Deterministic shell commands at lifecycle events | **Hooks** (`*.json`) |

---

## Anti-Patterns to Avoid

❌ **Vague descriptions** - "A helpful agent" doesn't enable discovery
❌ **Swiss-army agents** - Too many tools dilutes focus
❌ **Monolithic files** - Use references instead of massive SKILL.md files
❌ **Name mismatches** - Folder name must match skill `name` field
❌ **Missing procedures** - Descriptions without step-by-step guidance
❌ **Burning context** - `applyTo: "**"` loads for every file (use specific globs)

---

## Example: ResourceStack Testing Agent

Here's a complete example for this project:

```bash
mkdir -p .github/agents
```

Create `.github/agents/resourcestack-tester.agent.md`:

```yaml
---
description: "Test ResourceStack features. Use for running tests, debugging test failures, or verifying functionality."
tools: [read, execute, search]
---

You are a testing specialist for ResourceStack. Your job is to run tests and diagnose failures.

## Constraints
- Always run tests from `resourcestack/` directory
- Use `npm run gp:test` for one-off runs
- Use `npm run test` for watch mode
- DO NOT modify tests to make them pass

## Approach
1. Understand what's being tested
2. Run the appropriate test command
3. Analyze failures with context from the codebase
4. Suggest fixes based on test expectations

## Available Commands
- `npm run gp:test` - Run all tests once
- `npm run test` - Watch mode
- `npm run lint` - Check code style

## Output Format
Summarize test results, highlight failures, and suggest fixes with file locations.
```

---

## Resources

- [VS Code Copilot Customization Docs](https://code.visualstudio.com/docs/copilot/customization)
- [Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Agent Instructions](https://code.visualstudio.com/docs/copilot/customization/agent-instructions)

---

## Next Steps

1. Review existing [copilot-instructions.md](.github/copilot-instructions.md)
2. Create custom agents for specialized workflows
3. Build skills for repeatable tasks with bundled assets
4. Test agents using the `@` picker in Copilot Chat
