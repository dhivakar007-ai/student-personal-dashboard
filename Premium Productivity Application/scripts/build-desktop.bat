@echo off
REM Student Personal Dashboard build script
REM Builds both backend (PyInstaller) and frontend (Vite + Electron)
REM Run from: Premium Productivity Application directory

echo   Student Personal Dashboard Build
echo.

REM Step 1: Build backend with PyInstaller
echo [1/4] Building backend with PyInstaller...
cd /d "%~dp0..\..\backend"
.\venv\Scripts\pyinstaller godhq-backend.spec --noconfirm
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    exit /b 1
)
echo Backend built successfully
echo.

REM Step 2: Build frontend with Vite
echo [2/4] Building frontend with Vite...
cd /d "%~dp0.."
set ELECTRON_BUILD=1
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    exit /b 1
)
echo Frontend built successfully
echo.

REM Step 3: Package with Electron Builder
echo [3/4] Packaging desktop application...
call npx electron-builder --win
if %errorlevel% neq 0 (
    echo ERROR: Electron packaging failed!
    exit /b 1
)
echo Desktop app packaged successfully
echo.

REM Step 4: Done
echo   BUILD COMPLETE
echo   Installer: ..\desktop-build\
