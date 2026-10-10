@echo off
REM ─── Student Personal Dashboard — Launch Production Build ──
REM Runs the built Electron app directly (unpacked, for testing)
echo Launching Student Personal Dashboard...
cd /d "%~dp0..\..\desktop-build\win-unpacked"
start "" "Student Personal Dashboard.exe"
