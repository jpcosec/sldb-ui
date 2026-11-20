## REFORMULACION

**Propósito:** sacar de los componentes la lógica pura que reescribe el fuente Marcado, para testearla sin React. **Resultado:** `src/lib/marker-render.ts` (buildHighlightedMarkdown, getTextOffset, escapeHtml) y `src/lib/marker-edit.ts` (removeMarkerFromSource, renameMarkerInSource) exportados, con `__tests__/marker-render.test.ts` y `__tests__/marker-edit.test.ts` cubriendo los ocho casos; `document-workspace.tsx` y `App.tsx` importan, sin cambiar comportamiento. **Repo:** `/home/jp/proyectos/SLDB_1/UIs/marcado-ui`, rama main, local. **Límites:** no corregir bugs (dejar `it.fails` y nota); no tocar UI, estilos, `src/lib/marcado.ts` ni legacy de anotaciones.

## AMBIGUEDADES

1. «getTextOffset(container, node, offset)»: sin tipos ni semántica; obliga a inventar si `container` es HTMLElement y qué mide `offset`.
2. «las clases marker-highlight-<ns> combinadas y data-marker-count»: no fija orden de clases ni qué cuenta con solapes; habría que inventar el HTML esperado.
3. «renombrar cambia la clave en la apertura y en el cierre y no toca otras ocurrencias del texto»: no dice qué hacer si `nextKey` ya existe; obliga a inventar política de duplicados.
4. «un documento con frontmatter (bodySourceStart > 0)»: no indica cómo obtener ese valor; obliga a inventar si se calcula o se fija a mano.
5. «mismos resultados» (Implementation Path) frente a «el mismo conteo» (Done When): no aclara si comparar valores o solo recuentos.

## DRY-RUN

**Lecturas:** TaskDoc, `App.tsx` (511–553), `document-workspace.tsx` (611–665), `marcado.ts`, `marcado-canonical-example.md`, tests de integración existentes. **Cambios previstos:** crear los dos módulos lib, reescribir imports, crear los dos tests. **Dependencias:** goldens previos con `vitest run` y `deskops review record`; vitest con jsdom; `npm run build`. **Validaciones futuras:** los cuatro comandos de Validation, comparación de goldens y build exit 0. Nada se ejecuta aquí.

## FUTURO

El nodo ejecutor produce `goldens-before.txt` y los cambios; `deskops` registra la evidencia; un humano decide sobre bugs revelados (`it.fails`) y aprueba el cierre.
