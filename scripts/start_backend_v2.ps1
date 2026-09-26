# ==============================================================================
# AegisContractGuard - Start FastAPI Backend State v2 (Breaking Changes) [PowerShell]
# ==============================================================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
Set-Location $RootDir

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "⚠️  AegisContractGuard: Starting Backend State v2 (Drift) [Windows]" -ForegroundColor Yellow
Write-Host "   Endpoint: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   Docs:     http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "   Drift 1:  'id' (int) -> 'account_id' (str)" -ForegroundColor Yellow
Write-Host "   Drift 2:  Mandatory header 'x-api-version: 2.0'" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan

uvicorn backend.app.main_v2:app --host 127.0.0.1 --port 8000 --reload
