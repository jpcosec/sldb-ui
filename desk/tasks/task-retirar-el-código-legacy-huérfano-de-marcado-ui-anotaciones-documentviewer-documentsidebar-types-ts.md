---
sldb:
  by: agent
  at: '2026-11-16T05:16:15Z'
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

ENTRA: borrar con git rm exactamente estos 14 archivos y nada más. Fuentes (8): src/components/AnnotationPopup.tsx, src/components/AnnotationsList.tsx, src/components/DocumentViewer.tsx, src/components/DocumentSidebar.tsx, src/hooks/useAnnotations.ts, src/hooks/useAnnotationHighlights.ts, src/types.ts, src/utils/frontmatter.ts. Tests (6, con 62 tests en total): src/__tests__/annotationPopup.test.tsx (12), annotationsList.test.tsx (7), documentViewer.test.tsx (9), sidebar.test.tsx (15), useAnnotations.test.ts (11), utils.test.ts (8). NO ENTRA: package.json (verificado el 2026-11-16: react, react-icons/fi, react-markdown y remark-gfm, las únicas dependencias externas de esos archivos, también las usan src/App.tsx y src/components/document-workspace.tsx, así que no se quita ninguna dependencia); README.md (no menciona ninguno de esos archivos; sus rutas tools/marcado-ui no son de esta tarea); src/App.tsx, src/components/document-workspace.tsx, workspace-shell.tsx, workspace-navigator.tsx, src/lib/*, funciones nuevas o estilos. Regla de parada: si el grep del paso 2 encuentra una coincidencia en un archivo que no está en la lista, ese archivo vivo depende de algo de la lista. En ese caso no se borra el archivo de la lista del que depende, se sigue con el resto y se anota en runs/subagents/20261116-marcado-ui-legacy/result-summary.md qué archivo vivo lo importa. Si la compilación de un archivo vivo falla después de un borrado, se aplica la misma regla: git restore del archivo borrado y nota en result-summary.md.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /home/jp/proyectos/SLDB_1/UIs/marcado-ui, rama main, máquina local. Directorio de evidencia (run): runs/subagents/20261116-marcado-ui-legacy/. 1) Goldens antes del cambio: TMPDIR=/dev/shm npx vitest run src/__tests__/integration.test.tsx src/__tests__/marcado-ui.ux.test.tsx src/__tests__/marcado-adapter.test.ts src/__tests__/workspace-state.test.ts > runs/subagents/20261116-marcado-ui-legacy/goldens-before.txt 2>&1. Hoy da 4 archivos y 23 tests pasados (9+9+3+2). Registrarlo: deskops review record task-retirar-el-código-legacy-huérfano-de-marcado-ui-anotaciones-documentviewer-documentsidebar-types-ts --kind goldens --evidence runs/subagents/20261116-marcado-ui-legacy/goldens-before.txt --reason "suites vivas antes de borrar el legacy" --root . 2) grep -rnE "AnnotationPopup|AnnotationsList|DocumentViewer|DocumentSidebar|useAnnotation|/types[\"']|utils/frontmatter" src : todas las coincidencias deben estar en los 14 archivos de la lista; si no, aplicar la regla de parada del scope. 3) git rm de los 14 archivos. 4) Repetir el comando del paso 1 hacia goldens-after.txt y comparar: los mismos 4 archivos, 23 tests pasados y 0 fallidos. 5) npm run build. 6) TMPDIR=/dev/shm npx vitest run completo.

## Validation

_List the checks required before this task can close._

- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && npm run build
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && ! grep -rnE "AnnotationPopup|AnnotationsList|DocumentViewer|DocumentSidebar|useAnnotation|utils/frontmatter" src

## Done When

_Name the observable condition that makes the task complete._

Los 14 archivos ya no están en HEAD (salvo los que haya retenido la regla de parada, anotados en result-summary.md). El grep del paso 2 no devuelve nada en src/. goldens-after.txt muestra 4 archivos y 23 tests pasados, igual que goldens-before.txt. npm run build termina con exit 0. npx vitest run completo informa 4 archivos de test y 23 tests, todos pasados (antes eran 10 archivos y 85 tests).
