#!/usr/bin/env bash
set -euo pipefail

# Launches the Week 3 Triangle API from the Week 4 folder.
# Optional env vars:
#   PYTHON_BIN=<python command>   (default: python3, fallback: python, then py -3)
#   INSTALL_DEPS=1                (installs requirements before start)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEEK3_DIR="$(cd "$SCRIPT_DIR/../Week3" && pwd)"

if [[ ! -f "$WEEK3_DIR/triangle_api.py" ]]; then
  echo "Error: Could not find triangle_api.py in $WEEK3_DIR" >&2
  exit 1
fi

cd "$WEEK3_DIR"

PYTHON_BIN="${PYTHON_BIN:-python3}"
PYTHON_ARGS=()

# On Windows Git Bash, prefer the project virtualenv interpreter directly.
if [[ "${PYTHON_BIN}" == "python3" ]] && [[ -x "$WEEK3_DIR/.venv/Scripts/python.exe" ]]; then
  PYTHON_BIN="$WEEK3_DIR/.venv/Scripts/python.exe"
fi

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  if command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
  elif command -v py >/dev/null 2>&1; then
    PYTHON_BIN="py"
    PYTHON_ARGS=(-3)
  else
    echo "Error: Python not found. Install Python or set PYTHON_BIN." >&2
    exit 1
  fi
fi

# Activate common virtualenv locations if present.
if [[ -d ".venv/bin" ]]; then
  # shellcheck disable=SC1091
  source ".venv/bin/activate"
elif [[ -d "venv/bin" ]]; then
  # shellcheck disable=SC1091
  source "venv/bin/activate"
fi

if [[ "${INSTALL_DEPS:-0}" == "1" ]]; then
  "$PYTHON_BIN" "${PYTHON_ARGS[@]}" -m pip install -r requirements.txt
fi

echo "Starting Week3 Triangle API from: $WEEK3_DIR"
echo "Using: $PYTHON_BIN ${PYTHON_ARGS[*]} triangle_api.py"
exec "$PYTHON_BIN" "${PYTHON_ARGS[@]}" triangle_api.py
