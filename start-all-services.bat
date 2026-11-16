@echo off
title Product Code Manager - Firebase Cloud Edition
echo ========================================================
echo   HE THONG QUAN LY MA HANG (PRODUCT CODE MANAGER)
echo   Phien ban Serverless: 100%% Firebase Cloud Firestore
echo   (Khong can chay Backend Spring Boot, MySQL hay Tunnel)
echo ========================================================
echo.

:: 1. Khoi dong React Web Frontend
echo [1/1] Khoi dong Web Admin Dashboard (Port 5173)...
start "PCM-Web-Admin" cmd /k "cd /d "%~dp0frontend-web" && set PATH=C:\nvm4w\nodejs;%%PATH%% && npm run dev"

echo.
echo ========================================================
echo   HE THONG DA SAN SANG:
echo   - Web Admin: http://localhost:5173
echo   - Co so du lieu: Google Cloud Firestore (Da ket noi)
echo   - Mobile App: Chay file start-mobile-app.bat (quet QR qua Expo Go)
echo   - Build APK doc lap: Chay file build-apk.bat
echo   - Thong tin dang nhap: Xem tai file .env cua ban
echo ========================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
pause
