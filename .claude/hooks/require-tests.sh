#!/bin/bash
# ABOUTME: Test requirement enforcement hook that ensures TDD compliance
# ABOUTME: Blocks code changes unless proper tests exist or explicit authorization given

set -e

# Parse the input JSON
INPUT_JSON=$(cat)
TOOL=$(echo "$INPUT_JSON" | jq -r '.tool_name')
FILE_PATH=$(echo "$INPUT_JSON" | jq -r '.tool_input.file_path // empty')

# Skip if no file path (like pure reads)
if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Skip non-code files
if [[ ! "$FILE_PATH" =~ \.(js|ts|jsx|tsx|py|go|java|rb|php|cpp|c|h)$ ]]; then
    exit 0
fi

# Skip test files themselves
if [[ "$FILE_PATH" =~ (test|spec|__tests__|\.test\.|\.spec\.) ]]; then
    exit 0
fi

# Check if this is a new feature or bugfix by looking for certain patterns
CONTENT=""
if [[ "$TOOL" == "Edit" ]]; then
    NEW_STRING=$(echo "$INPUT_JSON" | jq -r '.tool_input.new_string // empty')
    CONTENT="$NEW_STRING"
elif [[ "$TOOL" == "Write" ]]; then
    CONTENT=$(echo "$INPUT_JSON" | jq -r '.tool_input.content // empty')
elif [[ "$TOOL" == "MultiEdit" ]]; then
    CONTENT=$(echo "$INPUT_JSON" | jq -r '.tool_input.edits[]?.new_string // empty' | tr '\n' ' ')
fi

# Look for signs this is adding functionality (not just refactoring)
if [[ "$CONTENT" =~ (function|def|class|export|const.*=|let.*=|var.*=) ]]; then
    # Check if authorization was given
    if grep -q "I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME" CLAUDE.md 2>/dev/null; then
        echo "✅ Test requirement waived by explicit authorization"
        exit 0
    fi
    
    # Look for corresponding test files
    BASE_NAME=$(basename "$FILE_PATH" | sed 's/\.[^.]*$//')
    DIR_NAME=$(dirname "$FILE_PATH")
    
    TEST_PATTERNS=(
        "${DIR_NAME}/${BASE_NAME}.test.*"
        "${DIR_NAME}/${BASE_NAME}.spec.*"
        "${DIR_NAME}/__tests__/${BASE_NAME}.*"
        "${DIR_NAME}/**/*.test.*"
        "test/**/*${BASE_NAME}*"
        "tests/**/*${BASE_NAME}*"
        "spec/**/*${BASE_NAME}*"
    )
    
    TESTS_FOUND=false
    for pattern in "${TEST_PATTERNS[@]}"; do
        if ls $pattern 2>/dev/null | grep -q .; then
            TESTS_FOUND=true
            break
        fi
    done
    
    if [[ "$TESTS_FOUND" == "false" ]]; then
        echo "❌ ERROR: Code changes require tests" >&2
        echo "Rule violation: Your CLAUDE.md requires TDD - write failing tests first" >&2
        echo "Detected new functionality in: $FILE_PATH" >&2
        echo "Required: Create tests before implementing features" >&2
        echo "Exception: Add 'I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME' to CLAUDE.md" >&2
        exit 2
    fi
fi

echo "✅ Test requirement check passed"
exit 0