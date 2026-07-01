# InclusiView — Deploy to Google Cloud Run
# Run this in PowerShell on your machine

# Prerequisites:
# 1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
# 2. Create a GCP project at https://console.cloud.google.com
# 3. Enable Cloud Run API + Artifact Registry API

$projectId = "YOUR_GCP_PROJECT_ID"   # ← CHANGE THIS
$region = "us-central1"
$key = "YOUR_OPENROUTER_API_KEY"  # ← YOUR OpenRouter key

Write-Host "=== Deploy InclusiView to Cloud Run ===" -ForegroundColor Cyan

# 1. Authenticate
Write-Host "[1/5] Authenticating..." -ForegroundColor Yellow
gcloud auth login
gcloud config set project $projectId

# 2. Enable required APIs
Write-Host "[2/5] Enabling APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# 3. Build and push with Cloud Build
Write-Host "[3/5] Building with Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --config cloudbuild.yaml `
  --substitutions=_OPENROUTER_API_KEY=$key,_OPENROUTER_MODEL="openai/gpt-4o-mini"

# 4. Deploy (Cloud Build already does this, but as fallback:)
Write-Host "[4/5] Deploying..." -ForegroundColor Yellow
$image = "gcr.io/$projectId/inclusiview:latest"
gcloud run deploy inclusiview --image=$image --region=$region --platform=managed `
  --allow-unauthenticated --memory=512Mi --timeout=60s --concurrency=80 `
  --min-instances=0 --max-instances=1

# 5. Get the URL
Write-Host "[5/5] Getting URL..." -ForegroundColor Yellow
$url = gcloud run services describe inclusiview --region=$region --format="value(status.url)"
Write-Host ""
Write-Host "=== DEPLOYED ===" -ForegroundColor Green
Write-Host "URL: $url" -ForegroundColor White
Write-Host ""
Write-Host "Your OpenRouter key is set. AI reports will work." -ForegroundColor Cyan

# Save URL to file
$url | Out-File -FilePath "deploy-url.txt"
Write-Host "URL saved to deploy-url.txt" -ForegroundColor Gray
