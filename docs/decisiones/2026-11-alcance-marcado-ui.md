# Decisión: alcance de marcado-ui (2026-11-16)

Tarea: `task-decisión-de-jp-alcance-de-marcado-ui-ahora-que-sldb-ui-vive-aparte-herramienta-local-app-desplegable`.

## Decisión

**Opción C ampliada: ARCHIVAR.** marcado-ui no recibe trabajo nuevo, ni siquiera mantenimiento. Lo que sirva de este repo pasa a `UIs/sldb-ui` como tarea de ese desk.

- Quién decide: JP. La decisión llegó el 2026-11-16 en la sesión del coordinador de marcado-ui, por medio del supervisor: "marcado-ui queda ARCHIVADO, y lo que valga de él pasa a ser una tarea de sldb-ui".
- El repo de GitHub (jpcosec/sldb-ui) **no** se archiva acá: eso lo decide JP por separado.
- El README lleva un aviso de repo archivado que apunta a `UIs/sldb-ui`.

## Hueco 6 (vista de grafo)

No se hace en marcado-ui. Pasa a sldb-ui junto con el hueco 7, en la nota a sldb-ui. Ahí el coordinador de sldb-ui decide si la vista de grafo se construye o se reutiliza de graph_ui. No se manda nota a graph_ui desde este desk.

## Destino de cada hueco

| Hueco | Descripción | Destino |
|---|---|---|
| 1 | `/api/marcado/export` solo existe en `vite dev` | botado: el repo se archiva |
| 2 | `npm run sync:runtime` es manual, sin CI | botado: el repo se archiva |
| 6 | Aristas como tarjetas estáticas, sin vista de grafo | pasa a sldb-ui (nota) |
| 7 | El inspector no edita el namespace o la clasificación, ni agrega namespaces o aristas | pasa a sldb-ui (nota) |
| 8 | Guardar depende de showSaveFilePicker | botado: el repo se archiva |

En marcado-ui no se crea ninguna tarea nueva.

## Piezas que vale la pena llevar a sldb-ui

- `src/lib/marker-edit.ts`: `removeMarkerFromSource` y `renameMarkerInSource` son funciones puras con 3 tests en `src/__tests__/marker-edit.test.ts`. Se extrajeron en 08db3d0.
- `src/lib/marker-render.ts`: `buildHighlightedMarkdown`, `getTextOffset` y `escapeHtml`, con 5 tests en `src/__tests__/marker-render.test.ts`. También se extrajeron en 08db3d0.
- `src/lib/marcado.ts` (`parseMarcadoDocument`, los tipos `MarkerRange`, `NamespaceInfo`, `GraphEdge` y `MarcadoDocument`) y `src/lib/marcado-runtime.ts` (`runtimeExportToDocument` y la caída al parser de respaldo).
- `src/lib/marcado-adapter.ts` y `src/lib/workspace-state.ts`: el adaptador y el estado del workspace, con sus tests.
- `src/components/document-workspace.tsx:383` (`MarcadoInspectorSurface`): es la base de los huecos 6 y 7. Las aristas se dibujan como tarjetas en las líneas 472-481.

## Tareas abiertas de marcado-ui

- Retirar legacy (649cea7) y extraer helpers (08db3d0): están hechas y probadas, cada una con un tester que dio PASA. Se cierran con supersede citando el archivado, porque el gate de closeout solo acepta tests `.py`.
- Esta decisión: el recibo owner queda registrado y pendiente. Lo firma JP con `deskops review dispose`.
