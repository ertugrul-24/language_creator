@echo off
REM LinguaFabric - Dependency Installation Script for Windows

echo.
echo 🚀 Installing LinguaFabric dependencies...
echo.

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install Node.js from https://nodejs.org/
    echo    Then run this script again.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

echo ✅ npm version:
npm --version

echo.
echo 📦 Installing npm packages...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed. Check your internet connection.
    pause
    exit /b 1
)

echo.
echo 📦 Installing Supabase client...
call npm install @supabase/supabase-js

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 📝 Next steps:
echo    1. npm run dev
echo    2. Open http://localhost:5173 in your browser
echo.
echo 🔐 Verify .env.local is configured with your Supabase credentials
echo    Check: https://supabase.com ^-> Your Project ^-> Settings ^-> API
echo.
pause
