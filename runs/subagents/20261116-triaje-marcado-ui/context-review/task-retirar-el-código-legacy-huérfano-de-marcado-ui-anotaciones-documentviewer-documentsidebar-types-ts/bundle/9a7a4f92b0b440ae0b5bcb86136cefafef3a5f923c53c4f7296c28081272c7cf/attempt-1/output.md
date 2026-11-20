## REFORMULACION

Encargo: retirar de `UIs/marcado-ui` (rama main, máquina local) el subsistema legacy de anotaciones —8 fuentes y 6 tests— más las referencias residuales en `README.md` y las dependencias de `package.json` usadas solo por esos archivos. Resultado esperado: los 14 archivos fuera de HEAD, sin cambios en `App.tsx`, `document-workspace.tsx`, `workspace-shell.tsx`, `workspace-navigator.tsx` ni `src/lib/*`, con las suites vivas verdes (mismo conteo) y `npm run build` en 0. Límite clave: si compilar un archivo vivo falla, el archivo se restaura y se anota en el handoff. Los rituales enrutados (`execution`, `testing`, `closeout`) llegan vacíos (`steps: []`): no añaden pasos, solo nombran disciplina de alcance, validación mínima primero y cierre tras validar.

## AMBIGUEDADES

1. «las dependencias de package.json que solo usaban esos archivos (verificarlo con grep antes de quitar cualquiera)» — `react-markdown`, `remark-gfm` y `react-icons` podrían usarse en componentes vivos no listados; obliga a inventar el criterio de "solo" y el conjunto final.
2. «después deben ser 4 archivos, con 85 menos los tests borrados» — el input no da el conteo de tests de las 4 suites vivas; obliga a inventar la cifra o a fijarla solo con goldens.
3. «confirmar que solo aparecen en los archivos a borrar» — no dice qué hacer si el grep devuelve un hit en archivo vivo; el único protocolo dado cubre fallo de compilación («se restaura, se deja fuera»).
4. «quitar las referencias que queden en README.md» — el README muestra rutas `tools/marcado-ui` frente al repo real `UIs/marcado-ui`; obliga a decidir si esa ruta cuenta como referencia a corregir.

## DRY-RUN

Lecturas: `App.tsx`, `document-workspace.tsx`, `package.json`, `README.md`, más el grep del paso 2. Cambios previstos: `git rm` de 14 rutas; edición de `package.json` y `README.md` solo si el grep lo respalda. Dependencias: ninguna importación dinámica conocida; los tests borrados importan solo archivos borrados. Validaciones futuras: goldens antes (`vitest run` de las 4 suites + `deskops review record`), goldens después comparando archivo y conteo, `vitest run` completo, `npm run build`, y el grep negativo. Sin ejecutar nada.

## FUTURO

Un humano decide qué dependencias retirar y si se corrige la ruta del README; otro nodo registra los goldens vía `deskops`; el cierre actualiza el Board y prepara commit.
