@echo off
title Khoi Phuc Du Lieu - Product Code Manager
echo ========================================================
echo   KHOI PHUC DU LIEU DATABASE (RESTORE MYSQL)
echo ========================================================
echo.
echo File sao luu gan nhat trong thu muc backups:
echo.

powershell -NoProfile -Command "Get-ChildItem '%~dp0backups\*.sql' | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { $_.FullName }" > "%TEMP%\pcm_latest_backup.txt"
set /p LATEST_FILE=<"%TEMP%\pcm_latest_backup.txt"

if "%LATEST_FILE%"=="" (
    echo [THONG BAO] Khong tim thay file .sql nao trong thu muc backups.
    pause
    exit /b
)

echo Dang khoi phuc tu file: %LATEST_FILE%
echo.
set /p CONFIRM="Ban co chac chan muon khoi phuc de de len du lieu hien tai? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Da huy thao tac.
    pause
    exit /b
)

docker exec -i pos-mysql mysql -u root -proot --default-character-set=utf8mb4 product_code_manager < "%LATEST_FILE%"

if %errorlevel% equ 0 (
    echo.
    echo [THANH CONG] Du lieu da duoc phuc hoi nguyen ven!
) else (
    echo [LOI] Khong the phuc hoi du lieu.
)

echo ========================================================
pause

