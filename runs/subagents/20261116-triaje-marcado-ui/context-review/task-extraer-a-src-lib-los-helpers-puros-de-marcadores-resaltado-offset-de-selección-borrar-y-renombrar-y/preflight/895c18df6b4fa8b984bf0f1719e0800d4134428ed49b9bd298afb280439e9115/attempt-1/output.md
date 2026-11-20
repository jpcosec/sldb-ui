## REFORMULACION

Encargo ejecutable (no agregado): en el repo `/home/jp/proyectos/SLDB_1/UIs/marcado-ui` (rama `main`, local), extraer la lógica pura de marcadores a `src/lib/marker-render.ts` (`buildHighlightedMarkdown`, `getTextOffset`, `escapeHtml`) y `src/lib/marker-edit.ts` (`removeMarkerFromSource`, `renameMarkerInSource`), copiando el cuerpo actual de `document-workspace.tsx` y `App.tsx` sin cambios de comportamiento; ajustar imports; añadir 5 tests en `marker-render.test.ts` y 3 en `marker-edit.test.ts`. Resultado observable: módulos exportando las cinco funciones, UI intacta, goldens de 2 archivos/18 tests iguales antes y después, `npm run build` exit 0, sin definiciones residuales en `document-workspace.tsx`. Límites: no corregir bugs (usar `it.fails` y nota), no validar claves duplicadas, no tocar UI, estilos, `src/lib/marcado.ts` ni legacy. Evidencia en `runs/subagents/20261116-marcado-ui-marker-helpers/`.

## AMBIGUEDADES

1. «exactamente el corte de texto que hoy hacen handleDeleteMarker y handleRenameMarker en src/App.tsx (líneas 511 a 553)»: el input no incluye ese código; obligaría a inventar índices y concatenaciones.
2. «offsets openMarkerStart/End y closeMarkerStart/End de MarkerRange, relativos al cuerpo después de bodySourceStart»: no aclara si las nuevas funciones suman `bodySourceStart` o reciben offsets absolutos; obligaría a inventar la aritmética.
3. «title con comillas y < >: sale escapado»: no especifica el conjunto de caracteres ni entidades; obligaría a inventar el escaping.
4. «si node es de texto, offset cuenta caracteres, y si no, hijos»: no define el caso de nodos mixtos/anidados ni `container` no relacionado; obligaría a inventar recorrido.
5. «importado con ?raw»: no indica si hay tipado/configuración para esa importación; obligaría a inventar soporte.
6. «todos pasados o, si alguno revela un bug, marcado it.fails y anotado»: no fija criterio de bug ni formato de anotación; obligaría a inventar umbral.

## DRY-RUN

Lecturas: `document-workspace.tsx` (~611–665), `App.tsx` (511–553), `src/lib/marcado.ts`, `marcado-canonical-example.md`, `vite.config.ts`, suites de integración/UX. Cambios: crear dos módulos, eliminar definiciones locales e importar, crear dos tests. Dependencias: tipo `MarkerRange`, `parseMarcadoDocument`, jsdom, `deskops`, vitest. Validaciones futuras: goldens antes/después comparados por archivo y conteo, tests dirigidos, suite completa, build, grep negativo.

## FUTURO

Otro nodo/ejecutor genera `goldens-before.txt`, registra evidencia y produce `result-summary.md`; un humano decide si un `it.fails` revela bug y revisa el cierre.
