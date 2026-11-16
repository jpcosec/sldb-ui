import { type MarkerRange } from "./marcado";

export function removeMarkerFromSource(source: string, bodySourceStart: number, marker: MarkerRange): string {
  const body = source.slice(bodySourceStart);
  const nextBody =
    body.slice(0, marker.closeMarkerStart) +
    body.slice(marker.closeMarkerEnd);
  const adjustedOpenStart = marker.openMarkerStart;
  const adjustedOpenEnd = marker.openMarkerEnd;
  const finalBody =
    nextBody.slice(0, adjustedOpenStart) +
    nextBody.slice(adjustedOpenEnd);
  return source.slice(0, bodySourceStart) + finalBody;
}

export function renameMarkerInSource(source: string, bodySourceStart: number, marker: MarkerRange, nextKey: string): string {
  const body = source.slice(bodySourceStart);
  const openRaw = body.slice(marker.openMarkerStart, marker.openMarkerEnd);
  const closeRaw = body.slice(marker.closeMarkerStart, marker.closeMarkerEnd);
  const nextOpenRaw = openRaw.replace(marker.key, nextKey);
  const nextCloseRaw = closeRaw.replace(marker.key, nextKey);
  const nextBody =
    body.slice(0, marker.openMarkerStart) +
    nextOpenRaw +
    body.slice(marker.openMarkerEnd, marker.closeMarkerStart) +
    nextCloseRaw +
    body.slice(marker.closeMarkerEnd);
  return source.slice(0, bodySourceStart) + nextBody;
}
