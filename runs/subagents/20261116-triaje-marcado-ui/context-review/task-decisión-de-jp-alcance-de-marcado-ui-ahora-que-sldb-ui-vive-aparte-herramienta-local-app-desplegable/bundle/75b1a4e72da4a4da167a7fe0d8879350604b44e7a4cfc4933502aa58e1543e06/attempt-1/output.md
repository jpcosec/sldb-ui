REFORMULACION
Propósito: obtener de JP una decisión escrita sobre el alcance de UIs/marcado-ui —herramienta local (A), app desplegable (B) o solo mantenimiento (C)— y sobre el hueco 6 (vista de grafo). Resultado: `docs/decisiones/2026-11-alcance-marcado-ui.md` con opción y respuesta; recibo owner; tareas creadas o descartes justificados; commit en main. Repo: `/home/jp/proyectos/SLDB_1/UIs/marcado-ui`. Límites: no implementar; no tocar UIs/sldb-ui, UIs/marcado ni graph_ui; excluye limpieza y tests ya existentes. Es un nodo de decisión con compuerta humana, no ejecutable de forma autónoma ni agregado de hijos.

AMBIGUEDADES
1. “El coordinador de UIs/marcado-ui presenta a JP las opciones” / “JP responde”: no se define quién es el coordinador, por qué canal se presenta ni cómo se captura la respuesta. Obligaría a inventar el mecanismo de interacción y la sesión.
2. “según la respuesta, crear las tareas de código con deskops add task (host:local para la UI; host:robocop2 para CI o servidor)”: faltan títulos, ids, criterios de aceptación y el mapeo exacto hueco→tarea/host. Obligaría a inventar la descomposición.
3. “--reason ...”: el motivo del recibo owner queda elidido. Obligaría a inventar el texto del reason.
4. “eso se manda a graph_ui como nota”: no se especifica formato, destino ni responsable de la nota. Obligaría a inventar el canal y el contenido.

DRY-RUN
Un ejecutor futuro leería el TaskDoc, los rituales execution/testing/closeout, el reporte vía `git show 7f0579a`, `vite.config.ts` y `scripts/sync-marcado-runtime.mjs`; revisaría Board, pills y átomos (vacíos). Cambios previstos: presentar A/B/C y hueco 6 a JP; esperar respuesta; escribir el documento de decisión; registrar recibo owner con `deskops review record`; crear tareas o dejar constancia de descartes; commit `[skip ci]` a main. Dependencias: decisión de JP, deskops y estado git. Validaciones futuras: `test -s` y `grep` indicados; cierre cuando cada hueco 1,2,6,7,8 tenga id o razón de descarte, recibo aceptado y commit en main.

FUTURO
JP elige A/B/C y decide el hueco 6. Un humano/deskops registra el recibo. Nodos posteriores crean y ejecutan las tareas de código; si aplica, graph_ui recibe la nota y robocop2 asume CI/servidor.
