@echo off
cd /d "%~dp0"
title Cursed Night
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found - opening SOLO mode.
  echo For co-op multiplayer install Node.js from https://nodejs.org and run this again.
  start "" "%~dp0index.html"
  pause
  exit /b
)
echo Starting Cursed Night... keep this window open while you play.
start "" http://localhost:3000
node server.js
pause
