REFORMULACION
Propósito: obtener de JP la decisión de alcance de marcado-ui tras separar sldb-ui: opción A/B/C y destino del hueco 6. Resultado: `docs/decisiones/2026-11-alcance-marcado-ui.md` con opción literal, respuesta del hueco 6 y tabla 1,2,6,7,8; recibo owner; tareas por hueco aceptado y, si aplica, nota a graph_ui; commit/push en main. Repo: `UIs/marcado-ui` (remoto citado `jpcosec/sldb-ui`). Límites: no implementar; no tocar sldb-ui, runtime Python ni graph_ui salvo nota; commitear solo `desk/`, `.sldb/core` y `docs/decisiones/`. No es agregado ni paquete: es tarea de decisión/coordinación con respuesta humana bloqueante.

AMBIGUEDADES
1. “El checkout UIs/marcado-ui (remoto github jpcosec/sldb-ui)” y “en main, y se hace push”: no fija remoto del push; obliga a inventar si se empuja a `jpcosec/sldb-ui` u otro.
2. “Se commitean solo desk/, .sldb/core y docs/decisiones/” no dice relativos a qué raíz; obliga a inventar si están dentro de `UIs/marcado-ui` o en `SLDB_1`.
3. “host:local si es UI o host:robocop2 si es CI o servidor”: el endpoint de producción (hueco 1) y guardado en servidor (8) no se clasifican sin inventar.
4. “Por cada hueco que JP acepte, una tarea ... con su contrato completo”: no da tipo ni contenido de why/goal/validation por hueco; obliga a inventarlos.
5. “la vista de grafo va en marcado-ui o se descarta” frente a “si JP quiere reusarlo, eso se manda a graph_ui”: si JP pide graph_ui, no encaja en el binario; obliga a decidir si es descarte parcial.
6. “--reason '... <fecha>'”: formato de fecha no fijado; obliga a elegir formato.

DRY-RUN
Hipotético: leer TaskDoc, `report-ui-purpose-gap.md`, informe de triaje, `vite.config.ts`, `scripts/sync-marcado-runtime.mjs`, `git show 7f0579a` y estado git. Cambios previstos: escribir/editar el documento de decisión; registrar recibo owner; crear tareas con `deskops add task`; enviar sugerencia a graph_ui si aplica; commit selectivo y push. Dependencias: respuesta de JP en chat, CLI deskops, rama main, permisos de push, IDs de tareas. Validaciones futuras: `test -s`, `grep -E "Opción (A|B|C)"`, recibo aceptado, cada hueco con tarea o descarte, commit en main. Sin ejecutar.

FUTURO
JP elige A/B/C y responde el hueco 6 en el chat. El coordinador registra y crea tareas; cada tarea hija hará su propio desglose e implementación. graph_ui decide sobre la sugerencia. Sin respuesta de JP, el nodo queda bloqueado; no se inventa la decisión.
