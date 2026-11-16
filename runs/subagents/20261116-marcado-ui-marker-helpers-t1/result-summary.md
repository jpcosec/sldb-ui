# Tester t1: extraer helpers de marcadores a src/lib

Tester: deskops-t-4f38251e37dc (deskops-tester). Fecha: 2026-11-16. Árbol de trabajo sin commit (main, robocop2).

## Veredicto: PASA

## Chequeos
1. **Fidelidad: OK**
   - `buildHighlightedMarkdown`, `getTextOffset` y `escapeHtml` de `src/lib/marker-render.ts` son idénticas byte a byte a las de `git show HEAD:src/components/document-workspace.tsx`; la única diferencia es el prefijo `export` (ver `fidelity-t1.log`, diff vacío).
   - `removeMarkerFromSource` y `renameMarkerInSource` hacen el mismo corte de texto que `handleDeleteMarker` y `handleRenameMarker` en HEAD (ver `app-head-handlers.txt`). Solo cambian los nombres: `currentSource` pasa a ser `source` y `selectedDoc.bodySourceStart` pasa a ser `bodySourceStart`.
   - `App.tsx` conserva `window.prompt("Rename marker key")`, `setWorkspaceDocuments`, `setDocumentModes(... "local")` y los avisos. Ya no queda `body.slice` en App.tsx.
   - `git status --short src`: solo están M App.tsx, M document-workspace.tsx y los 4 archivos nuevos del alcance. `git diff --stat src`: App.tsx +3/-22, document-workspace.tsx +1/-52.
2. **Tests: OK**
   - `marker-render.test.ts` tiene 5 `it`: sin marcadores, un marcador, solapados de sem y rhet con count 2 y namespaces en orden, title escapado y getTextOffset en div>p>strong igual a 8.
   - `marker-edit.test.ts` tiene 3 `it`: borrar, renombrar sin tocar otras apariciones de `sem:a`, y frontmatter intacto en el canónico con `?raw` y `parseMarcadoDocument`, más una comprobación de las claves restantes.
   - Todas las aserciones comparan la salida exacta con `toBe` o `toEqual`.
   - Mutación en la copia `/dev/shm/mui-t1-mut` (node_modules enlazado): `closeMarkerEnd` → `closeMarkerEnd + 1` en las dos funciones. Resultado: **2 fallidos y 1 pasado**, exit 1 (`mutation-t1.log`). El test del frontmatter sigue pasando con la mutación, lo cual es esperable porque solo vigila el frontmatter. La copia se borró después.
3. **Validation: OK** (`validation-t1.log`)
   | Comando | exit | Resultado |
   |---|---|---|
   | vitest marker-render y marker-edit | 0 | 2 archivos y 8 tests pasados |
   | vitest completo | 0 | 6 archivos y 31 tests pasados |
   | npm run build | 0 | built |
   | `! grep function buildHighlightedMarkdown\|getTextOffset` | 0 | sin coincidencias |
   | goldens (integration + ux) | 0 | 2 archivos y 18 tests pasados |
   - Extra, fuera del contrato: `tsc --noEmit` da 12 errores (`tsc-t1.log`). Ninguno está en `src/lib/marker-*` ni en los tests nuevos. Los de App.tsx (líneas 378, 413 y 717) y el de document-workspace.tsx (línea 358) están en líneas que el diff no toca, así que vienen de antes.
4. **UI headless: OK** (`ui-run-t1.log`, `ui-timings.json`, `ui-NN-*.png`)
   - Entorno: vite en el puerto 5292 y Playwright con chromium_headless_shell-1254. Hubo 25 de 25 chequeos OK.
   - **Resaltado:** en las vistas All, Structure, Semantics y Rhetoric, los spans `marker-highlight` del DOM coinciden exactamente (clase, title y data-marker-count) con los que genera `buildHighlightedMarkdown` de la lib servida por vite: 6, 1, 3 y 2 spans. Hay un tramo solapado con `data-marker-count="2"`.
   - **Selección:** en el DOM real, `getTextOffset` da 285 en el nodo de texto, igual que `indexOf`, y 347 en la rama de elemento, que es el fin del `<p>`. El mouseup abre el composer con “Pure trees”, y Add marker envuelve ese texto en el source. Reset devuelve el source original.
   - **Renombrar:** se respondió al prompt con `struct:intro_t1` mediante `page.on('dialog')`. El source cambió solo en la apertura y el cierre, coincide con `renameMarkerInSource`, el frontmatter (0..537) quedó intacto y el inspector y el title del span se actualizaron. Al cancelar el prompt, el source no cambió.
   - **Borrar** `rhet:decision.use_asg`: el source es el anterior sin sus dos comentarios. El frontmatter quedó intacto, incluido el edge YAML que lo referencia (comportamiento previo, no se toca). El marcador desapareció del inspector y de los spans.
   - Cierre: maté por PID solo los procesos que lancé (npm 771473, sh 771534, node vite 771535). Los tres están terminados y el puerto 5292 ya no responde.

## Tiempos por pantalla (ms)
| Pantalla | ms |
|---|---|
| home | 512 |
| open-sample | 95 |
| rendered-all | 110 |
| source-view | 120 |
| layer-structure | 234 |
| layer-semantics | 977 |
| layer-rhetoric | 262 |
| layer-all | 236 |
| selection | 898 |
| rename-marker | 795 |
| rename-cancel | 608 |
| delete-marker | 642 |
| final-rendered | 52 |
| **total** | **5541** |

## Errores de consola o página
Ninguno: 0 de console.error o warning y 0 pageerror.

## Observaciones (no bloquean)
- `escapeHtml` se exporta pero `document-workspace.tsx` no la importa. Está bien, porque solo la usa `buildHighlightedMarkdown`.
- La evidencia del ejecutor coincide con lo que reproduje: 31/31, 18/18 y build 0.
