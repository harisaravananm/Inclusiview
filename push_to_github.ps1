# PowerShell script to push repository to GitHub
$RemoteUrl = "https://github.com/harisaravananm/Inclusiview"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Pushing folder to GitHub: $RemoteUrl" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in your PATH. Please install Git and try again."
    exit 1
}

# Resolve secret/history block
Write-Host "GitHub Push Protection blocked the push because a secret was committed in your Git history." -ForegroundColor Red
Write-Host "To fix this, we need to remove the secret from your Git history." -ForegroundColor Red
Write-Host ""
Write-Host "Please choose how you want to proceed:" -ForegroundColor Yellow
Write-Host "1) Re-initialize Git (Deletes old history and starts fresh with a clean, sanitized commit) [Recommended]" -ForegroundColor Cyan
Write-Host "2) Keep existing history (Warning: Will fail to push unless you bypass GitHub push protection)" -ForegroundColor Yellow

$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "Wiping old Git history..." -ForegroundColor Yellow
    if (Test-Path .git) {
        # Remove read-only attributes from .git folder files to allow deletion on Windows
        Get-ChildItem -Path .git -Recurse -Force | ForEach-Object { $_.IsReadOnly = $false }
        Remove-Item -Recurse -Force .git
    }
    
    Write-Host "Initializing a clean Git repository..." -ForegroundColor Yellow
    git init
    
    Write-Host "Staging files..." -ForegroundColor Yellow
    git add -A
    
    Write-Host "Creating clean initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit (sanitized)"
    
    Write-Host "Setting main branch..." -ForegroundColor Yellow
    git branch -M main
    
    Write-Host "Adding remote 'origin': $RemoteUrl" -ForegroundColor Yellow
    git remote add origin $RemoteUrl
    
    Write-Host "Force pushing clean history to GitHub..." -ForegroundColor Green
    git push -u origin main --force
}
elseif ($choice -eq "2") {
    Write-Host "Attempting standard push..." -ForegroundColor Yellow
    git push -u origin main
}
else {
    Write-Host "Invalid choice. Exiting script." -ForegroundColor Red
    exit 1
}

Write-Host "Done!" -ForegroundColor Green
