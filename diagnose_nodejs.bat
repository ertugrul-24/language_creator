@echo off
REM LinguaFabric - Node.js Installation/Verification Script
REM This script helps diagnose and fix Node.js issues

echo.
echo ===================================================
echo   LinguaFabric - Node.js Diagnostic Tool
echo ===================================================
echo.

REM Check if node is in PATH
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js found in PATH
    node --version
    npm --version
    echo.
    echo Your Node.js is already working!
    goto end
)

echo [ERROR] Node.js not found in system PATH
echo.
echo Possible causes:
echo   1. Node.js is not installed
echo   2. Node.js installation is corrupted
echo   3. System needs restart after installation
echo.
echo Solutions:
echo   1. Open PowerShell as Administrator
echo   2. Run: winget install OpenJS.NodeJS
echo   3. Or download from: https://nodejs.org (LTS version)
echo   4. Restart your terminal completely
echo.

pause

:end
echo.
