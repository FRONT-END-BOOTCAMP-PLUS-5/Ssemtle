#!/bin/bash
# ABOUTME: Rule reminder injection hook for user prompts
# ABOUTME: Adds context about CLAUDE.md rules to ensure compliance

set -e

# Key rules from CLAUDE.md to inject as reminders
RULES_REMINDER=$(cat << 'EOF'

🔴 CRITICAL REMINDERS FROM YOUR CLAUDE.MD:
• Rule #1: Get explicit permission before breaking ANY rule
• NEVER make code changes unrelated to current task
• NEVER throw away implementations without permission  
• ALWAYS use TodoWrite tool to track tasks
• TDD required: Write failing tests FIRST, then implement
• NO EXCEPTIONS: All projects need unit, integration, AND e2e tests
• Create WIP branches - never commit directly to main
• Handle uncommitted changes before starting new work
• SMALLEST reasonable changes only
• Address me as "Ori" - we're colleagues
• Push back on bad ideas with technical reasons
• Document insights in journal before forgetting them

EOF
)

# Only inject on complex prompts (longer than 50 chars) to avoid spam
USER_PROMPT=$(echo "$1" | jq -r '.prompt // empty')
if [[ ${#USER_PROMPT} -gt 50 ]]; then
    echo "$RULES_REMINDER"
fi

exit 0