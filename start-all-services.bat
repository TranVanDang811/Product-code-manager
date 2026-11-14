@echo off
title Product Code Manager - All Services Starter
echo ========================================================
echo   HE THONG QUAN LY MA HANG (PRODUCT CODE MANAGER)
echo   Khoi dong toan bo he thong gom Backend, Web & Mobile
echo ========================================================
echo.

:: 1. Kiem tra MySQL
echo [1/4] Kiem tra MySQL Database container...
docker ps -a --format "{{.Names}}" | findstr /i "pos-mysql" >nul
if errorlevel 1 (
    echo Dang khoi dong container MySQL pos-mysql...
    docker start pos-mysql
) else (
    docker ps --format "{{.Names}}" | findstr /i "pos-mysql" >nul
    if errorlevel 1 (
        docker start pos-mysql
    )
)
echo MySQL da san sang tren cong 3306.

:: 2. Khoi dong Spring Boot Backend
echo.
echo [2/4] Khoi dong Spring Boot Backend (Port 8080)...
start "PCM-Backend-8080" cmd /k "cd /d "%~dp0backend" && set JAVA_HOME=C:\Program Files\Java\jdk-21 && set PATH=C:\Program Files\Java\jdk-21\bin;%PATH% && java -jar target/product-code-manager-1.0.0.jar --spring.profiles.active=dev"

:: 3. Khoi dong Cloudflare Tunnel (Cho phep dien thoai truy cap tu xa bat ky mang 4G/WiFi nao)
echo.
echo [3/4] Khoi dong Cloudflare Tunnel (Truy cap di dong tu xa)...
start "PCM-Cloudflare-Tunnel" cmd /k "cd /d "%~dp0" && "%~dp0cloudflared.exe" tunnel --url http://localhost:8080"

:: 4. Khoi dong React Web Frontend
echo.
echo [4/4] Khoi dong React Web Frontend (Port 5173)...
start "PCM-Web-Frontend" cmd /k "cd /d "%~dp0frontend-web" && npm run dev"

echo.
echo ========================================================
echo   TAT CA CAC DICH VU DA DUOC KHOI DONG THANH CONG!
echo   - Web Admin: http://localhost:5173
echo   - Backend API: http://localhost:8080/api/v1
echo   - Swagger Docs: http://localhost:8080/swagger-ui.html
echo   - Cloudflare Tunnel: Xem cua so PCM-Cloudflare-Tunnel
echo ========================================================
echo.
pause

