## REFORMULACION

Tarea ejecutable (`task.refactor`) sobre el repo `/mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui` (rama main, robocop2). Propósito: sacar de los componentes la lógica pura que reescribe el texto Marcado hoy sin tests unitarios, para cubrirla y evitar corrupciones de offsets. Resultado: crear `src/lib/marker-render.ts` (`buildHighlightedMarkdown`, `getTextOffset`, `escapeHtml`) y `src/lib/marker-edit.ts` (`removeMarkerFromSource`, `renameMarkerInSource`) copiando literalmente el cuerpo actual, ajustar imports en `document-workspace.tsx` y `App.tsx`, y añadir `marker-render.test.ts` (5 casos) y `marker-edit.test.ts` (3 casos). Límites: sin cambios de comportamiento/UI/estilos, sin tocar `src/lib/marcado.ts` ni anotaciones legacy, sin corregir bugs (se marcan `it.fails` y se anotan en `runs/subagents/20261116-marcado-ui-marker-helpers/result-summary.md`), sin validar claves duplicadas. Evidencia en `runs/subagents/20261116-marcado-ui-marker-helpers/`.

## AMBIGUEDADES

1. "el offset dentro del texto del `<strong>` es la suma correcta": no fija el número esperado; obligaría a inventar el valor o a deducirlo ejecutando, algo vedado aquí.
2. "buildHighlightedMarkdown(markdown: string, markers: MarkerRange[])": no dice de qué módulo importar `MarkerRange`; obligaría a inventar ruta y tipo.
3. "class "marker-highlight" seguido de los namespaces en el orden del arreglo markers sin repetir": no fija el formato exacto de la cadena (separadores, prefijo por namespace); obligaría a inventar la aserción literal.
4. "title con comillas y < >: sale escapado": no indica entidades ni orden de escape; obligaría a inventar el esperado.

## DRY-RUN

Lecturas previstas: `src/components/document-workspace.tsx` (~611-665), `src/App.tsx` (511-553), `src/lib/marcado.ts`, `src/data/marcado-canonical-example.md`, `vite.config.ts`, suites de integración/UX y el reporte del drawer. Cambios: crear los dos módulos `src/lib` con las cinco exportaciones copiadas; borrar definiciones locales e importarlas; añadir los dos test. Dependencias: vitest+jsdom, `npm run build`. Validaciones futuras: goldens-before/after (2 archivos, 18 pasados), `vitest run` de los dos test nuevos, `vitest run` completo, `npm run build`, y `grep` de que ya no existen las funciones en `document-workspace.tsx`.

## FUTURO

El registro de goldens (`deskops review record …`) y el commit/rama los ejecuta otro nodo u operador; la decisión sobre bugs revelados (aceptar `it.fails` o abrir tarea) es humana.
