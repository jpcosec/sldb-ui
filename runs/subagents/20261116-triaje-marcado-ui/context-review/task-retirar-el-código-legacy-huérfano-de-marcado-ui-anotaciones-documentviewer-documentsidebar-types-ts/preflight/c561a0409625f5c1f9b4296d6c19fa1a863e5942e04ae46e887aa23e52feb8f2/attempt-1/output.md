## REFORMULACION

Encargo ejecutable (no agregado): en el repo `/home/jp/proyectos/SLDB_1/UIs/marcado-ui`, rama main, borrar con `git rm` exactamente 14 archivos legacy sin uso (8 fuentes: AnnotationPopup, AnnotationsList, DocumentViewer, DocumentSidebar, useAnnotations, useAnnotationHighlights, types.ts, utils/frontmatter; 6 tests con 62 tests), dejando intacto el workspace Marcado. Resultado esperado: mismas suites vivas verdes (23 tests), `npm run build` con exit 0, grep sin coincidencias en `src/`, evidencia en `runs/subagents/20261116-marcado-ui-legacy/` y registro `deskops review record`. Límites: no tocar package.json, README, App.tsx, document-workspace, workspace-shell/navigator, `src/lib/*`, ni añadir código o estilos.

## AMBIGUEDADES

1. "src/__tests__/utils.test.ts (8)" — no afirma que solo pruebe frontmatter; obliga a inventar que no cubre otros utils vivos.
2. "TMPDIR=/dev/shm npx vitest run completo" — falta la invocación exacta y el cwd; obliga a inventar el comando.
3. "si el grep del paso 2 encuentra una coincidencia en un archivo que no está en la lista" — no define qué cuenta (import real, string, comentario); además Validation omite el patrón `/types["']` del paso 2. Obliga a inventar criterio de coincidencia.
4. "deskops review record ... --root ." — no fija desde qué directorio se ejecuta; obliga a asumir cwd.
5. "Hoy da 4 archivos y 23 tests pasados (9+9+3+2)" — no exige verificar árbol limpio ni que HEAD sea 4515a8b; obliga a inventar precondiciones.

## DRY-RUN

Lecturas hipotéticas: App.tsx, document-workspace.tsx, los 14 archivos, el reporte del drawer y `git status`. Cambios previstos: crear `runs/subagents/20261116-marcado-ui-legacy/`, capturar goldens-before, ejecutar grep del paso 2, `git rm` de los 14, capturar goldens-after, comparar. Dependencias: vitest, deskops CLI, árbol limpio, red no requerida. Validaciones futuras: `vitest run`, `npm run build`, grep negativo, diff de 14 borrados. Sin ejecutar nada.

## FUTURO

Un humano decide los casos de la regla de parada (archivo retenido), revisa el diff y valida el registro deskops; otro nodo podría aportar el estado limpio del repo.
