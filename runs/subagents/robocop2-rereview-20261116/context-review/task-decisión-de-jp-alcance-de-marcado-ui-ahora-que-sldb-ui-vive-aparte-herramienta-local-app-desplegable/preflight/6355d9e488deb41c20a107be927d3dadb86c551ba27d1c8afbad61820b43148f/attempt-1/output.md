## REFORMULACION

Encargo: obtener y registrar la decisión de JP sobre el alcance de marcado-ui. Resultado: `docs/decisiones/2026-11-alcance-marcado-ui.md` con la línea literal "Opción A/B/C", la respuesta al hueco 6 y una tabla de los huecos 1, 2, 6, 7 y 8 con destino; recibo owner aceptado; una tarea hija por hueco aceptado; nota a graph_ui si JP reusa su vista de grafo. Repo: `/mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui` (remoto jpcosec/sldb-ui), commit solo de `desk/`, `.sldb/core` y `docs/decisiones/` en `main`, con push. Límites: no implementar; no tocar `UIs/sldb-ui`, `UIs/marcado` ni `graph_ui` salvo la nota; no incluye limpieza legacy ni tests de helpers.

El nodo **no es ejecutable autónomamente**: depende de una respuesta humana en un chat y de un coordinador externo.

## AMBIGUEDADES

1. "La respuesta cuenta solo cuando JP la escribe en el chat." — no define cómo un ejecutor sin sesión accede al chat ni verifica autoría; obligaría a inventar transcript o binding.
2. "la pregunta va escrita en el informe /mnt/ssd/proyectos/SLDB_1/reports/triaje-marcado-ui-20261116.md" — el informe no figura en `files` ni en el input; obligaría a inventar si se crea o ya existe.
3. "--reason \"JP eligió la opción <letra> en la sesión del coordinador, <fecha>\"" — placeholders sin formato; obligaría a inventar fecha y nombre de sesión.
4. "Por cada hueco que JP acepte, una tarea ... con su contrato completo (tipo, why, goal, scope, implementation_path, files, validation, done_when)" — no fija valores ni esquema por hueco; obligaría a inventar el contenido de cada tarea.
5. "para regenerar en CI los .runtime.json (2)" — no indica repo ni plataforma de CI; obligaría a inventar pipeline.
6. "grep -E \"Opción (A|B|C)\"" — pasa aunque aparezcan las tres opciones; no fuerza unicidad de la elegida.
7. "enviar deskops message send --to graph_ui --kind suggestion con el pedido" — no aclara si es obligatorio en A/B o solo si JP lo pide.

## DRY-RUN

Lecturas: `desk/drawer/report-ui-purpose-gap.md`, `git show 7f0579a`, `vite.config.ts`, `scripts/sync-marcado-runtime.mjs`, informe de triaje y el doc de decisión. Cambios previstos: crear el doc, registrar recibo owner, `deskops add task` por hueco aceptado, mensaje a graph_ui opcional, commit "desk: decisión de alcance de marcado-ui (opción <letra>) [skip ci]" y push a `main`. Dependencias: respuesta de JP, CLI `deskops`, sesión del coordinador. Validaciones futuras: `test -s`, `grep` y condiciones de Done When.

## FUTURO

JP elige A, B o C y responde el hueco 6; el coordinador conduce el chat y redacta el informe; un ejecutor futuro crea las tareas hijas con sus preflight y bundle; graph_ui decide sobre la sugerencia.
