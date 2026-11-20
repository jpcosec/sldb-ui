FILE:desk/tasks/task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y.md
---
sldb:
  by: agent
  at: '2026-11-16T05:10:57Z'
  authority: generated
  via: save_document_payload
id: task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y
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
- src/lib/marker-render.ts
- src/lib/marker-edit.ts
- src/components/document-workspace.tsx
- src/App.tsx
- src/__tests__/marker-render.test.ts
- src/__tests__/marker-edit.test.ts
- src/data/marcado-canonical-example.md
task_type: task.refactor
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/report-ui-purpose-gap.md
---

# Extraer a src/lib los helpers puros de marcadores (resaltado, offset de selección, borrar y renombrar) y cubrirlos con tests unitarios

## Rationale

_Explain why this task exists or the business driver behind it._

El hueco 10 del reporte del drawer (desk/drawer/report-ui-purpose-gap.md) señala que la lógica que reescribe el texto fuente de un documento Marcado no tiene tests unitarios; solo se prueba de forma indirecta, renderizando App con React Testing Library. Esa lógica está repartida así (verificado el 2026-11-16 en el commit 4515a8b):
- buildHighlightedMarkdown, getTextOffset y escapeHtml: funciones no exportadas en src/components/document-workspace.tsx, cerca de las líneas 611 a 665.
- El corte de texto de handleDeleteMarker y handleRenameMarker: closures dentro de src/App.tsx, líneas 511 a 553, que usan los offsets openMarkerStart/End y closeMarkerStart/End de MarkerRange, relativos al cuerpo después de bodySourceStart.
Un error de offset en estas funciones corrompe el documento del usuario sin que ningún test lo detecte.

## Goal

_Describe the concrete result this task must produce._

Dejar esas funciones como funciones puras exportadas en src/lib, con tests unitarios propios, sin cambiar el comportamiento de la UI.

## Scope

_State what is in scope and what is out of scope._

ENTRA:
(a) Crear src/lib/marker-render.ts con buildHighlightedMarkdown(markdown, markers), getTextOffset(container, node, offset) y escapeHtml(value), movidas sin cambios de lógica desde document-workspace.tsx, que pasa a importarlas.
(b) Crear src/lib/marker-edit.ts con removeMarkerFromSource(source, bodySourceStart, marker): string y renameMarkerInSource(source, bodySourceStart, marker, nextKey): string. Contienen exactamente el corte de texto que hoy hacen handleDeleteMarker y handleRenameMarker. App.tsx las llama y conserva el window.prompt, el estado y los avisos.
(c) Tests en src/__tests__/marker-render.test.ts y src/__tests__/marker-edit.test.ts:
  - sin marcadores;
  - un marcador;
  - marcadores solapados de dos namespaces (las clases marker-highlight-<ns> combinadas y data-marker-count);
  - escape de comillas y < > en el title;
  - getTextOffset sobre un DOM jsdom con nodos anidados;
  - borrar un marcador deja el texto interior intacto y quita el marcador de apertura y el de cierre;
  - renombrar cambia la clave en la apertura y en el cierre y no toca otras ocurrencias del texto;
  - un documento con frontmatter (bodySourceStart > 0), usando src/data/marcado-canonical-example.md.
NO ENTRA:
- corregir bugs que aparezcan; si un test revela uno, se deja el test marcado con it.fails y una nota en el handoff;
- cambiar la UI, los estilos o el parser (src/lib/marcado.ts);
- tocar el código legacy de anotaciones, que es otra tarea.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo: /home/jp/proyectos/SLDB_1/UIs/marcado-ui, rama main, máquina local.
1) Goldens: `TMPDIR=/dev/shm npx vitest run src/__tests__/integration.test.tsx src/__tests__/marcado-ui.ux.test.tsx` antes del cambio, con la salida guardada en runs/subagents/<run>/goldens-before.txt y registrada con `deskops review record <task> --kind goldens --evidence <archivo> --reason ... --root .`.
2) Mover las tres funciones a src/lib/marker-render.ts y extraer las dos funciones de edición a src/lib/marker-edit.ts.
3) Ajustar los imports en src/components/document-workspace.tsx y src/App.tsx.
4) Escribir los dos archivos de test.
5) Repetir los goldens: mismos resultados.
6) `npm run build`.

## Validation

_List the checks required before this task can close._

- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run src/__tests__/marker-render.test.ts src/__tests__/marker-edit.test.ts
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && npm run build
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && ! grep -n "function buildHighlightedMarkdown\|function getTextOffset" src/components/document-workspace.tsx

## Done When

_Name the observable condition that makes the task complete._

- src/lib/marker-render.ts y src/lib/marker-edit.ts existen y exportan las cinco funciones.
- document-workspace.tsx ya no define buildHighlightedMarkdown, getTextOffset ni escapeHtml.
- App.tsx ya no corta texto con body.slice para borrar o renombrar marcadores.
- Los dos tests nuevos pasan y cubren los ocho casos del scope.
- integration y marcado-ui.ux pasan con el mismo conteo que en goldens-before.txt.
- `npm run build` termina con exit 0.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

