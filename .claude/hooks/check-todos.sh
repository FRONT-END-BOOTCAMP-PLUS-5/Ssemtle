#!/bin/bash
# ABOUTME: Todo tracking reminder hook for user prompts  
# ABOUTME: Ensures Claude uses TodoWrite tool for task management

set -e

USER_PROMPT=$(echo "$1" | jq -r '.prompt // empty')

# Look for keywords that suggest multi-step tasks
TASK_KEYWORDS=(
    "implement"
    "create"
    "build"
    "add.*feature"
    "fix.*bug"
    "refactor"
    "update.*and"
    "install.*and"
    "test.*and"
    "write.*tests"
    "multiple"
    "several"
    "both"
    "also"
)

SUGGESTS_COMPLEX_TASK=false
for keyword in "${TASK_KEYWORDS[@]}"; do
    if echo "$USER_PROMPT" | grep -qi "$keyword"; then
        SUGGESTS_COMPLEX_TASK=true
        break
    fi
done

# Check for lists or numbered items
if echo "$USER_PROMPT" | grep -q -E "([0-9]+\.|•|-).*([0-9]+\.|•|-)"; then
    SUGGESTS_COMPLEX_TASK=true
fi

if [[ "$SUGGESTS_COMPLEX_TASK" == "true" ]]; then
    echo ""
    echo "📋 REMINDER: This looks like a multi-step task"
    echo "   Your CLAUDE.md requires using TodoWrite tool for task tracking"
    echo "   Consider breaking this down into specific, actionable todos"
    echo ""
fi

exit 0