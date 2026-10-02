@echo off
setlocal
title Unramble

echo == Unramble ==
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [x] Node.js is not installed. Get it from https://nodejs.org , then run this again.
  pause
  exit /b 1
)

where ollama >nul 2>nul
if errorlevel 1 (
  echo [x] Ollama is not installed. Get it from https://ollama.com/download , then run this again.
  pause
  exit /b 1
)

ollama list 2>nul | findstr /b /c:"gemma3:4b" >nul
if errorlevel 1 (
  echo [ ] Pulling gemma3:4b, about 3.3 GB, one time...
  ollama pull gemma3:4b
  if errorlevel 1 (
    echo [x] The model download failed. Check your connection and run this again.
    pause
    exit /b 1
  )
)

if not exist "node_modules" (
  echo [ ] Installing dependencies, one time...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [x] npm install failed. See the message above.
    pause
    exit /b 1
  )
)

if not exist ".next\BUILD_ID" (
  echo [ ] Building the app, one time...
  call npm run build
  if errorlevel 1 (
    echo [x] The build failed. See the message above.
    pause
    exit /b 1
  )
)

echo [ok] Starting Unramble on http://localhost:3000
echo      Keep this window open. Close it to stop the app.
start "" http://localhost:3000
call npm start
