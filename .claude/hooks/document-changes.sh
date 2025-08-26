#!/bin/bash
# ABOUTME: Documentation hook that suggests journaling important changes
# ABOUTME: Helps maintain memory of architectural decisions and patterns

set -e

# Parse the input JSON
INPUT_JSON="$1"
FILE_PATH=$(echo "$INPUT_JSON" | jq -r '.file_path // empty')
TOOL=$(echo "$INPUT_JSON" | jq -r '.tool')

# Skip if no file path
if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Only process code files
if [[ ! "$FILE_PATH" =~ \.(js|ts|jsx|tsx|py|go|java|rb|php|cpp|c|h)$ ]]; then
    exit 0
fi

# Skip test files
if [[ "$FILE_PATH" =~ (test|spec|__tests__|\.test\.|\.spec\.) ]]; then
    exit 0
fi

# Check if this might be an architectural change
CONTENT=""
if [[ "$TOOL" == "Edit" ]]; then
    NEW_STRING=$(echo "$INPUT_JSON" | jq -r '.new_string // empty')
    CONTENT="$NEW_STRING"
elif [[ "$TOOL" == "Write" ]]; then
    CONTENT=$(echo "$INPUT_JSON" | jq -r '.content // empty')
fi

# Look for patterns that suggest architectural significance
SIGNIFICANT_PATTERNS=(
    "class.*extends"
    "interface.*\{"
    "export.*class"
    "export.*interface"
    "export.*function"
    "import.*from"
    "createContext"
    "useState"
    "useEffect"
    "async.*function"
    "Promise<"
    "API"
    "Config"
    "Schema"
)

IS_SIGNIFICANT=false
for pattern in "${SIGNIFICANT_PATTERNS[@]}"; do
    if echo "$CONTENT" | grep -q "$pattern"; then
        IS_SIGNIFICANT=true
        break
    fi
done

if [[ "$IS_SIGNIFICANT" == "true" ]]; then
    echo "📝 Consider documenting this change in your journal:"
    echo "   File: $FILE_PATH"
    echo "   This appears to be an architectural change that might be worth remembering"
    echo "   Your CLAUDE.md emphasizes using the journal for important insights"
fi

exit 0