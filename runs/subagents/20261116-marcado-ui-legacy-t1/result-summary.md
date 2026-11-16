# Tester deskops-t-8c38967ddbcf: task-retirar-el-código-legacy (marcado-ui)

**Veredicto: PASA**

Verificado el 2026-11-16 sobre el índice de main en robocop2 (sin commit). El tester no tocó ningún archivo del repo fuera de este directorio.

## Chequeos

| # | Chequeo | Resultado |
|---|---|---|
| 1 | `git diff --cached --name-status`: 14 `D`, exactamente los de la lista (8 fuentes + 6 tests) | OK |
| 1b | `git status --short`, sin contar .sldb/, desk/reviews, runs/ ni .sldb_cache: no hay otros cambios (src/, package.json, README.md intactos) | OK |
| 2a | `TMPDIR=/dev/shm npx vitest run` → Test Files 4 passed (4), Tests 23 passed (23) | OK, exit 0 |
| 2b | `npm run build` → `✓ built` | OK, exit 0 |
| 2c | `! grep -rnE "AnnotationPopup\|AnnotationsList\|DocumentViewer\|DocumentSidebar\|useAnnotation\|utils/frontmatter" src` | OK, exit 0 (sin coincidencias) |
| 3 | grep extra `/types["']\|utils/frontmatter` en src | OK, sin coincidencias (grep rc 1) |
| 3b | `npx tsc --noEmit -p .` → exit 2, 12 errores TS | Ya estaban antes: App.tsx (showOpenFilePicker/showDirectoryPicker posiblemente undefined, PurposeCard sin usar), document-workspace.tsx:357 (RefObject), lib/marcado.ts:162, vite.config.ts (any implícito). Ninguno menciona archivos borrados ni dice "Cannot find module". No es una falla de la tarea |
| 4 | UI headless (vite dev :5291, Playwright 1.x + chromium headless shell 1254): 19 pantallas, todas renderizadas | OK |
| 4b | Errores de consola, errores de página, requests fallidos (4xx o fallo de red) | 0 / 0 / 0 |

Logs: `validation-t1.log` (los 3 comandos de Validation con su EXIT), `tsc-t1.log`, `vite-dev.log`, `ui-timings.json`, `ui-t1.cjs` (script) y `screen-*.png` (19).

## UI: tiempos por pantalla

El tiempo se mide desde la acción (goto, clic o upload) hasta que el texto del documento es visible en `<main>`. En la vista Source se busca en el valor del textarea.

| Pantalla | ms | Render | Screenshot |
|---|---:|:---:|---|
| Carga inicial (canonical por defecto) | 459 | sí | screen-00-initial-load.png |
| Navegador: marcado-canonical-example | 94 | sí | screen-01-nav-canonical.png |
| Vista Source (canonical) | 65 | sí | screen-02-canonical-source.png |
| Vista Rendered (canonical) | 178 | sí | screen-03-canonical-rendered.png |
| Capa Structure | 97 | sí | screen-04-layer-structure.png |
| Capa Semantics | 109 | sí | screen-05-layer-semantics.png |
| Capa Rhetoric | 230 | sí | screen-06-layer-rhetoric.png |
| Capa All | 101 | sí | screen-07-layer-all.png |
| Start here: Open sample | 96 | sí | screen-08-open-sample.png |
| Upload src/data/api-design-guidelines.md | 197 | sí | screen-09-… |
| Upload src/data/project-architecture.md | 285 | sí | screen-10-… |
| Upload src/data/research-state-management.md | 118 | sí | screen-11-… |
| Upload src/data/sprint-planning-week4.md | 153 | sí | screen-12-… |
| Navegador [0] Open sample | 68 | sí | screen-13-nav-entry-0.png |
| Navegador [1] api-design-guidelines.md | 182 | sí | screen-14-nav-entry-1.png |
| Navegador [2] marcado-canonical-example | 108 | sí | screen-15-nav-entry-2.png |
| Navegador [3] project-architecture.md | 223 | sí | screen-16-nav-entry-3.png |
| Navegador [4] research-state-management.md | 178 | sí | screen-17-nav-entry-4.png |
| Navegador [5] sprint-planning-week4.md | 167 | sí | screen-18-nav-entry-5.png |

## Errores de consola

Ninguno: 0 errores o warnings de consola, 0 pageerror y 0 requests fallidos en toda la sesión.

## Notas (no son falla)

- `src/data/documents.ts` solo registra `marcado-canonical-example`. Los otros 4 `.md` de src/data no aparecen en el navegador desde el arranque. Para recorrerlos, los cargué con el input "Upload a Markdown file" y después los seleccioné desde el navegador. Esto no depende de esta tarea.
- El primer intento de recorrido marcó los uploads como timeout. Fue un falso negativo de mi script: el upload abre la vista Source (textarea) y yo esperaba el texto en `innerText`. Corregí la espera y la segunda corrida es la que vale.
- Playwright de node_modules pide chromium_headless_shell-1228, que no está instalado. Usé el 1254 de ~/.cache con `executablePath`.
- Estético y anterior a esta tarea: al seleccionar un doc subido desde el navegador, la línea de estado sigue diciendo "Opened sample …".
- El vite que lancé (PID 681799) lo maté por PID y el puerto 5291 quedó libre. Limpié los temporales de /dev/shm.
