## REFORMULACION

Encargo: en el repo `/home/jp/proyectos/SLDB_1/UIs/marcado-ui` (rama main, local), retirar el subsistema legacy huérfano de anotaciones (8 fuentes: AnnotationPopup, AnnotationsList, DocumentViewer, DocumentSidebar, useAnnotations, useAnnotationHighlights, types.ts, utils/frontmatter) y sus 6 tests, más restos en README.md y package.json solo si se verifican. Resultado: HEAD sin esos 14 archivos, grep sin coincidencias en `src/`, suites vivas con el mismo conteo que los goldens previos, `npx vitest run` completo y `npm run build` con exit 0. Límites: no tocar App.tsx, document-workspace.tsx, workspace-shell.tsx, workspace-navigator.tsx ni `src/lib/*`; sin funciones ni estilos nuevos; si algo vivo deja de compilar, se restaura y se excluye.

## AMBIGUEDADES

1. «las dependencias de package.json que solo usaban esos archivos (verificarlo con grep antes de quitar cualquiera)»: no define el universo del grep ni el criterio de "solo usaban" (imports directos, transitivos, scripts). Obligaría a inventar el método y el alcance de la verificación.
2. «Guardar la salida en runs/subagents/<run>/goldens-before.txt»: `<run>` no está definido. Obligaría a inventar el identificador de run.
3. «hoy son 10 archivos y 85 tests; después deben ser 4 archivos, con 85 menos los tests borrados»: no da el conteo exacto esperado ni aclara si 85 incluye los borrados. Obligaría a inventar la cifra de aceptación.
4. «se restaura, se deja fuera y se anota en el handoff»: no especifica formato, ruta ni granularidad (¿solo el archivo conflictivo o todo el lote?). Obligaría a inventar el handoff y el rollback.
5. «from \"../types\"»: patrón atado a esa profundidad relativa; no cubre `../types.ts` ni alias. Obligaría a inventar el patrón correcto.

## DRY-RUN

Lecturas: App.tsx, document-workspace.tsx, package.json, README.md y los 14 archivos. Cambios previstos: registrar goldens de las 4 suites vivas, ejecutar grep de referencias, `git rm` de los 14, repetir goldens, `npm run build`, grep final y `npx vitest run` completo. Dependencias: node_modules con vitest, árbol git limpio, TMPDIR=/dev/shm. Validaciones posteriores: comparación de conteos contra goldens, exit 0 de build y vitest, ausencia de coincidencias.

## FUTURO

Un humano decide si las dependencias de package.json y las menciones en README se eliminan; otro nodo registra la evidencia de goldens con `deskops review record` y valida el handoff si hay restauraciones.
