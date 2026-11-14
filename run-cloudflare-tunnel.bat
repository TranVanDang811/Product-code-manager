@echo off
title Product Code Manager - Cloudflare Tunnel (Remote Mobile Access)
echo ========================================================
echo  KHOI TAO CLOUDFLARE TUNNEL - TRUY CAP DI DONG TU XA
echo ========================================================
echo Dang ket noi Spring Boot (localhost:8080) toi Cloudflare...
echo.
"%~dp0cloudflared.exe" tunnel --url http://localhost:8080
pause

