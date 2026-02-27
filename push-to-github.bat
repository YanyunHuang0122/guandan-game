@echo off
REM Push to GitHub Account 2 with Personal Access Token
REM Replace YOUR_TOKEN_HERE with your actual token

cd C:\Users\yanyunhuang\GuandanGame\PWA

echo Pushing to YanyunHuang0122 account...
git push https://YOUR_TOKEN_HERE@github.com/YanyunHuang0122/guandan-game.git main

echo.
echo Done! Check if push was successful above.
pause
