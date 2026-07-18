@echo off
title Natura Conecta AI - Servidor Local
echo ==========================================================
echo    INICIANDO NATURA CONECTA AI - SERVIDOR LOCAL
echo ==========================================================
echo.
echo Verificando instalacion de Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
  echo Error: Node.js no esta instalado en tu computadora.
  echo Por favor ve a https://nodejs.org/ descarga e instala la version LTS.
  echo Despues, vuelve a abrir este archivo.
  echo.
  pause
  exit
)

echo Node.js detectado con exito.
echo.
echo Pasó 1/2: Instalando dependencias de la aplicacion...
echo (Esto solo tarda un momento la primera vez que se ejecuta)
echo.
call npm install

echo.
echo Paso 2/2: Iniciando el servidor local...
echo.
echo ==========================================================
echo   APLICACION LISTA!
echo   Abre tu navegador de preferencia ingresando a:
echo   👉 http://localhost:3000
echo ==========================================================
echo.
echo Ejecutando... No cierres esta ventana mientras uses la app.
echo.
call npm run dev
pause
