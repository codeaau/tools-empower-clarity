function base36Timestamp(): string {
  return Math.floor(Date.now()).toString(36);
}
function shortRandom(): string {
  return Math.random().toString(36).slice(2, 8);
}
export function generateId(prefix: "REF" | "EVT"): string {
  return `${prefix}-${base36Timestamp()}-${shortRandom()}`;
}
