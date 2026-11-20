FILE:desk/tasks/task-decisión-de-jp-alcance-de-marcado-ui-ahora-que-sldb-ui-vive-aparte-herramienta-local-app-desplegable.md
---
sldb:
  by: agent
  at: '2026-11-16T05:17:01Z'
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
- El coordinador del desk UIs/marcado-ui (una sesión de Claude con el rol deskops-supervisor) le presenta a JP las opciones A, B y C y la pregunta del hueco 6. El canal es la conversación con JP en esa sesión: la pregunta va escrita en el informe /home/jp/proyectos/SLDB_1/reports/triaje-marcado-ui-20261116.md y se repite en el chat. La respuesta cuenta solo cuando JP la escribe en el chat.
- Registrar la respuesta en docs/decisiones/2026-11-alcance-marcado-ui.md: la línea "Opción A", "Opción B" u "Opción C" literal, la respuesta del hueco 6 y una tabla de los huecos 1, 2, 6, 7 y 8 con su destino.
- Registrar el recibo owner: deskops review record task-decisión-de-jp-alcance-de-marcado-ui-ahora-que-sldb-ui-vive-aparte-herramienta-local-app-desplegable --kind owner --evidence docs/decisiones/2026-11-alcance-marcado-ui.md --reason "JP eligió la opción <letra> en la sesión del coordinador, <fecha>" --root .
- Por cada hueco que JP acepte, una tarea con deskops add task y su contrato completo (tipo, why, goal, scope, implementation_path, files, validation, done_when), etiquetada host:local si es UI o host:robocop2 si es CI o servidor, con sus propias revisiones preflight y bundle. Esa tarea nueva hace su propio desglose; este nodo solo garantiza que exista una tarea por hueco aceptado.
- Si JP quiere la vista de grafo en graph_ui, enviar deskops message send --to graph_ui --kind suggestion con el pedido, y anotar su id en el documento.
NO ENTRA:
- implementar nada;
- tocar UIs/sldb-ui, UIs/marcado (el runtime Python) o graph_ui, salvo con la nota;
- las tareas de limpieza del legacy y de tests de los helpers, que ya existen.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) El coordinador presenta las opciones como lo dice el scope.
2) JP responde en el chat.
3) Se escribe docs/decisiones/2026-11-alcance-marcado-ui.md y se registra el recibo owner con el comando del scope.
4) Se crean las tareas o la nota a graph_ui que correspondan.
5) Se commitean solo desk/, .sldb/core y docs/decisiones/, con el mensaje "desk: decisión de alcance de marcado-ui (opción <letra>) [skip ci]", en main, y se hace push.

## Validation

_List the checks required before this task can close._

- test -s /home/jp/proyectos/SLDB_1/UIs/marcado-ui/docs/decisiones/2026-11-alcance-marcado-ui.md
- grep -E "Opción (A|B|C)" /home/jp/proyectos/SLDB_1/UIs/marcado-ui/docs/decisiones/2026-11-alcance-marcado-ui.md

## Done When

_Name the observable condition that makes the task complete._

- docs/decisiones/2026-11-alcance-marcado-ui.md existe y nombra la opción (A, B o C) y la respuesta sobre el hueco 6.
- Cada hueco (1, 2, 6, 7 y 8) figura como tarea creada (con su id) o como botado (con su razón).
- El recibo owner está aceptado y el commit está en main.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-decisión-de-jp-alcance-de-marcado-ui-ahora-que-sldb-ui-vive-aparte-herramienta-local-app-desplegable: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

