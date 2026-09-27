#!/bin/bash
# ABOUTME: Self-check for the Claude Code hooks in this directory
# ABOUTME: Feeds each hook the JSON Claude Code sends on stdin and asserts exit code and output

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRATCH="$(mktemp -d)"
trap 'rm -rf "$SCRATCH"' EXIT
FAILURES=0

# run_hook <hook> <cwd> <json> -> sets EXIT_CODE, OUT (stdout+stderr)
run_hook() {
    OUT=$(cd "$2" && printf '%s' "$3" | "$HOOKS_DIR/$1.sh" 2>&1)
    EXIT_CODE=$?
}

# expect <name> <expected exit> [substring expected in output]
expect() {
    if [[ "$EXIT_CODE" != "$2" ]]; then
        echo "FAIL $1: exit $EXIT_CODE, expected $2 (output: $OUT)"
        FAILURES=$((FAILURES + 1))
    elif [[ -n "$3" && "$OUT" != *"$3"* ]]; then
        echo "FAIL $1: output missing '$3' (output: $OUT)"
        FAILURES=$((FAILURES + 1))
    else
        echo "ok   $1"
    fi
}

for script in "$HOOKS_DIR"/*.sh; do
    if bash -n "$script" 2>/dev/null; then
        echo "ok   syntax $(basename "$script")"
    else
        echo "FAIL syntax $(basename "$script"): $(bash -n "$script" 2>&1)"
        FAILURES=$((FAILURES + 1))
    fi
done

# A repo on main with no test files, so branch and test checks have something to enforce
MAIN_REPO="$SCRATCH/main-repo"
git init -q -b main "$MAIN_REPO"
git -C "$MAIN_REPO" -c user.name=test -c user.email=test@example.com commit -q --allow-empty -m init

LONG_PROMPT="please implement the new feature and also fix both of the failing things"

run_hook inject-rules "$MAIN_REPO" "{\"hook_event_name\":\"UserPromptSubmit\",\"prompt\":\"$LONG_PROMPT\"}"
expect "inject-rules prints rules for long prompt" 0 "CRITICAL REMINDERS"

run_hook inject-rules "$MAIN_REPO" '{"hook_event_name":"UserPromptSubmit","prompt":"hi"}'
expect "inject-rules silent for short prompt" 0
[[ -z "$OUT" ]] || { echo "FAIL inject-rules short prompt printed: $OUT"; FAILURES=$((FAILURES + 1)); }

run_hook check-todos "$MAIN_REPO" "{\"hook_event_name\":\"UserPromptSubmit\",\"prompt\":\"$LONG_PROMPT\"}"
expect "check-todos reminds on multi-step prompt" 0 "multi-step task"

run_hook handle-compact "$MAIN_REPO" '{"hook_event_name":"UserPromptSubmit","prompt":"/compact"}'
expect "handle-compact prints context on /compact" 0 "COMPACT MODE ACTIVATED"

run_hook check-branch "$MAIN_REPO" '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"git commit -m x"}}'
expect "check-branch blocks commit on main" 2 "Cannot commit or push"

run_hook check-branch "$MAIN_REPO" '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"git status"}}'
expect "check-branch allows other commands on main" 0

run_hook require-tests "$MAIN_REPO" "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$MAIN_REPO/feature.ts\",\"old_string\":\"a\",\"new_string\":\"const x = 1\"}}"
expect "require-tests blocks untested code edit" 2 "Code changes require tests"

run_hook require-tests "$MAIN_REPO" "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$MAIN_REPO/README.md\",\"old_string\":\"a\",\"new_string\":\"const x = 1\"}}"
expect "require-tests ignores non-code files" 0

touch "$MAIN_REPO/feature.test.ts"
run_hook require-tests "$MAIN_REPO" "{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"$MAIN_REPO/feature.ts\",\"content\":\"const x = 1\"}}"
expect "require-tests allows code edit with a test file" 0

run_hook document-changes "$MAIN_REPO" "{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$MAIN_REPO/feature.ts\",\"new_string\":\"export function x() {}\"}}"
expect "document-changes suggests journaling" 0 "Consider documenting"

run_hook auto-lint "$MAIN_REPO" "{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"Edit\",\"tool_input\":{\"file_path\":\"$MAIN_REPO/feature.ts\"}}"
expect "auto-lint runs on code file" 0 "No package.json found"

if [[ "$FAILURES" -gt 0 ]]; then
    echo "$FAILURES failure(s)"
    exit 1
fi
echo "all hook checks passed"
