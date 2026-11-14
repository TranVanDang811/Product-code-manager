@echo off
title Sao Luu Du Lieu - Product Code Manager
echo ========================================================
echo   SAO LUU DU LIEU SAN PHAM VA MA VACH (BACKUP MYSQL)
echo ========================================================
echo.

if not exist "%~dp0backups" mkdir "%~dp0backups"

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set TIMESTAMP=%%i
set BACKUP_FILE=%~dp0backups\pcm_backup_%TIMESTAMP%.sql

echo Dang xuat du lieu tu database MySQL sang file:
echo %BACKUP_FILE%
echo.

docker exec pos-mysql mysqldump -u root -proot --default-character-set=utf8mb4 product_code_manager > "%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo [THANH CONG] Du lieu da duoc sao luu an toan vao file!
    echo Vi tri file: %BACKUP_FILE%
) else (
    echo [LOI] Khong the sao luu du lieu. Vui long kiem tra container pos-mysql.
)

echo.
echo ========================================================
pause
