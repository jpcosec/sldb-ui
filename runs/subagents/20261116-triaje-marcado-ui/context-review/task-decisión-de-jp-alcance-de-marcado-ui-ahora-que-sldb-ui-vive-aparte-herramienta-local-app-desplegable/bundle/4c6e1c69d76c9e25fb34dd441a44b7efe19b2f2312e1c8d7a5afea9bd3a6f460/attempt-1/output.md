## REFORMULACION

Propósito: obtener y registrar por escrito la decisión de JP sobre el alcance de `UIs/marcado-ui`, ahora que `sldb-ui` vive aparte como proyecto Astro, eligiendo una de tres opciones (A herramienta local, B app desplegable, C solo mantenimiento) y resolviendo explícitamente el hueco 6 (vista de grafo).

Resultado: el archivo `docs/decisiones/2026-11-alcance-marcado-ui.md` con la opción literal, la respuesta del hueco 6 y una tabla de los huecos 1, 2, 6, 7 y 8 con su destino; el recibo owner en deskops; una tarea con contrato completo por cada hueco aceptado (o nota a `graph_ui`); commit en `main` y push de `desk/`, `.sldb/core` y `docs/decisiones/`.

Repo: `UIs/marcado-ui` (remoto `jpcosec/sldb-ui`, reencuadrado y vuelto a `marcado-ui` en 7f0579a).

Límites: no implementar; no tocar `UIs/sldb-ui`, `UIs/marcado` ni `graph_ui` salvo la nota; no cubre limpieza legacy ni tests de helpers. Es un nodo de decisión con puerta humana, no un nodo de código.

## AMBIGUEDADES

1. «La respuesta cuenta solo cuando JP la escribe en el chat» — no define qué chat ni cómo se verifica; obliga a inventar el canal y el criterio de evidencia.
2. «en la sesión del coordinador, <fecha>» — formato de fecha sin especificar; obliga a inventarlo.
3. «se botan 1, 2 y 8 y se crea una tarea task.code para el hueco 7» — no dice por qué solo 7 ni cómo se registra un "botado" con su razón, aunque Done When lo exige.
4. Validación solo comprueba existencia y `grep "Opción (A|B|C)"`; no verifica hueco 6 ni la tabla, quedando por debajo del Done When.
5. «Se commitean solo desk/, .sldb/core y docs/decisiones/» — `.sldb/core` no aparece generado en ningún paso previo.

## DRY-RUN

Lecturas: TaskDoc, rituales (`execution`, `testing`, `closeout`), reporte del drawer vía `git show 7f0579a`, `vite.config.ts`, `scripts/sync-marcado-runtime.mjs`, y el estado de `docs/decisiones/`.

Cambios previstos: crear el documento de decisión; registrar `deskops review record ... --kind owner`; crear tareas hijas con `deskops add task`; opcional `deskops message send --to graph_ui`; commit y push.

Dependencias: respuesta de JP en el chat (bloqueante); CLI `deskops`; `main` limpio.

Validaciones futuras: `test -s` y `grep -E "Opción (A|B|C)"` sobre el documento, más la comprobación manual del Done When.

## FUTURO

JP escribe la letra y la respuesta del hueco 6 en el chat. El coordinador redacta el documento y crea las tareas hijas, que harán su propio desglose. `graph_ui` decide qué hacer con la nota de sugerencia.
