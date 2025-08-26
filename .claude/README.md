# Claude Code Hooks for Mollu

This directory contains Claude Code hooks that enforce the rules and workflows defined in `CLAUDE.md`.

## Setup

1. Copy the hooks configuration from `hooks-config-example.json` into your `~/.claude/settings.json` file
2. All hook scripts are already executable and ready to use

## Hook Scripts

### High Priority (Block execution)

- **`check-branch.sh`** - Prevents commits/pushes to main branch, enforces WIP branch workflow
- **`require-tests.sh`** - Ensures TDD compliance by requiring tests before code changes

### Medium Priority (Informational)

- **`auto-lint.sh`** - Runs linting after code changes
- **`document-changes.sh`** - Suggests journaling for architectural changes
- **`inject-rules.sh`** - Injects CLAUDE.md rule reminders into user prompts
- **`check-todos.sh`** - Reminds about using TodoWrite for complex tasks

## Customization

Each hook script can be modified to match your specific project needs. The scripts are designed to:

- Follow the defensive security approach
- Be non-intrusive for simple tasks
- Provide clear error messages with suggested actions
- Reference your CLAUDE.md rules directly

## Testing Hooks

You can test individual hooks by running them with sample JSON input:

```bash
echo '{"tool": "Bash", "command": "git commit -m test"}' | ./.claude/hooks/check-branch.sh
```
