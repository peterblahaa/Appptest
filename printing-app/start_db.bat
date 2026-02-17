@echo off
echo Spustam lokalnu databazu...
call "C:\Program Files\nodejs\npm.cmd" install -g json-server
call "C:\Program Files\nodejs\npx.cmd" json-server --watch db.json --port 3000
pause
