# ==============================================================================
# AegisContractGuard - Start FastAPI Backend State v1 (Baseline) [PowerShell]
# ==============================================================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "🛡️  AegisContractGuard: Starting Backend State v1 (Baseline) [Windows]" -ForegroundColor Green
Write-Host "   Endpoint: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   Docs:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

uvicorn backend.app.main_v1:app --host 127.0.0.1 --port 8000 --reload
