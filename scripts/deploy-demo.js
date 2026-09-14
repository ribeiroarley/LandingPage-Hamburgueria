const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const pkg = require(path.join(ROOT_DIR, 'package.json'));
const version = pkg.version || '1.0.0';

async function deployDemo() {
  console.log('🚀 Iniciando processo de deploy da versão compilada (demo)...\n');

  // 1. Executar compilação e ofuscação
  console.log('🔨 1. Executando compilação e ofuscação (npm run build)...');
  execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });

  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('Pasta dist/ não foi encontrada após a compilação.');
  }

  // 2. Limpar qualquer repositório git temporário residual em dist/
  const gitDir = path.join(DIST_DIR, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  // 3. Inicializar repositório Git temporário local apenas dentro de dist/
  console.log('\n📦 2. Inicializando repositório Git temporário isolado em dist/...');
  execSync('git init -b main', { cwd: DIST_DIR, stdio: 'inherit' });
  execSync('git add -A', { cwd: DIST_DIR, stdio: 'inherit' });

  const commitMsg = `chore(release): release demo build v${version}`;
  execSync(`git commit -m "${commitMsg}"`, { cwd: DIST_DIR, stdio: 'inherit' });
  console.log(`   ✔ Commit criado em dist/: "${commitMsg}"\n`);

  // 4. Configurar repositório remoto público independente
  const args = process.argv.slice(2);
  const isNoPush = args.includes('--no-push');
  const customRepo = args.find(arg => !arg.startsWith('--'));
  const demoRepo = process.env.DEMO_REPO_URL || customRepo || 'https://github.com/ribeiroarley/bendito-burger-demo.git';

  console.log(`🔗 3. Configurando repositório remoto: ${demoRepo}`);
  execSync(`git remote add origin ${demoRepo}`, { cwd: DIST_DIR, stdio: 'inherit' });

  // 5. Publicação no repositório remoto público
  if (isNoPush) {
    console.log('ℹ Flag --no-push detectada. Commit local gerado com sucesso em dist/. Envio remoto ignorado.');
  } else {
    console.log(`📤 4. Enviando artefatos compilados para ${demoRepo} (branch main)...`);
    try {
      execSync('git push --force origin main', { cwd: DIST_DIR, stdio: 'inherit' });
      console.log('\n🎉 Deploy da demo publicado com sucesso no repositório público!');
      
      // Limpar repositório temporário após envio com sucesso
      if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
        console.log('🧹 Repositório temporário interno dist/.git limpo com sucesso.');
      }
    } catch (err) {
      console.warn('\n⚠ Não foi possível concluir o "git push" automaticamente para o repositório remoto.');
      console.warn(`  Verifique se o repositório público "${demoRepo}" existe no GitHub e se as credenciais locais estão configuradas.`);
      console.warn('  O repositório local temporário em dist/ foi mantido caso deseje inspecionar ou executar o push manualmente:');
      console.warn('    cd dist');
      console.warn('    git push --force origin main\n');
    }
  }

  console.log('✅ Processo de deploy finalizado!');
}

if (require.main === module) {
  deployDemo().catch(err => {
    console.error('❌ Erro no deploy da demo:', err);
    process.exit(1);
  });
}

module.exports = { deployDemo };
