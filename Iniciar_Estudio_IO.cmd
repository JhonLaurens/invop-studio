@echo off
cd /d "%~dp0"
where npm >nul 2>&1
if errorlevel 1 (
  echo No se encontro Node.js y npm. Instala Node.js y vuelve a intentarlo.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo No fue posible instalar las dependencias.
    pause
    exit /b 1
  )
)
echo.
echo Cuando aparezca la direccion Local, abre esa direccion en tu navegador.
echo Manten esta ventana abierta mientras usas la aplicacion.
echo.
call npm run dev -- --host 127.0.0.1
pause
