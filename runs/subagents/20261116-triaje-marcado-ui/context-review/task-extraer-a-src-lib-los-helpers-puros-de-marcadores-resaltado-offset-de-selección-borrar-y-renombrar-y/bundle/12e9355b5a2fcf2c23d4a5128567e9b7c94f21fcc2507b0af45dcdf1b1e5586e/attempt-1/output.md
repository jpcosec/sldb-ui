## REFORMULACION

El nodo debe cerrar el hueco 10 de `desk/drawer/report-ui-purpose-gap.md`: extraer la lógica pura que hoy vive en `document-workspace.tsx` y `App.tsx` a `src/lib/marker-render.ts` y `src/lib/marker-edit.ts`, exportando `buildHighlightedMarkdown`, `getTextOffset`, `escapeHtml`, `removeMarkerFromSource` y `renameMarkerInSource`, sin cambiar la UI. Debe añadir tests unitarios en `src/__tests__/marker-render.test.ts` y `marker-edit.test.ts`, mantener los goldens de `integration` y `marcado-ui.ux`, y pasar `npm run build`. Repo: `/home/jp/proyectos/SLDB_1/UIs/marcado-ui`, rama `main`, máquina local. Límites: no corregir bugs revelados —dejarlos como `it.fails` y anotarlos en el handoff—, no tocar UI, estilos ni `src/lib/marcado.ts`, y no tocar el código legacy de anotaciones.

## AMBIGUEDADES

1. `runs/subagents/<run>/goldens-before.txt`: el marcador `<run>` no está definido; obliga a inventar el identificador y la ruta exacta del run.
2. `deskops review record <task> --kind goldens ...`: no se concreta la sintaxis final ni si `<task>` es el id completo; obliga a inventar argumentos.
3. `getTextOffset sobre un DOM jsdom con nodos anidados`: no se indica si el entorno jsdom se activa por configuración global o por directiva en el test; obliga a inventar el mecanismo.
4. `un documento con frontmatter (bodySourceStart > 0), usando src/data/marcado-canonical-example.md`: no se dice cómo obtener `bodySourceStart` ni si se importa el parser; obliga a inventar la llamada o un offset fijo.
5. `se deja el test marcado con it.fails y una nota en el handoff`: no se define formato ni ubicación del handoff; obliga a inventar ambos.
6. `Los dos tests nuevos pasan y cubren los ocho casos del scope`: no se especifica si cada caso es un `it` separado o varios casos por archivo; obliga a inventar la estructura.

## DRY-RUN

Lecturas previstas: TaskDoc, reporte del drawer, `document-workspace.tsx`, `App.tsx`, `marcado.ts`, tests existentes, `package.json` y configuración de Vitest. Cambios previstos: crear los dos módulos lib moviendo la lógica sin alterarla, actualizar imports en los dos componentes y escribir los dos tests. Dependencias: Vitest, jsdom, React Testing Library y el parser Marcado. Validaciones futuras: ejecutar goldens antes y después, tests nuevos, suite completa, `npm run build` y el `grep` de comprobación. Nada se ejecuta aquí.

## FUTURO

Un humano o nodo de ejecución debe fijar el `<run>` y registrar la evidencia de goldens; decidir qué hacer si un test revela un bug; actualizar el Board y cerrar la tarea; y preparar el commit final.
