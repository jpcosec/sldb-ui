---
sldb:
  by: agent
  at: '2026-11-16T15:34:14Z'
  authority: generated
  via: save_document_payload
# board-xxx
id: board-001
# Affected workspace or domain
scope: desk
# List of task-xxx paths
tasks:
- desk/tasks/task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y.md
- desk/tasks/task-decisión-de-jp-alcance-de-marcado-ui-ahora-que-sldb-ui-vive-aparte-herramienta-local-app-desplegable.md
# List of pill-xxx paths
pills:
- desk/contexts/pills.md
# List of ritual-xxx paths
rituals:
- desk/rituals/execution.md
- desk/rituals/testing.md
- desk/rituals/closeout.md
# e.g., system:sldb, workspace:desk
tags:
- workspace:desk
---

# marcado-ui Board

## Purpose

_Explain what this board routes and why it exists._

Route the active execution set for marcado-ui.

## Notes

_Add short operational notes about the current routed set._

Bootstrap complete. Add active task docs under `desk/tasks/` and route them here.

## Task Details

_Generated from the task references above._

- Extraer a src/lib los helpers puros de marcadores (resaltado, offset de selección, borrar y renombrar) y cubrirlos con tests unitarios [draft] - Dejar esas funciones como funciones puras exportadas en src/lib, con tests unitarios propios, sin cambiar el comportamiento de la UI.
- Decisión de JP: alcance de marcado-ui ahora que sldb-ui vive aparte (¿herramienta local, app desplegable o solo mantenimiento?) y qué huecos de interacción entran [draft] - Una decisión escrita de JP en docs/decisiones/2026-11-alcance-marcado-ui.md, que elija una opción:
(A) Herramienta local de desarrollo: se usa con `npm run dev` en la máquina local. Se botan 1, 2 y 8 y se crea una tarea task.code para el hueco 7.
(B) App desplegable: se crean tareas para un endpoint de runtime de producción (1), para regenerar en CI los .runtime.json (2) y para guardar en servidor (8), además del hueco 7.
(C) Solo mantenimiento: se botan 1, 2, 6, 7 y 8.
Además, una respuesta explícita sobre el hueco 6: la vista de grafo va en marcado-ui o se descarta. graph_ui ya dibuja grafos, y si JP quiere reusarlo, eso se manda a graph_ui como nota.
