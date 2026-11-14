@echo off
title Build Standalone Android APK - Product Code Manager
echo ======================================================================
echo    DONG GOI UNG DUNG DI DONG RA FILE CAI DAT ANDROID (.APK)
echo ======================================================================
echo.
echo Dang chuan bi moi truong build tren Cloud Expo...
echo.

cd /d "%~dp0mobile-app"
set PATH=C:\Users\LENOVO\AppData\Local\nvm\v22.22.1;%PATH%
set EAS_NO_VCS=1
set EAS_SKIP_AUTO_FINGERPRINT=1

npx eas-cli build -p android --profile preview

echo.
echo ======================================================================
pause
