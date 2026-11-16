REFORMULACION
Propósito: sacar de la UI la lógica que reescribe el fuente Marcado y darle tests unitarios. Resultado: `src/lib/marker-render.ts` y `src/lib/marker-edit.ts` exportan cinco funciones; `document-workspace.tsx` y `App.tsx` las importan sin cambiar comportamiento; se añaden `marker-render.test.ts` (5 casos) y `marker-edit.test.ts` (3). Repo: `/mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui`, rama `main`. Límites: no corregir bugs, no validar claves duplicadas, no tocar UI, estilos, `src/lib/marcado.ts` ni código legacy. Nodo ejecutable único, no agregado; rituales execution/testing/closeout, sin pills ni átomos.

AMBIGUEDADES
1. Cita: “los valores esperados son los que produce hoy el código movido sin cambios” frente a “si un test revela uno, se deja con it.fails”. Si se espera la salida actual, el test no puede revelar un bug; obligaría a inventar si se codifica el comportamiento actual o el deseado.
2. Cita: “bodySourceStart y los marcadores salen de parseMarcadoDocument(slug, source) en src/lib/marcado.ts”. Ese archivo no está en el bundle; obligaría a inventar su firma exacta, retorno y semántica de offsets si no se lee antes.

DRY-RUN
Lecturas: TaskDoc, rituales, `App.tsx`, `document-workspace.tsx`, ejemplo canónico, tests existentes, configuración de Vitest/build. Cambios previstos: crear los dos módulos copiando las funciones; ajustar imports; crear los dos tests; registrar goldens; ejecutar goldens after. Dependencias: Vitest/jsdom, `parseMarcadoDocument`, `MarkerRange`, build de Vite. Validaciones futuras: los cuatro comandos de Validation, más comparación de goldens (2 archivos, 18 tests). Sin ejecutar nada.

FUTURO
El ejecutor produce módulos, tests y `goldens-before/after.txt`. El nodo de cierre o un humano compara goldens, revisa la nota si hay `it.fails`, actualiza el board y decide el commit.
