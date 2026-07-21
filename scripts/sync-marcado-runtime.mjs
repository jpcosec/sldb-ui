import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';

const uiRoot = resolve(new URL('..', import.meta.url).pathname);
const marcadoRoot = resolve(uiRoot, '../marcado');
const pythonPath = resolve(marcadoRoot, 'src');
const sourceDir = resolve(uiRoot, 'src/data');
const outputDir = resolve(sourceDir, 'runtime');

mkdirSync(outputDir, { recursive: true });

const markdownFiles = readdirSync(sourceDir).filter((name) => name.endsWith('.md'));

for (const fileName of markdownFiles) {
  const sourcePath = join(sourceDir, fileName);
  const runtimePath = join(outputDir, fileName.replace(/\.md$/i, '.runtime.json'));
  const source = readFileSync(sourcePath, 'utf8');

  const stdout = execFileSync(
    'python3',
    [
      '-c',
      [
        'import json, os, sys',
        "sys.path.insert(0, os.environ['PYTHONPATH'])",
        'from marcado.parser import parse_text',
        'from marcado.export import export_document',
        'source = sys.stdin.read()',
        'parsed = parse_text(source)',
        'print(json.dumps(export_document(parsed), indent=2, sort_keys=True, ensure_ascii=False))',
      ].join('; '),
    ],
    {
      cwd: marcadoRoot,
      env: { ...process.env, PYTHONPATH: pythonPath },
      input: source,
      encoding: 'utf8',
    }
  );

  mkdirSync(dirname(runtimePath), { recursive: true });
  writeFileSync(runtimePath, stdout);
  console.log(`synced ${fileName} -> ${runtimePath}`);
}
