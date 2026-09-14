#!/usr/bin/env bash
set -e

echo "🚀 Iniciando processo de deploy da versão compilada (demo)..."

# 1. Executar compilação e ofuscação
echo "🔨 1. Executando compilação e ofuscação (npm run build)..."
npm run build

# 2. Navegar para a pasta dist/
cd dist

# 3. Limpar repositório git temporário anterior caso exista
if [ -d ".git" ]; then
  rm -rf .git
fi

# 4. Inicializar repositório Git temporário local apenas dentro de dist/
echo "📦 2. Inicializando repositório Git temporário isolado em dist/..."
git init -b main
git add -A

VERSION=$(node -p "require('../package.json').version || '1.0.0'")
COMMIT_MSG="chore(release): release demo build v$VERSION"
git commit -m "$COMMIT_MSG"
echo "✔ Commit criado em dist/: \"$COMMIT_MSG\""

# 5. Configurar repositório remoto público independente
DEMO_REPO="${DEMO_REPO_URL:-$1}"
if [ -z "$DEMO_REPO" ] || [ "$DEMO_REPO" == "--no-push" ]; then
  DEMO_REPO="https://github.com/ribeiroarley/bendito-burger-demo.git"
fi

echo "🔗 3. Configurando repositório remoto: $DEMO_REPO"
git remote add origin "$DEMO_REPO"

# 6. Publicação no repositório remoto público
if [ "$1" == "--no-push" ] || [ "$2" == "--no-push" ]; then
  echo "ℹ Flag --no-push detectada. Commit local gerado com sucesso em dist/. Envio remoto ignorado."
else
  echo "📤 4. Enviando artefatos compilados para $DEMO_REPO (branch main)..."
  if git push --force origin main; then
    echo "🎉 Deploy da demo publicado com sucesso no repositório público!"
    cd ..
    rm -rf dist/.git
    echo "🧹 Repositório temporário interno dist/.git limpo com sucesso."
  else
    echo "⚠ Não foi possível concluir o 'git push' automaticamente para o repositório remoto."
    echo "  Verifique se o repositório público '$DEMO_REPO' existe no GitHub e se as credenciais locais estão configuradas."
    echo "  O repositório local temporário em dist/ foi mantido caso deseje inspecionar ou executar o push manualmente:"
    echo "    cd dist"
    echo "    git push --force origin main"
    cd ..
  fi
fi

echo "✅ Processo de deploy finalizado!"
