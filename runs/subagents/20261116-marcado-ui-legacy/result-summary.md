# Resultado: task-retirar-el-código-legacy-huérfano-de-marcado-ui (ejecutor deskops-e-df122955beac)

## Qué se hizo
1. Goldens antes: `TMPDIR=/dev/shm npx vitest run` sobre integration, marcado-ui.ux, marcado-adapter y workspace-state, guardado en goldens-before.txt: 4 archivos, 23 tests pasados, rc 0.
   Registrado con `deskops review record ... --kind goldens` (review-...-goldens-1, input_sha256 8a15bc53...).
2. grep del paso 2: todas las coincidencias estaban dentro de los 14 archivos de la lista. Ningún archivo vivo depende de ellos, así que la regla de parada no se activó.
3. `git rm` de los 14 archivos. El borrado queda en el índice, sin commit.
4. Goldens después (goldens-after.txt): 4 archivos, 23 tests pasados, 0 fallidos. Igual que antes.
5. `npm run build`: exit 0.
6. `npx vitest run` completo: 4 archivos y 23 tests pasados (antes eran 10 archivos y 85 tests; se quitaron 6 archivos y 62 tests).

## Archivos borrados (14)
src/components/AnnotationPopup.tsx, src/components/AnnotationsList.tsx, src/components/DocumentViewer.tsx,
src/components/DocumentSidebar.tsx, src/hooks/useAnnotations.ts, src/hooks/useAnnotationHighlights.ts,
src/types.ts, src/utils/frontmatter.ts, src/__tests__/annotationPopup.test.tsx, src/__tests__/annotationsList.test.tsx,
src/__tests__/documentViewer.test.tsx, src/__tests__/sidebar.test.tsx, src/__tests__/useAnnotations.test.ts,
src/__tests__/utils.test.ts

## Retenidos
Ninguno.

## Validación
Ver validation.log: vitest exit 0, build exit 0 y grep negado exit 0.

## Desvíos
Ninguno. Los cambios en .sldb/ y desk/reviews/ que aparecen en git status los generó `deskops review record`. Los cambios en .sldb/ de RunDoc ya estaban antes de empezar.
