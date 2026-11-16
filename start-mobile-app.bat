@echo off
title Product Code Manager - Mobile App (Expo)
echo ========================================================
echo   KHOI DONG UNG DUNG DI DONG (MOBILE APP - EXPO)
echo   Ket noi truc tiep Firebase Cloud (Khong can Backend)
echo ========================================================
echo.

cd /d "%~dp0mobile-app"
set PATH=C:\nvm4w\nodejs;%PATH%

echo Dang khoi dong Expo Server...
echo Quet ma QR tren man hinh bang app Expo Go tren dien thoai de su dung.
echo.
npx expo start -c
pause
