#!/usr/bin/env bash
# domino-memory-guard: refuses to start a new agent session on this computer when the memory in
# use, plus the new session's estimate, would pass the limit. Why: several Claude sessions started
# at once once froze a 24 GB laptop, and the restart lost every running session's work.
#
# A Claude Code PreToolUse hook; install it with README -> "Optional: the memory guard".
# It checks:
#   mcp__ccd_session__start_session   Claude Desktop linked sessions, started on this computer
#   Agent / Task                      subagents, only the domino-builder and domino-designer roles
# It lets through, unchecked:
#   start_session with target "cloud" or "ssh", or an "offer" / "own_initiative" proposal
#   (nothing starts yet); every other tool and subagent.
# Numbers: the "Memory guard" block of $CLAUDE_PROJECT_DIR/docs/agents/domino-agents.md
#   (limit_percent, builder_gb, designer_gb, other_gb); defaults 90, 3.0, 2.0, 1.5.
# Free memory: macOS `memory_pressure`; Linux MemAvailable in /proc/meminfo.
# It also counts the estimate of every start it allowed in the last 2 minutes, which may not show
# in memory yet.
# Test switches: DOMINO_MEMORY_GUARD_TEST_FREE=<percent> in the environment, or a file at
# ~/.claude/hooks/.domino-memory-guard-test (free memory then reads as 5%).
# Log: ~/.claude/hooks/domino-memory-guard.log (DOMINO_MEMORY_GUARD_LOG overrides it).
# Needs: bash, awk, jq.

LOG="${DOMINO_MEMORY_GUARD_LOG:-$HOME/.claude/hooks/domino-memory-guard.log}"
input=$(cat)

if ! command -v jq >/dev/null 2>&1; then
  case "$input" in
    *start_session*|*domino-builder*|*domino-designer*)
      echo "Domino memory guard: jq is not installed, so it cannot read this call and no session starts. Install jq (brew install jq, apt install jq), or remove the hook." >&2
      exit 2 ;;
  esac
  exit 0
fi

tool=$(jq -r '.tool_name // ""' <<<"$input")
target=$(jq -r '.tool_input.target // "local"' <<<"$input")
initiation=$(jq -r '.tool_input.initiation // ""' <<<"$input")
proposal=$(jq -r '.tool_input.proposal_id // ""' <<<"$input")
prompt=$(jq -r '.tool_input.prompt // ""' <<<"$input")
agent=$(jq -r '.tool_input.subagent_type // ""' <<<"$input")
title=$(jq -r '.tool_input.title // .tool_input.description // .tool_input.proposal_id // "?"' <<<"$input")
cwd=$(jq -r '.cwd // ""' <<<"$input")

case "$tool" in
  *start_session)
    case "$target" in cloud|ssh) exit 0 ;; esac
    if [ -z "$proposal" ] && { [ "$initiation" = "offer" ] || [ "$initiation" = "own_initiative" ]; }; then
      exit 0
    fi
    role_text="$prompt" ;;
  Agent|Task)
    case "$agent" in *domino-builder*|*domino-designer*) ;; *) exit 0 ;; esac
    role_text="$agent" ;;
  *) exit 0 ;;
esac

config="${CLAUDE_PROJECT_DIR:-$cwd}/docs/agents/domino-agents.md"
setting() {
  local value=""
  [ -f "$config" ] && value=$(sed -nE "s/^[[:space:]]*$1:[[:space:]]*([0-9]+(\.[0-9]+)?).*/\1/p" "$config" | head -1)
  echo "${value:-$2}"
}
limit=$(setting limit_percent 90); limit=${limit%.*}

case "$role_text" in
  *domino-builder*) cost_gb=$(setting builder_gb 3.0) ;;
  *domino-designer*) cost_gb=$(setting designer_gb 2.0) ;;
  *) cost_gb=$(setting other_gb 1.5) ;;
esac

free=""
case "$(uname -s)" in
  Darwin)
    free=$(memory_pressure 2>/dev/null | awk -F': ' '/free percentage/ {gsub("%", "", $2); print $2}')
    total_gb=$(sysctl -n hw.memsize 2>/dev/null | awk '{printf "%.1f", $1 / 1073741824}') ;;
  Linux)
    free=$(awk '/^MemTotal:/ {t = $2} /^MemAvailable:/ {a = $2} END {if (t > 0) printf "%d", a * 100 / t}' /proc/meminfo 2>/dev/null)
    total_gb=$(awk '/^MemTotal:/ {printf "%.1f", $2 / 1048576}' /proc/meminfo 2>/dev/null) ;;
esac
if [ -n "${DOMINO_MEMORY_GUARD_TEST_FREE:-}" ]; then
  free=$DOMINO_MEMORY_GUARD_TEST_FREE
elif [ -f "$HOME/.claude/hooks/.domino-memory-guard-test" ]; then
  free=5
fi

if [ -z "$free" ] || [ -z "${total_gb:-}" ]; then
  echo "$(date '+%F %T') BLOCK (memory unreadable) $title" >> "$LOG"
  echo "Domino memory guard: could not read free memory on $(uname -s) (it supports macOS and Linux), so no session starts. Check memory by hand, or remove the hook." >&2
  exit 2
fi

used=$((100 - free))
now=$(date +%s)
pending_gb=$(awk -v now="$now" '$3 == "ALLOW" && $4 ~ /^epoch=/ { e = substr($4, 7) + 0; if (now - e < 120) { c = $5; gsub(/[+GB]/, "", c); s += c } } END { printf "%.1f", s + 0 }' "$LOG" 2>/dev/null || echo 0)
after=$(awk -v u="$used" -v c="$cost_gb" -v p="$pending_gb" -v t="$total_gb" 'BEGIN {printf "%d", u + ((c + p) / t) * 100 + 0.5}')

if [ "$after" -gt "$limit" ]; then
  echo "$(date '+%F %T') BLOCK epoch=$now +${cost_gb}GB used=${used}% pending=${pending_gb}GB -> ${after}% $title" >> "$LOG"
  echo "Domino memory guard: memory is ${used}% used, plus ${pending_gb} GB for sessions started in the last 2 minutes. A new session (about ${cost_gb} GB of ${total_gb} GB) would take it to about ${after}%, over the ${limit}% limit. Wait until a session finishes and archive it, then try again." >&2
  exit 2
fi

echo "$(date '+%F %T') ALLOW epoch=$now +${cost_gb}GB used=${used}% pending=${pending_gb}GB -> ${after}% $title" >> "$LOG"
exit 0
