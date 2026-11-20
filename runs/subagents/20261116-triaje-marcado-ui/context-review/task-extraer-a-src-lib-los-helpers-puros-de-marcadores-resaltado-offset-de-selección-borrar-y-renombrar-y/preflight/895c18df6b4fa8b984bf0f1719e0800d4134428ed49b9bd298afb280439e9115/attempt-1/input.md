FILE:desk/tasks/task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y.md
---
sldb:
  by: agent
  at: '2026-11-16T05:16:43Z'
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
(a) Crear src/lib/marker-render.ts con buildHighlightedMarkdown(markdown: string, markers: MarkerRange[]): string, getTextOffset(container: Node, node: Node, offset: number): number y escapeHtml(value: string): string. Se copian tal cual desde src/components/document-workspace.tsx: mismo cuerpo, ahora exportadas. document-workspace.tsx las importa y ya no las define. getTextOffset devuelve el número de caracteres de texto de container que hay antes de la posición (node, offset), el par que entrega Selection.getRangeAt(0); si node es de texto, offset cuenta caracteres, y si no, hijos.
(b) Crear src/lib/marker-edit.ts con removeMarkerFromSource(source: string, bodySourceStart: number, marker: MarkerRange): string y renameMarkerInSource(source: string, bodySourceStart: number, marker: MarkerRange, nextKey: string): string, con exactamente el corte de texto que hoy hacen handleDeleteMarker y handleRenameMarker en src/App.tsx (líneas 511 a 553). App.tsx las llama y conserva window.prompt, el estado, setDocumentModes y los avisos.
(c) Tests. Cada caso es un it; los valores esperados son los que produce hoy el código movido sin cambios.
src/__tests__/marker-render.test.ts:
- sin marcadores: devuelve el markdown igual;
- un marcador: un span con class "marker-highlight marker-highlight-<ns>", title igual a la clave y data-marker-count="1";
- dos marcadores solapados de namespaces distintos: en el tramo común, class "marker-highlight" seguido de los namespaces en el orden del arreglo markers sin repetir, y data-marker-count="2";
- title con comillas y < >: sale escapado;
- getTextOffset sobre un div jsdom con un <p> que contiene un <strong>: el offset dentro del texto del <strong> es la suma correcta.
src/__tests__/marker-edit.test.ts:
- borrar quita la apertura y el cierre y deja el texto interior;
- renombrar cambia la clave en la apertura y en el cierre, y no toca otra aparición del mismo texto en el cuerpo;
- con el frontmatter de src/data/marcado-canonical-example.md (importado con ?raw), donde bodySourceStart y los marcadores salen de parseMarcadoDocument(slug, source) en src/lib/marcado.ts: el frontmatter queda intacto.
El entorno jsdom ya está activo en vite.config.ts (test.environment = jsdom); no hace falta directiva.
NO ENTRA:
- corregir bugs: si un test revela uno, se deja con it.fails y una nota en runs/subagents/20261116-marcado-ui-marker-helpers/result-summary.md;
- validar claves duplicadas al renombrar: hoy no se valida, y sigue igual;
- tocar la UI, los estilos, src/lib/marcado.ts o el código legacy de anotaciones, que es otra tarea.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /home/jp/proyectos/SLDB_1/UIs/marcado-ui, rama main, máquina local. Run de evidencia: runs/subagents/20261116-marcado-ui-marker-helpers/.
1) Goldens antes del cambio: TMPDIR=/dev/shm npx vitest run src/__tests__/integration.test.tsx src/__tests__/marcado-ui.ux.test.tsx > runs/subagents/20261116-marcado-ui-marker-helpers/goldens-before.txt 2>&1. Hoy da 2 archivos y 18 tests pasados.
2) Registrar los goldens: deskops review record task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y --kind goldens --evidence runs/subagents/20261116-marcado-ui-marker-helpers/goldens-before.txt --reason "suites de UI antes de extraer helpers" --root .
3) Crear los dos módulos de src/lib y ajustar los imports de document-workspace.tsx y App.tsx.
4) Escribir los dos archivos de test.
5) Repetir el comando del paso 1 hacia goldens-after.txt. Se compara por archivo y por conteo: los mismos 2 archivos, 18 pasados y 0 fallidos.
6) npm run build.
7) npx vitest run completo.

## Validation

_List the checks required before this task can close._

- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run src/__tests__/marker-render.test.ts src/__tests__/marker-edit.test.ts
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && npm run build
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && ! grep -n "function buildHighlightedMarkdown\|function getTextOffset" src/components/document-workspace.tsx

## Done When

_Name the observable condition that makes the task complete._

src/lib/marker-render.ts y src/lib/marker-edit.ts existen y exportan las cinco funciones. document-workspace.tsx ya no define buildHighlightedMarkdown, getTextOffset ni escapeHtml. App.tsx ya no corta texto con body.slice para borrar o renombrar marcadores. marker-render.test.ts tiene 5 casos y marker-edit.test.ts tiene 3, todos pasados o, si alguno revela un bug, marcado it.fails y anotado. goldens-after.txt da 2 archivos y 18 tests pasados. npm run build termina con exit 0.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

