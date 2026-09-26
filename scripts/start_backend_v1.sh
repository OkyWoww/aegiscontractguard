#!/usr/bin/env bash
# ==============================================================================
# AegisContractGuard - Start FastAPI Backend State v1 (Baseline)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "======================================================================"
echo "🛡️  AegisContractGuard: Starting Backend State v1 (Baseline)"
echo "   Endpoint: http://127.0.0.1:8000"
echo "   Docs:     http://127.0.0.1:8000/docs"
echo "======================================================================"

exec uvicorn backend.app.main_v1:app --host 127.0.0.1 --port 8000 --reload
