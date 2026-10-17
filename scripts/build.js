const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify: minifyHTML } = require('html-minifier-terser');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

async function build() {
  console.log('🚀 Iniciando pipeline de build & ofuscação rigorosa...\n');

  // 1. Limpeza e Estrutura: Deletar e recriar pasta dist/ com subpastas
  console.log('📦 1. Limpando e estruturando pasta dist/...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }

  const subdirs = ['css', 'js', 'img', 'seo'];
  fs.mkdirSync(DIST_DIR, { recursive: true });
  subdirs.forEach(dir => fs.mkdirSync(path.join(DIST_DIR, dir), { recursive: true }));
  console.log('   ✔ Estrutura criada: dist/{css, js, img, seo}\n');

  // 2. Cópia de Estáticos
  console.log('📂 2. Copiando arquivos estáticos...');
  // Copiar img/ recursivamente
  if (fs.existsSync(path.join(ROOT_DIR, 'img'))) {
    fs.cpSync(path.join(ROOT_DIR, 'img'), path.join(DIST_DIR, 'img'), { recursive: true });
    console.log('   ✔ img/ copiado para dist/img/');
  }

  // Copiar seo/ recursivamente
  if (fs.existsSync(path.join(ROOT_DIR, 'seo'))) {
    fs.cpSync(path.join(ROOT_DIR, 'seo'), path.join(DIST_DIR, 'seo'), { recursive: true });
    console.log('   ✔ seo/ copiado para dist/seo/');
  }

  // Copiar manifest.json
  if (fs.existsSync(path.join(ROOT_DIR, 'manifest.json'))) {
    fs.copyFileSync(path.join(ROOT_DIR, 'manifest.json'), path.join(DIST_DIR, 'manifest.json'));
    console.log('   ✔ manifest.json copiado para dist/manifest.json');
  }

  // Copiar e ajustar sw.js para dist/
  if (fs.existsSync(path.join(ROOT_DIR, 'sw.js'))) {
    let swContent = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
    
    // Ajustar caminhos internos para a pasta dist (unificados em app.min.css e app.bundle.js)
    swContent = swContent
      .replace(/"\.\/css\/style\.css",\s*/g, '')
      .replace(/"\.\/css\/components\.css",\s*/g, '')
      .replace(/"\.\/css\/responsive\.css",/g, '"./css/app.min.css",')
      .replace(/"\.\/js\/security\.js",\s*/g, '')
      .replace(/"\.\/js\/main\.js",/g, '"./js/app.bundle.js",');

    fs.writeFileSync(path.join(DIST_DIR, 'sw.js'), swContent, 'utf8');
    console.log('   ✔ sw.js ajustado e copiado para dist/sw.js');
  }

  // Criar .nojekyll para o GitHub Pages ignorar o processador Jekyll
  fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '', 'utf8');
  console.log('   ✔ .nojekyll gerado em dist/.nojekyll\n');

  // 3. CSS Bundling & Minification
  console.log('🎨 3. Agrupando e minificando CSS...');
  const cssFiles = ['css/style.css', 'css/components.css', 'css/responsive.css'];
  let combinedCss = '';
  for (const file of cssFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      combinedCss += fs.readFileSync(filePath, 'utf8') + '\n';
    } else {
      console.warn(`   ⚠ Aviso: Arquivo CSS não encontrado: ${file}`);
    }
  }

  const cleanCssOutput = new CleanCSS({
    level: 2,
    compatibility: '*'
  }).minify(combinedCss);

  if (cleanCssOutput.errors && cleanCssOutput.errors.length > 0) {
    throw new Error('Falha na minificação do CSS: ' + cleanCssOutput.errors.join(', '));
  }

  const outputCssPath = path.join(DIST_DIR, 'css', 'app.min.css');
  fs.writeFileSync(outputCssPath, cleanCssOutput.styles, 'utf8');
  console.log(`   ✔ dist/css/app.min.css gerado (${(cleanCssOutput.styles.length / 1024).toFixed(2)} KB)\n`);

  // 4. JavaScript Bundling & Ofuscação Estrita
  console.log('🔒 4. Bundling e ofuscação rigorosa de JavaScript...');
  
  // Rotina de proteção sem interferir na digitação de inputs ou causar congelamento
  const antiInspectionShield = `
(function () {
  'use strict';
  // Bloqueio de contextmenu fora de campos de input/textarea (permite colar e interagir nos campos)
  document.addEventListener('contextmenu', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
      return;
    }
    e.preventDefault();
  }, false);

  // Bloqueio de atalhos de desenvolvedor fora de campos de texto
  document.addEventListener('keydown', function (e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
      return;
    }
    // Bloqueia F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Bloqueia Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (
      e.key === 'I' || e.key === 'i' || e.keyCode === 73 ||
      e.key === 'J' || e.key === 'j' || e.keyCode === 74 ||
      e.key === 'C' || e.key === 'c' || e.keyCode === 67
    )) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Bloqueia Ctrl+U (Exibir código fonte)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, false);
})();
`;

  let combinedJs = antiInspectionShield + '\n';
  const jsFiles = ['js/security.js', 'js/main.js'];
  for (const file of jsFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (fs.existsSync(filePath)) {
      combinedJs += fs.readFileSync(filePath, 'utf8') + '\n';
    } else {
      console.warn(`   ⚠ Aviso: Arquivo JS não encontrado: ${file}`);
    }
  }

  console.log('   ⚡ Aplicando javascript-obfuscator com parâmetros estritos...');
  const obfuscationResult = JavaScriptObfuscator.obfuscate(combinedJs, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'mangled',
    stringArray: true,
    stringArrayThreshold: 0.75,
    sourceMap: false
  });

  const outputJsPath = path.join(DIST_DIR, 'js', 'app.bundle.js');
  fs.writeFileSync(outputJsPath, obfuscationResult.getObfuscatedCode(), 'utf8');
  console.log(`   ✔ dist/js/app.bundle.js gerado (${(obfuscationResult.getObfuscatedCode().length / 1024).toFixed(2)} KB)\n`);

  // 5. HTML Minification & Reescrever Importações
  console.log('📄 5. Reescrevendo importações e minificando index.html...');
  let htmlContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

  // Substituir os 3 links de CSS por dist/css/app.min.css
  const cssRegex = /<!--\s*CSS Modularizado[^>]*-->\s*<link rel="stylesheet" href="css\/style\.css">\s*<link rel="stylesheet" href="css\/components\.css">\s*<link rel="stylesheet" href="css\/responsive\.css">/i;
  if (cssRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(cssRegex, '<link rel="stylesheet" href="css/app.min.css">');
  } else {
    // Fallback genérico para os links de CSS caso os comentários variem
    htmlContent = htmlContent
      .replace(/<link rel="stylesheet" href="css\/style\.css">/g, '<link rel="stylesheet" href="css/app.min.css">')
      .replace(/<link rel="stylesheet" href="css\/components\.css">\s*/g, '')
      .replace(/<link rel="stylesheet" href="css\/responsive\.css">\s*/g, '');
  }

  // Substituir os 2 scripts por dist/js/app.bundle.js (com defer)
  const jsRegex = /<!--\s*Scripts com carregamento[^>]*-->\s*<script defer src="js\/security\.js"><\/script>\s*<script defer src="js\/main\.js"><\/script>/i;
  if (jsRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(jsRegex, '<script defer src="js/app.bundle.js"></script>');
  } else {
    // Fallback genérico para scripts
    htmlContent = htmlContent
      .replace(/<script defer src="js\/security\.js"><\/script>/g, '<script defer src="js/app.bundle.js"></script>')
      .replace(/<script defer src="js\/main\.js"><\/script>\s*/g, '');
  }

  // Minificar HTML com html-minifier-terser
  const minifiedHtml = await minifyHTML(htmlContent, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });

  const outputHtmlPath = path.join(DIST_DIR, 'index.html');
  fs.writeFileSync(outputHtmlPath, minifiedHtml, 'utf8');
  console.log(`   ✔ dist/index.html gerado (${(minifiedHtml.length / 1024).toFixed(2)} KB)\n`);

  console.log('✅ Pipeline de build concluído com sucesso!');
}

if (require.main === module) {
  build().catch(err => {
    console.error('❌ Erro no pipeline de build:', err);
    process.exit(1);
  });
}

module.exports = { build };
