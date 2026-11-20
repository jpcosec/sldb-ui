FILE:desk/tasks/task-decisión-de-jp-alcance-de-marcado-ui-ahora-que-sldb-ui-vive-aparte-herramienta-local-app-desplegable.md
---
sldb:
  by: agent
  at: '2026-11-16T05:11:00Z'
  authority: generated
  via: save_document_payload
id: task-decisión-de-jp-alcance-de-marcado-ui-ahora-que-sldb-ui-vive-aparte-herramienta-local-app-desplegable
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
- vite.config.ts
- scripts/sync-marcado-runtime.mjs
depends_on: []
pills: []
files:
- docs/decisiones/2026-11-alcance-marcado-ui.md
task_type: task.decision
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/report-ui-purpose-gap.md
---

# Decisión de JP: alcance de marcado-ui ahora que sldb-ui vive aparte (¿herramienta local, app desplegable o solo mantenimiento?) y qué huecos de interacción entran

## Rationale

_Explain why this task exists or the business driver behind it._

El checkout UIs/marcado-ui (remoto github jpcosec/sldb-ui) se reencuadró como sldb-ui y después volvió a marcado-ui; ese cambio quedó commiteado como 7f0579a el 2026-11-16. Ahora sldb-ui es un proyecto aparte en UIs/sldb-ui (Astro).
El reporte del drawer (desk/drawer/report-ui-purpose-gap.md, también en git en 7f0579a) deja seis huecos que no se pueden convertir en código sin saber para qué existe marcado-ui:
(1) /api/marcado/export solo existe en `vite dev` (plugin marcadoRuntimePlugin con configureServer en vite.config.ts); en un build de producción, el botón "Refresh runtime" cae siempre al parser de respaldo.
(2) `npm run sync:runtime` es manual y ningún CI regenera src/data/runtime/*.runtime.json.
(6) Las aristas de grafo se muestran como tarjetas estáticas: no hay vista de grafo ni navegación de marcador a arista.
(7) El inspector no puede cambiar el namespace o la clasificación de un marcador, ni agregar un namespace al frontmatter o una arista en graphs.
(8) Guardar depende de showSaveFilePicker; en Firefox y Safari solo queda descargar, y no hay guardado en servidor.
(9) "Refresh runtime" reemplaza el modelo entero.
Ese último hueco ya se botó en el triaje, por especulativo. Los otros cinco dependen del destino del producto, y eso lo decide solo JP.

## Goal

_Describe the concrete result this task must produce._

Una decisión escrita de JP en docs/decisiones/2026-11-alcance-marcado-ui.md, que elija una opción:
(A) Herramienta local de desarrollo: se usa con `npm run dev` en la máquina local. Se botan 1, 2 y 8 y se crea una tarea task.code para el hueco 7.
(B) App desplegable: se crean tareas para un endpoint de runtime de producción (1), para regenerar en CI los .runtime.json (2) y para guardar en servidor (8), además del hueco 7.
(C) Solo mantenimiento: se botan 1, 2, 6, 7 y 8.
Además, una respuesta explícita sobre el hueco 6: la vista de grafo va en marcado-ui o se descarta. graph_ui ya dibuja grafos, y si JP quiere reusarlo, eso se manda a graph_ui como nota.

## Scope

_State what is in scope and what is out of scope._

ENTRA:
- presentar a JP las opciones A, B y C y la pregunta del hueco 6, con la evidencia del reporte;
- registrar el recibo owner con `deskops review record <task> --kind owner --evidence docs/decisiones/2026-11-alcance-marcado-ui.md --reason ... --root .`;
- escribir el documento de decisión;
- según la respuesta, crear las tareas de código con deskops add task (host:local para la UI; host:robocop2 para CI o servidor) o dejar constancia de lo que se bota.
NO ENTRA:
- implementar nada;
- tocar UIs/sldb-ui, UIs/marcado (el runtime Python) ni graph_ui;
- las dos tareas de limpieza y tests que salieron del mismo reporte, que ya existen aparte.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) El coordinador de UIs/marcado-ui presenta a JP las opciones y la pregunta del hueco 6.
2) JP responde y el coordinador registra el recibo owner.
3) Se escribe docs/decisiones/2026-11-alcance-marcado-ui.md con la opción elegida, lo que se crea y lo que se bota.
4) Se crean las tareas que correspondan y se commitea con [skip ci].

## Validation

_List the checks required before this task can close._

- test -s /home/jp/proyectos/SLDB_1/UIs/marcado-ui/docs/decisiones/2026-11-alcance-marcado-ui.md
- grep -E "Opción (A|B|C)" /home/jp/proyectos/SLDB_1/UIs/marcado-ui/docs/decisiones/2026-11-alcance-marcado-ui.md

## Done When

_Name the observable condition that makes the task complete._

- docs/decisiones/2026-11-alcance-marcado-ui.md existe y nombra la opción (A, B o C) y la respuesta sobre el hueco 6.
- Cada hueco (1, 2, 6, 7 y 8) figura como tarea creada (con su id) o como botado (con su razón).
- El recibo owner está aceptado y el commit está en main.

FILE:desk/rituals/execution.md
---
id: ritual-execution
steps: []
tags:
- workspace:desk
---

# Execution ritual

Review the board, bind the relevant pills, keep scope tight, and implement only the active task for marcado-ui.

FILE:desk/rituals/testing.md
---
id: ritual-testing
steps: []
tags:
- workspace:desk
---

# Testing ritual

Run the smallest relevant validation first, then broaden coverage when marcado-ui changes shared behavior.

FILE:desk/rituals/closeout.md
---
id: ritual-closeout
steps: []
tags:
- workspace:desk
---

# Closeout ritual

Close a marcado-ui task only after validation passes, the board is updated, and the final change is ready to commit.

FILE:instruccion
Cold-bundle de la tarea task-decisión-de-jp-alcance-de-marcado-ui-ahora-que-sldb-ui-vive-aparte-herramienta-local-app-desplegable: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- test -s /home/jp/proyectos/SLDB_1/UIs/marcado-ui/docs/decisiones/2026-11-alcance-marcado-ui.md
- grep -E "Opción (A|B|C)" /home/jp/proyectos/SLDB_1/UIs/marcado-ui/docs/decisiones/2026-11-alcance-marcado-ui.md

