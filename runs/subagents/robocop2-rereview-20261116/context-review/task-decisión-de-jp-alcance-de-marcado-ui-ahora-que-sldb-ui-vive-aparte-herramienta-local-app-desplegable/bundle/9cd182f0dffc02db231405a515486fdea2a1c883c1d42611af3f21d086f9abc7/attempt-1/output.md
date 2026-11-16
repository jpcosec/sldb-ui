## REFORMULACION

**Propósito:** que JP fije por escrito el alcance de marcado-ui (A herramienta local, B app desplegable, C solo mantenimiento) y el destino del hueco 6, y que la decisión quede registrada y accionable.

**Resultado:** `docs/decisiones/2026-11-alcance-marcado-ui.md` con la línea literal "Opción A|B|C", la respuesta del hueco 6 y tabla de los huecos 1, 2, 6, 7 y 8 con destino; recibo owner aceptado; una tarea deskops por hueco aceptado (host:robocop2, contrato completo, preflight/bundle propios); nota a graph_ui si JP lo pide; commit "desk: decisión de alcance de marcado-ui (opción \<letra\>) [skip ci]" en main con push.

**Repo:** `/mnt/ssd/proyectos/SLDB_1/UIs/marcado-ui`; se commitea solo `desk/`, `.sldb/core` y `docs/decisiones/`.

**Límites:** no implementar; no tocar UIs/sldb-ui, UIs/marcado ni graph_ui (salvo la nota); no las tareas de limpieza legacy/tests ya existentes.

**Nodo no ejecutable sin JP:** es un paquete cuya decisión y cuyos hijos (`task.code` por hueco) nacen de la respuesta humana.

## AMBIGUEDADES

1. "El canal es la conversación con JP en esa sesión" / "La respuesta cuenta solo cuando JP la escribe en el chat" — no identifica la sesión ni cómo se verifica; obligaría a inventar canal y prueba.
2. "Por cada hueco que JP acepte, una tarea ... y su contrato completo (tipo, why, goal, scope, implementation_path, files, validation, done_when)" — no dice quién redacta ni con qué contenido; obligaría a inventar goal/validation de tareas aún no decididas.
3. "`--reason \"JP eligió la opción <letra> en la sesión del coordinador, <fecha>\"`" — placeholders; obligaría a inventar fecha y nombre de sesión.
4. "Opción B: ... además del hueco 7" frente a "Por cada hueco que JP acepte" — no aclara si elegir B equivale a aceptar 1, 2, 7 y 8 automáticamente.
5. "la pregunta va escrita en el informe /mnt/ssd/proyectos/SLDB_1/reports/triaje-marcado-ui-20261116.md" — el input no consta de que exista ni ya la contenga; obligaría a asumir su estado.

## DRY-RUN (hipotético, sin ejecutar)

**Lecturas:** TaskDoc; `git show 7f0579a:desk/drawer/report-ui-purpose-gap.md`; `vite.config.ts` (marcadoRuntimePlugin/configureServer); `scripts/sync-marcado-runtime.mjs`; informe de triaje; estado git y board (evitar duplicados).

**Cambios previstos:** escribir/actualizar el doc de decisión; `deskops review record … --kind owner --evidence … --root .`; `deskops add task` por hueco aceptado; `deskops message send --to graph_ui --kind suggestion` si aplica; commit selectivo y push a main.

**Dependencias:** respuesta de JP; CLI deskops disponible; main limpio/actualizado; permisos de push.

**Validaciones futuras:** los dos comandos del TaskDoc (`test -s` y `grep -E "Opción (A|B|C)"`), más comprobar tabla de huecos, mención del hueco 6, recibo aceptado, ids de tareas creadas y commit/push en origin/main.

**Hijos:** cada `task.code` recibe un hueco y su contrato, hace su propio preflight/bundle e implementa; el conjunto se valida por la tabla del doc y la existencia de una tarea por hueco.

## FUTURO

JP elige la letra y responde el hueco 6 en el chat; deskops emite el recibo; graph_ui decide aceptar la sugerencia; cada tarea hija ejecuta su implementación; el push/CI y la revisión humana confirman el cierre.
