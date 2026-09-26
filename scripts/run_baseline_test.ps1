# ==============================================================================
# AegisContractGuard - Run Client Baseline Test Suite [PowerShell]
# Waits for FastAPI server at http://127.0.0.1:8000/docs then executes Vitest.
# ==============================================================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$ClientDir = Join-Path $RootDir "client"
Set-Location $ClientDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "🧪 AegisContractGuard: Running Client Baseline Tests [Windows]" -ForegroundColor Green
Write-Host "   Waiting for FastAPI backend readiness at http://127.0.0.1:8000/docs..." -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

npm run test:baseline
