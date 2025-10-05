@echo off
echo ========================================
echo   RESOLVER PROBLEMAS DE BUILD
echo ========================================
echo.
echo Este script vai:
echo 1. Fechar TODOS os terminais Node
echo 2. Limpar completamente o cache
echo 3. Fazer um build limpo
echo 4. Iniciar o servidor
echo.
pause

echo.
echo [1/5] Fechando todos os processos Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo [2/5] Removendo .next (pode demorar)...
if exist .next (
    attrib -r -h -s .next\* /s /d >nul 2>&1
    rd /s /q .next >nul 2>&1
)

echo [3/5] Removendo cache do node_modules...
if exist node_modules\.cache (
    rd /s /q node_modules\.cache >nul 2>&1
)

echo [4/5] Fazendo build limpo...
call npm run build

echo.
echo [5/5] Build concluído! Agora pode rodar:
echo    npm run dev
echo.
pause
