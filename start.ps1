# InclusiView — Start PostgreSQL + Backend + Frontend
# Run this from PowerShell (right-click → "Run with PowerShell")

$pgDir = "C:\Program Files\PostgreSQL\18"
$dataDir = "$env:LOCALAPPDATA\postgresql\data"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== InclusiView Launcher ===" -ForegroundColor Cyan

# 1. Start PostgreSQL if not running
$pgRunning = & "$pgDir\bin\pg_isready.exe" -U postgres -t 2 2>$null
if ($pgRunning -match "accepting") {
    Write-Host "[OK] PostgreSQL already running" -ForegroundColor Green
} else {
    Write-Host "[..] Starting PostgreSQL..." -ForegroundColor Yellow
    & "$pgDir\bin\pg_ctl.exe" start -D "$dataDir" -l "$dataDir\pg.log" -w -t 10
    if ($?) {
        Write-Host "[OK] PostgreSQL started" -ForegroundColor Green
    } else {
        Write-Host "[!!] Failed to start PostgreSQL" -ForegroundColor Red
        exit 1
    }
}

# 2. Create database if missing
& "$pgDir\bin\createdb.exe" -U postgres inclusiview 2>$null
Write-Host "[OK] Database 'inclusiview' ready" -ForegroundColor Green

# 3. Install Python deps
Write-Host "[..] Installing Python packages..." -ForegroundColor Yellow
pip install -r "$root\backend\requirements.txt" -q
Write-Host "[OK] Python packages installed" -ForegroundColor Green

# 4. Start Backend
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/inclusiview"
$env:OPENROUTER_API_KEY = (Get-Content "$root\.env" | Where-Object { $_ -match 'OPENROUTER_API_KEY=' } | ForEach-Object { $_ -replace '.*=', '' }).Trim()
Write-Host "[OK] Starting backend on :8000 ..." -ForegroundColor Yellow
$backend = Start-Process -NoNewWindow -PassThru -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "$root\backend"
Start-Sleep 4

# 5. Start Frontend
Write-Host "[OK] Starting frontend on :5173 ..." -ForegroundColor Yellow
$frontend = Start-Process -NoNewWindow -PassThru -FilePath "npx" -ArgumentList "vite --host 0.0.0.0 --port 5173" -WorkingDirectory "$root\frontend"
Start-Sleep 3

Write-Host "" -ForegroundColor Cyan
Write-Host "=== ALL SERVICES RUNNING ===" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Database : postgresql://postgres@localhost:5432/inclusiview" -ForegroundColor White
Write-Host "" -ForegroundColor Cyan
Write-Host "Press any key to stop all services..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
& "$pgDir\bin\pg_ctl.exe" stop -D "$dataDir" -m smart 2>$null
$backend.Kill() 2>$null
$frontend.Kill() 2>$null
Write-Host "Services stopped." -ForegroundColor Yellow
