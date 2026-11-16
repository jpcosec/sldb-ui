const path = require('path');
const fs = require('fs');
const repo = '/mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui';
const { chromium } = require(path.join(repo, 'node_modules/playwright'));
const out = path.join(repo, 'runs/subagents/20261116-marcado-ui-legacy-t1');
const URL = 'http://localhost:5291/';
const EXE = '/home/robocop/.cache/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EXE });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleMsgs = [], pageErrors = [], failedReq = [];
  let current = 'initial-load';
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) consoleMsgs.push({ screen: current, type: m.type(), text: m.text() }); });
  page.on('pageerror', (e) => pageErrors.push({ screen: current, text: String(e) }));
  page.on('requestfailed', (r) => failedReq.push({ screen: current, url: r.url(), err: r.failure()?.errorText }));
  page.on('response', (r) => { if (r.status() >= 400) failedReq.push({ screen: current, url: r.url(), status: r.status() }); });

  const timings = [];
  let n = 0;
  const shot = async (name) => { const f = `screen-${String(n).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: path.join(out, f), fullPage: true }); n++; return f; };
  const mainHas = (text) => page.waitForFunction((t) => { const m = document.querySelector('main'); return !!m && (m.innerText.includes(t) || [...m.querySelectorAll('textarea')].some((x) => x.value.includes(t))); }, text, { timeout: 15000 });
  async function step(name, slug, action, waitFn) {
    current = name;
    const t0 = Date.now();
    let rendered = true, err = null;
    try { await action(); await waitFn(); } catch (e) { rendered = false; err = String(e).split('\n')[0].slice(0, 200); }
    const ms = Date.now() - t0;
    const screenshot = await shot(slug);
    timings.push({ screen: name, ms, rendered, err, screenshot });
  }
  const navBtn = (pathText) => page.locator('aside button', { hasText: pathText }).filter({ hasText: 'markers' }).first();

  await step('Carga inicial (doc por defecto: canonical example)', 'initial-load',
    () => page.goto(URL, { waitUntil: 'domcontentloaded' }),
    () => mainHas('Semantic Markdown ASG'));

  await step('Navegador: marcado-canonical-example', 'nav-canonical',
    () => navBtn('marcado-canonical-example').click(),
    () => mainHas('This example introduces semantic milestone markers'));

  await step('Vista Source (canonical)', 'canonical-source',
    () => page.locator('main button', { hasText: /^\s*Source\s*$/ }).first().click(),
    () => page.waitForFunction(() => !!document.querySelector('main textarea, main .cm-editor, main pre'), null, { timeout: 15000 }));
  await step('Vista Rendered (canonical)', 'canonical-rendered',
    () => page.locator('main button', { hasText: /^\s*Rendered\s*$/ }).first().click(),
    () => mainHas('This example introduces semantic milestone markers'));
  for (const layer of ['Structure', 'Semantics', 'Rhetoric', 'All']) {
    await step(`Filtro de capa: ${layer} (canonical)`, `layer-${layer.toLowerCase()}`,
      () => page.locator('main button', { hasText: new RegExp(`^\\s*${layer}\\s*$`) }).first().click(),
      () => mainHas('Semantic Markdown ASG'));
  }
  await step('Start here: Open sample (canonical)', 'open-sample',
    () => page.locator('aside button', { hasText: 'Open sample' }).click(),
    () => mainHas('This example introduces semantic milestone markers'));

  // Remaining src/data docs: not registered in documents.ts, load them via the "Upload a Markdown file" input.
  const others = [
    ['api-design-guidelines.md', 'API Design Guidelines'],
    ['project-architecture.md', 'Project Architecture Overview'],
    ['research-state-management.md', 'State Management Solutions'],
    ['sprint-planning-week4.md', 'Sprint Planning'],
  ];
  for (const [file, heading] of others) {
    await step(`Upload src/data/${file}`, `upload-${file.replace('.md', '')}`,
      () => page.locator('input[type=file]').first().setInputFiles(path.join(repo, 'src/data', file)),
      () => mainHas(heading));
  }
  // Now select each entry in the navigator
  const navCount = await page.locator('aside button').filter({ hasText: 'markers' }).count();
  const entries = [];
  for (let i = 0; i < navCount; i++) entries.push((await page.locator('aside button').filter({ hasText: 'markers' }).nth(i).innerText()).replace(/\s+/g, ' ').trim());
  const headings = { 'api-design': 'API Design Guidelines', 'project-architecture': 'Project Architecture Overview', 'research-state': 'State Management Solutions', 'sprint-planning': 'Sprint Planning', 'canonical': 'Semantic Markdown ASG' };
  for (let i = 0; i < navCount; i++) {
    const label = entries[i];
    const key = Object.keys(headings).find((k) => label.toLowerCase().includes(k)) || null;
    await step(`Navegador [${i}]: ${label.slice(0, 70)}`, `nav-entry-${i}`,
      () => page.locator('aside button').filter({ hasText: 'markers' }).nth(i).click(),
      () => key ? mainHas(headings[key]) : page.waitForTimeout(300));
  }
  const result = { url: URL, date: new Date().toISOString(), navigatorEntriesAfterUploads: entries, timings, consoleErrors: consoleMsgs, pageErrors, failedRequests: failedReq };
  fs.writeFileSync(path.join(out, 'ui-timings.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((e) => { console.error('SCRIPT ERROR', e); process.exit(1); });
