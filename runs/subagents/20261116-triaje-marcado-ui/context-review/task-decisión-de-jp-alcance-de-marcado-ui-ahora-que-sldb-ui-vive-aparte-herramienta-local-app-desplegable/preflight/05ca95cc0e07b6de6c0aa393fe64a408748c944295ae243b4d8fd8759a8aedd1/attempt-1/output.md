REFORMULACION

Propósito: obtener de JP una decisión escrita sobre el alcance de UIs/marcado-ui —(A) herramienta local de desarrollo, (B) app desplegable o (C) solo mantenimiento— más una respuesta explícita sobre la vista de grafo (hueco 6). Resultado: `docs/decisiones/2026-11-alcance-marcado-ui.md` con la opción elegida, cada hueco (1,2,6,7,8) como tarea creada o como botado con razón, recibo owner aceptado y commit en main. Repo: UIs/marcado-ui (remoto jpcosec/sldb-ui). Límites: no implementar; no tocar UIs/sldb-ui, UIs/marcado ni graph_ui; excluye las dos tareas de limpieza/tests ya existentes. Nodo ejecutable (decisión + escritura documental), no agregado.

AMBIGUEDADES

1. "presentar a JP las opciones A, B y C" (Scope): no fija canal, formato ni qué cuenta como respuesta de JP. Obligaría a inventar el mecanismo de consulta y el criterio de "respuesta registrada".
2. "--reason ..." (Scope): el placeholder del recibo owner no trae texto. Obligaría a inventar la justificación.
3. "se crean las tareas que correspondan" (Implementation Path): sin títulos, ids ni criterios de aceptación de esas tareas. Obligaría a inventar el desglose.
4. "se manda a graph_ui como nota" (Goal): no define qué es una "nota" ni dónde se registra. Obligaría a inventar el canal (task, issue, mensaje).
5. "se commitea con [skip ci]" (Implementation Path): sin mensaje de commit ni rama explícita. Obligaría a inventar el texto del commit.

DRY-RUN

Lecturas: input de tarea, `report-ui-purpose-gap.md` vía `git show 7f0579a`, `vite.config.ts`, `scripts/sync-marcado-runtime.mjs`, `docs/decisiones/` para ver si el archivo existe. Cambios previstos: crear/actualizar el documento de decisión; registrar `deskops review record --kind owner`; eventualmente `deskops add task` por hueco. Dependencias: respuesta de JP y CLI deskops disponible. Validaciones futuras: `test -s` del documento, `grep -E "Opción (A|B|C)"`, recibo owner aceptado, commit en main. Nada ejecutado.

FUTURO

JP elige opción y decide el hueco 6; el coordinador de UIs/marcado-ui redacta el documento, crea tareas o deja constancia de lo botado, registra el recibo y commitea; si aplica, se emite nota a graph_ui.
