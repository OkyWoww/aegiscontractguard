#!/usr/bin/env bash
# ==============================================================================
# AegisContractGuard - Start FastAPI Backend State v2 (Breaking Changes)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "======================================================================"
echo "⚠️  AegisContractGuard: Starting Backend State v2 (Breaking Changes Drift)"
echo "   Endpoint: http://127.0.0.1:8000"
echo "   Docs:     http://127.0.0.1:8000/docs"
echo "   Drift 1:  'id' (int) -> 'account_id' (str)"
echo "   Drift 2:  Mandatory header 'x-api-version: 2.0'"
echo "======================================================================"

exec uvicorn backend.app.main_v2:app --host 127.0.0.1 --port 8000 --reload
