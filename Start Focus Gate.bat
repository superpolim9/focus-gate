@echo off
setlocal
cd /d "%~dp0"

echo [Focus Gate] Checking workspace server...

:: Check if port 8899 is already listening
powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 8899 -ErrorAction SilentlyContinue) | Measure-Object | Select-Object -ExpandProperty Count" > "%temp%\fg_port.txt" 2>nul
set /p PORT_ACTIVE=<"%temp%\fg_port.txt"
del "%temp%\fg_port.txt" 2>nul

if "%PORT_ACTIVE%"=="1" goto OPEN_BROWSER
if "%PORT_ACTIVE%"=="2" goto OPEN_BROWSER

echo [Focus Gate] Starting local workspace server...

:: Try Node.js first
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "FocusGateServer" /min node server.js
    goto WAIT_AND_OPEN
)

:: Try Python fallback
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "FocusGateServer" /min python server.py
    goto WAIT_AND_OPEN
)

:WAIT_AND_OPEN
ping 127.0.0.1 -n 2 >nul

:OPEN_BROWSER
echo [Focus Gate] Launching Focus Gate in your browser...
start "" "http://localhost:8899/"
exit
