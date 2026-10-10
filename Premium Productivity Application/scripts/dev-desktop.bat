@echo off
REM ─── Student Personal Dashboard — Development Mode ─────────
REM Starts the Electron window; Electron manages Vite and the backend
REM Run from: Premium Productivity Application directory

echo ═══════════════════════════════════════════════════════════
echo Student Personal Dashboard — Desktop Dev Mode
echo ═══════════════════════════════════════════════════════════
echo.

cd /d "%~dp0.."
call npm run electron:dev
