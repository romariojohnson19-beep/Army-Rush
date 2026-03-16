@echo off
REM Start Army Rush game server on port 8000
setlocal ENABLEDELAYEDEXPANSION

echo Starting Army Rush local server on http://localhost:8000 ...

REM Try python, fallback to py launcher
where python >nul 2>&1
if %errorlevel%==0 (
	python -m http.server 8000
) else (
	echo python executable not found, using py launcher
	py -m http.server 8000
)

echo Server stopped.
pause
