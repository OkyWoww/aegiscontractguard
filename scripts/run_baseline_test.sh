#!/usr/bin/env bash
# ==============================================================================
# AegisContractGuard - Run Client Baseline Test Suite
# Waits for FastAPI server at http://127.0.0.1:8000/docs then executes Vitest.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}/client"

echo "======================================================================"
echo "🧪 AegisContractGuard: Running Client Baseline Tests"
echo "   Waiting for FastAPI backend readiness at http://127.0.0.1:8000/docs..."
echo "======================================================================"

npm run test:baseline
