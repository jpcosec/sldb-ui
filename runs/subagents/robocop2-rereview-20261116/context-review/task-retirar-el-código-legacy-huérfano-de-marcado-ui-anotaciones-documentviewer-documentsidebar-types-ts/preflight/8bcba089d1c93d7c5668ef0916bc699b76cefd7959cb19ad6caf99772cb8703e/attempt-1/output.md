## REFORMULACION

Encargo ejecutable (task.refactor, no agregado): en el repo `/mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui`, rama `main`, host robocop2, retirar el subsistema legacy huérfano anterior al workspace Marcado. Propósito: eliminar código sin uso que confunde (tipos `Document/Annotation/Frontmatter` ajenos a `MarcadoDocument`). Resultado: borrar con `git rm` exactamente 14 archivos (8 fuentes, 6 tests con 62 tests) sin alterar el comportamiento del workspace; las suites vivas mantienen 4 archivos/23 tests verdes y `npm run build` compila. Límites: no tocar `package.json`, `README.md`, `App.tsx`, `document-workspace.tsx`, `workspace-shell.tsx`, `workspace-navigator.tsx`, `src/lib/*`, funciones ni estilos. Evidencia en `runs/subagents/20261116-marcado-ui-legacy/`; regla de parada: retener el archivo de la lista importado por un vivo y anotarlo en `result-summary.md`.

## AMBIGUEDADES

1. «! grep -rnE "AnnotationPopup|AnnotationsList|DocumentViewer|DocumentSidebar|useAnnotation|utils/frontmatter" src» (Validation) omite `/types["']`, presente en el paso 2. Obliga a inventar si la validación final debe detectar imports vivos de `types.ts`.
2. «Hoy da 4 archivos y 23 tests pasados (9+9+3+2)». No indica qué hacer si el baseline real difiere; obliga a inventar tolerancia o aborto.
3. «todas las coincidencias deben estar en los 14 archivos de la lista; si no, aplicar la regla de parada». Una mención en comentario o string de un vivo no es dependencia; obliga a inventar si cuenta como tal.
4. «rama main» sin exigir árbol limpio ni HEAD `4515a8b`; obliga a inventar conducta ante cambios locales.

## DRY-RUN

Lecturas: TaskDoc, `desk/drawer/report-ui-purpose-gap.md`, `package.json`, `App.tsx`, `document-workspace.tsx`, estado git. Cambios previstos: `git rm` de los 14 archivos; escritura de `goldens-before.txt`, `goldens-after.txt`, `result-summary.md`; registro `deskops review record`. Dependencias: git, node/npm, vitest, CLI deskops, `/dev/shm`. Validaciones futuras (sin ejecutar): suites vivas antes/después (23 tests), grep del paso 2, `npm run build`, `vitest run` completo (4 archivos/23 tests).

## FUTURO

El nodo ejecutor produce el borrado, la evidencia y el commit; un humano decide los casos de la regla de parada, aprueba el cambio y gestiona el merge.
