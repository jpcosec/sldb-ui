## REFORMULACION
Nodo ejecutable (`task.refactor`), no agregado. **Propósito:** cerrar el hueco 10 del reporte: la lógica que reescribe fuente Marcado solo se prueba indirectamente. **Resultado:** `src/lib/marker-render.ts` exporta `buildHighlightedMarkdown`, `getTextOffset`, `escapeHtml`; `src/lib/marker-edit.ts` exporta `removeMarkerFromSource`, `renameMarkerInSource`; `document-workspace.tsx` y `App.tsx` las consumen; 8 tests unitarios. **Repo:** `/home/jp/proyectos/SLDB_1/UIs/marcado-ui`, rama `main`, local. **Límites:** copiar lógica sin cambiar comportamiento; no corregir bugs; no validar claves duplicadas; no tocar estilos, `src/lib/marcado.ts` ni legacy de anotaciones.

## AMBIGUEDADES
1. “funciones puras exportadas en src/lib” frente a `getTextOffset(container: Node, node: Node, offset: number): number`. Obligaría a inventar si depender de `Node`/DOM sigue siendo “puro” o si se requiere adaptador.
2. “sin cambiar el comportamiento de la UI” y “NO ENTRA: tocar la UI” frente a “document-workspace.tsx las importa” y “App.tsx las llama”. Obligaría a decidir si editar imports/llamadas cuenta como tocar UI.
3. “si un test revela uno, se deja con it.fails y una nota” frente a “todos pasados o, si alguno revela un bug, marcado it.fails”. Obligaría a decidir si un fallo esperado cierra la tarea y cómo se contabiliza.
4. “Hoy da 2 archivos y 18 tests pasados.” No se ejecutó nada; si difiere, el input no indica abortar ni cómo registrar la diferencia. Obligaría a inventar umbral.

## DRY-RUN
Lecturas: TaskDoc, reporte del drawer, `document-workspace.tsx`, `App.tsx`, `src/lib/marcado.ts`, tests/config existentes, ejemplo canónico y goldens previos. Cambios previstos: crear dos módulos, reemplazar definiciones por imports, sustituir cortes inline por funciones, añadir dos suites. Dependencias: `MarkerRange`, `parseMarcadoDocument`, jsdom/vitest, import `?raw`. Validaciones futuras: las cuatro órdenes de `Validation`, comparación de goldens y `npm run build`. Sin ejecutar.

## FUTURO
Un ejecutor futuro produce goldens, módulos, tests y resultados. Un humano/revisor decide los conflictos 1–4, acepta o rechaza `it.fails`, autoriza commit y cierre de board según closeout.
