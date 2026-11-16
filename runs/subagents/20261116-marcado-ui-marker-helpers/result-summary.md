# Resultado — extraer helpers puros de marcadores a src/lib

Ejecutor: deskops-e-92b415a0e8f0 (deskops-executor). Fecha: 2026-11-16. Sin commit ni push.

## Qué se hizo
1. Goldens antes: `goldens-before.txt` — 2 archivos, 18 tests pasados, 0 fallidos.
2. `deskops review record ... --kind goldens` → `review-task-extraer-a-src-lib-...-goldens-1` (input_sha256 e727a820...).
3. `src/lib/marker-render.ts`: `buildHighlightedMarkdown`, `getTextOffset`, `escapeHtml` exportadas; cuerpos idénticos a los de HEAD:src/components/document-workspace.tsx (verificado con diff). `document-workspace.tsx` las importa (buildHighlightedMarkdown, getTextOffset) y ya no define ninguna de las tres.
4. `src/lib/marker-edit.ts`: `removeMarkerFromSource` y `renameMarkerInSource` con exactamente el corte de texto de handleDeleteMarker / handleRenameMarker. `App.tsx` las llama; conserva window.prompt, estado, setDocumentModes y avisos. Ya no hay `body.slice` en App.tsx.
5. Tests de caracterización (valores esperados calculados ejecutando el código movido y escritos literales):
   - `src/__tests__/marker-render.test.ts`: 5 casos (sin marcadores; un marcador; dos solapados sem/rhet; title escapado; getTextOffset en div>p>strong = 8).
   - `src/__tests__/marker-edit.test.ts`: 3 casos (borrar; renombrar sin tocar otras apariciones de "sem:a"; frontmatter del ejemplo canónico intacto al borrar y renombrar, bodySourceStart = 537).
   - Ningún `it.fails`: ningún caso evidenció corrupción del documento.
6. Goldens después: `goldens-after.txt` — 2 archivos, 18 tests pasados, 0 fallidos (igual que antes).
7. `npm run build` exit 0; `vitest run` completo: 6 archivos / 31 tests pasados (antes 4 / 23; +2 archivos, +8 tests).

## Validation
Ver `validation.log`: los 4 comandos con exit 0.

## Desvíos / notas
- El caso "title con comillas y < >" usa un MarkerRange construido a mano: parseMarcadoDocument no reconoce como marcador una clave con `"` o `<>` (MARKER_REGEX excluye `>`), así que no se puede obtener del parser. No es bug del código movido.
- `npx tsc --noEmit -p tsconfig.json` (fuera de Validation; build es solo `vite build`) reporta errores preexistentes en líneas no tocadas (App.tsx showOpenFilePicker/showDirectoryPicker/PurposeCard; document-workspace.tsx ref de la línea 358). Ninguno en src/lib/marker-*.ts ni en los tests nuevos.
