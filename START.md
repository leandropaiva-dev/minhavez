# 🚀 Como Iniciar o MinhaVez

## Método 1: Script BAT (Recomendado - Windows)
```bash
dev.bat
```

## Método 2: NPM Script
```bash
npm run dev:fresh
```

## Método 3: PowerShell Manual
```powershell
# Matar todos os processos Node
taskkill /F /IM node.exe

# Limpar cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Iniciar
npm run dev
```

## ⚠️ Se aparecer erro EPERM:

1. Feche o terminal
2. Abra um NOVO terminal
3. Execute: `dev.bat`

## 📝 Notas:
- O servidor roda em `http://localhost:3000`
- Se a porta 3000 estiver ocupada, usa 3001
- O script `dev.bat` limpa tudo automaticamente
