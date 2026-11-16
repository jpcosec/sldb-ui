## REFORMULACION

Propósito: borrar el subsistema legacy huérfano de marcado-ui (anotaciones, DocumentViewer/DocumentSidebar, `types.ts`, `utils/frontmatter`) y sus 6 suites (62 tests), sin alterar el workspace Marcado. Resultado: 14 archivos fuera con `git rm`, grep limpio en `src/`, goldens vivos idénticos (4 archivos/23 tests), `npm run build` exit 0 y vitest global 4/23. Repo `/mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui`, rama main, robocop2. Límites: no tocar package.json, README, App.tsx, document-workspace.tsx, workspace-shell/navigator, `src/lib/*`, estilos ni funciones nuevas; parada con `git restore` y nota en result-summary.md.

## AMBIGUEDADES

1. "Si la compilación de un archivo vivo falla después de un borrado, se aplica la misma regla" vs validación "`! grep -rnE ... src`": con retención el grep seguirá casando y la validación nunca pasará; habría que inventar si se exime.
2. Paso 2 grepea "`useAnnotation`" como prefijo; también casa en comentarios/strings de archivos vivos. Obligaría a inventar si esas coincidencias cuentan como dependencia.
3. La validación final omite "`/types["']`", presente en el paso 2: tras borrar `types.ts`, un import vivo rompería el build sin que el grep final lo vea; habría que decidir qué comando manda.
4. "Verificado el 2026-11-16 sobre el commit 4515a8b" pero "rama main": no se aclara si se ejecuta sobre HEAD o sobre 4515a8b; obligaría a inventar el punto de partida.
5. La instrucción pide "las pills ligadas, los átomos ligados", pero el TaskDoc declara "`pills: []`" y "`atoms: []`": habría que inventar si su ausencia es intencional.

## DRY-RUN

Lecturas: TaskDoc, rituales execution/testing/closeout, 8 fuentes y 6 tests del bundle. Cambios previstos: 1) vitest de las 4 suites vivas → `goldens-before.txt` + `deskops review record`; 2) grep del paso 2 sobre `src`; 3) `git rm` de los 14 (o subconjunto si salta la parada); 4) `goldens-after.txt` y diff con before; 5) `npm run build`; 6) vitest completo. Dependencias: git, node/npm, vitest, deskops, `TMPDIR=/dev/shm`. Validaciones futuras: los tres comandos de Validation, comparación de goldens y conteo 4/23.

## FUTURO

El ejecutor produce `goldens-before/after.txt`, `result-summary.md` con retenciones y el commit; un humano decide si acepta la regla de parada y cierra el ritual closeout. Nada se ejecuta aquí.
