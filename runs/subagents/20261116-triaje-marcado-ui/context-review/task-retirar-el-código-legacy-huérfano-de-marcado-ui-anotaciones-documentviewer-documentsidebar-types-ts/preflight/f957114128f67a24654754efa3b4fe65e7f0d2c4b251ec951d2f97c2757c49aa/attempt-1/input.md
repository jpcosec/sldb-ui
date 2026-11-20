FILE:desk/tasks/task-retirar-el-código-legacy-huérfano-de-marcado-ui-anotaciones-documentviewer-documentsidebar-types-ts.md
---
sldb:
  by: agent
  at: '2026-11-16T05:10:55Z'
  authority: generated
  via: save_document_payload
id: task-retirar-el-código-legacy-huérfano-de-marcado-ui-anotaciones-documentviewer-documentsidebar-types-ts
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:local
current_node: ritual-execution
history: []
references:
- 7f0579a:desk/drawer/report-ui-purpose-gap.md (git show)
depends_on: []
pills: []
files:
- src/components/AnnotationPopup.tsx
- src/components/AnnotationsList.tsx
- src/components/DocumentViewer.tsx
- src/components/DocumentSidebar.tsx
- src/hooks/useAnnotations.ts
- src/hooks/useAnnotationHighlights.ts
- src/types.ts
- src/utils/frontmatter.ts
- src/__tests__/annotationPopup.test.tsx
- src/__tests__/annotationsList.test.tsx
- src/__tests__/documentViewer.test.tsx
- src/__tests__/sidebar.test.tsx
- src/__tests__/useAnnotations.test.ts
- src/__tests__/utils.test.ts
- package.json
- README.md
task_type: task.refactor
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/report-ui-purpose-gap.md
---

# Retirar el código legacy huérfano de marcado-ui (anotaciones, DocumentViewer, DocumentSidebar, types.ts, utils/frontmatter)

## Rationale

_Explain why this task exists or the business driver behind it._

El reporte del drawer (desk/drawer/report-ui-purpose-gap.md, huecos 3, 4 y 5) encontró un subsistema anterior al workspace Marcado que ya no se usa. Verificado el 2026-11-16 sobre el commit 4515a8b: src/App.tsx y src/components/document-workspace.tsx no importan ninguno de estos archivos. Solo se importan entre ellos y desde sus propios tests. Ese código usa los tipos Document/Annotation/Frontmatter de src/types.ts, que no tienen relación con MarcadoDocument, y confunde a quien llega al repo.

## Goal

_Describe the concrete result this task must produce._

Borrar del repo UIs/marcado-ui los archivos legacy sin uso y sus tests, sin cambiar el comportamiento del workspace: las suites vivas siguen verdes con los mismos tests y `npm run build` compila.

## Scope

_State what is in scope and what is out of scope._

ENTRA, borrar exactamente estos archivos:
src/components/AnnotationPopup.tsx, src/components/AnnotationsList.tsx, src/components/DocumentViewer.tsx, src/components/DocumentSidebar.tsx, src/hooks/useAnnotations.ts, src/hooks/useAnnotationHighlights.ts, src/types.ts y src/utils/frontmatter.ts.
Y sus tests: src/__tests__/annotationPopup.test.tsx, annotationsList.test.tsx, documentViewer.test.tsx, sidebar.test.tsx, useAnnotations.test.ts y utils.test.ts.
Además, quitar las referencias que queden en README.md (si las hay) y las dependencias de package.json que solo usaban esos archivos (verificarlo con grep antes de quitar cualquiera).
NO ENTRA: tocar src/App.tsx, src/components/document-workspace.tsx, workspace-shell.tsx, workspace-navigator.tsx ni src/lib/*; agregar funciones nuevas; cambiar estilos.
Si al borrar algo falla la compilación de un archivo vivo, el archivo no estaba huérfano: se restaura, se deja fuera y se anota en el handoff.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo: /home/jp/proyectos/SLDB_1/UIs/marcado-ui, rama main, máquina local.
1) Goldens antes del cambio: `TMPDIR=/dev/shm npx vitest run src/__tests__/integration.test.tsx src/__tests__/marcado-ui.ux.test.tsx src/__tests__/marcado-adapter.test.ts src/__tests__/workspace-state.test.ts`. Guardar la salida en runs/subagents/<run>/goldens-before.txt y registrarla con `deskops review record <task> --kind goldens --evidence <archivo> --reason ... --root .`.
2) `grep -rn "AnnotationPopup\|AnnotationsList\|DocumentViewer\|DocumentSidebar\|useAnnotation\|from \"../types\"\|from '../types'\|utils/frontmatter" src` para confirmar que solo aparecen en los archivos a borrar.
3) `git rm` de los 14 archivos.
4) Repetir el comando de goldens y comparar: los mismos archivos y la misma cantidad de tests pasados.
5) `npm run build`.

## Validation

_List the checks required before this task can close._

- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && npm run build
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && ! grep -rqn "AnnotationPopup\|AnnotationsList\|DocumentViewer\|DocumentSidebar\|useAnnotation\|utils/frontmatter" src

## Done When

_Name the observable condition that makes the task complete._

Los 14 archivos ya no están en HEAD. El grep del paso 2 no devuelve nada en src/. Las cuatro suites vivas pasan con el mismo conteo de tests que en goldens-before.txt. `npm run build` termina con exit 0. `npx vitest run` pasa entero: hoy son 10 archivos y 85 tests; después deben ser 4 archivos, con 85 menos los tests borrados.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-retirar-el-código-legacy-huérfano-de-marcado-ui-anotaciones-documentviewer-documentsidebar-types-ts: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

