#!/bin/bash
# ABOUTME: Compact slash command hook that provides context injection
# ABOUTME: Enhances /compact with conversation focus and learning reminders

set -e

USER_PROMPT=$(jq -r '.prompt // empty')

# Check if this is a /compact command
if [[ "$USER_PROMPT" =~ ^/compact ]]; then
    COMPACT_CONTEXT=$(cat << 'EOF'

📋 COMPACT MODE ACTIVATED
Per your CLAUDE.md instructions:
• Focus on recent conversation and significant learnings
• Aggressively summarize older tasks if multiple were tackled
• Leave more context for recent work
• Focus on what needs to be done next

Remember: Search your journal for relevant past experiences and learned lessons.

EOF
)
    echo "$COMPACT_CONTEXT"
fi

exit 0