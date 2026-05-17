#!/usr/bin/env bash
set -euo pipefail

SKILL="${1:-}"

if [ -z "$SKILL" ]; then
  echo "Usage: ./scripts/run-eval.sh <skill-name>"
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EVAL_DIR="$ROOT/evals/$SKILL"
SKILL_FILE="$ROOT/skills/$SKILL/SKILL.md"

if [ ! -d "$EVAL_DIR" ]; then
  echo "Eval directory not found: $EVAL_DIR"
  exit 1
fi

if [ ! -f "$SKILL_FILE" ]; then
  echo "Skill file not found: $SKILL_FILE"
  exit 1
fi

if [ ! -f "$EVAL_DIR/prompts.jsonl" ]; then
  echo "Missing prompts.jsonl"
  exit 1
fi

PROMPT_COUNT="$(wc -l < "$EVAL_DIR/prompts.jsonl" | tr -d ' ')"

echo "Running eval metadata checks for $SKILL"
echo "Prompts: $PROMPT_COUNT"

if [ "$PROMPT_COUNT" -lt 20 ]; then
  echo "Expected at least 20 prompts"
  exit 1
fi

if [ ! -d "$EVAL_DIR/golden-outputs" ]; then
  echo "Missing golden-outputs/"
  exit 1
fi

GOLDEN_COUNT="$(find "$EVAL_DIR/golden-outputs" -type f -name '*.md' | wc -l | tr -d ' ')"

if [ "$GOLDEN_COUNT" -lt 5 ]; then
  echo "Expected at least 5 golden outputs (found $GOLDEN_COUNT)"
  exit 1
fi

if [ ! -f "$EVAL_DIR/baselines/v2-baseline.json" ]; then
  echo "Missing baselines/v2-baseline.json"
  exit 1
fi

if [ ! -f "$EVAL_DIR/failure-modes.md" ]; then
  echo "Missing failure-modes.md"
  exit 1
fi

if [ -f "$EVAL_DIR/graders/deterministic.py" ]; then
  echo "Deterministic grader found"
else
  echo "Missing graders/deterministic.py"
  exit 1
fi

echo "Eval metadata ok for $SKILL"
