@echo off
for /f %%i in (npm.txt) do (
    echo Installing %%i...
    npm install %%i
)
