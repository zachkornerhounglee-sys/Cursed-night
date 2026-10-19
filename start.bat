@echo off
title Cursed Night co-op server
where node >nul 2>nul || (echo Node.js is required: https://nodejs.org & pause & exit /b 1)
start "" http://localhost:3000
node server.js
pause
