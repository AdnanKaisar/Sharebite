@echo off
title Launching ShareBite Portal...
echo =======================================================================
echo                     STARTING SHAREBITE SERVERS
echo =======================================================================
echo.
cd /d "c:\Users\HP\OneDrive\Documents\Python\python1\Portfolio\Portfolio\Personal-Finance-Tracker\foodbridge"

:: Launch Vite and Node servers in a background window
start /min cmd /k "npm run dev"

echo Servers initializing in the background...
echo Please wait 5 seconds...
timeout /t 5 /nobreak >nul

echo.
echo Opening browser to http://localhost:5173/
start http://localhost:5173/

echo.
echo =======================================================================
echo ShareBite is running. Minimize the command windows to keep it active.
echo =======================================================================
timeout /t 3 >nul
exit
