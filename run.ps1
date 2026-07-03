# Start FastAPI backend in a new PowerShell window
Write-Host "Starting FastAPI backend on port 8080..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; .venv\Scripts\uvicorn main:app --reload --host 127.0.0.1 --port 8080"

# Start Next.js frontend in a new PowerShell window
Write-Host "Starting Next.js frontend on port 3000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nHealthcare EDI Copilot services launched successfully!" -ForegroundColor Cyan
Write-Host "- Backend running at: http://127.0.0.1:8080" -ForegroundColor Cyan
Write-Host "- Frontend running at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nYou can close the spawned PowerShell windows to stop the services." -ForegroundColor Yellow
